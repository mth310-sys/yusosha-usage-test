import { GameMode } from './game-flow-spec.js';
import {
  REVENGE_CHANCE_SPEC,
  resolveRevengePullback,
  resolveBonusEndRevengeEntry,
  resolveBonusEndRevengeOutcome
} from './revenge-chance-resolver.js';
import {
  REVENGE_SUCCESS_MECHANISM_SPEC,
  resolveRevengeSuccessMechanism
} from './revenge-success-mechanism-spec.js';
import { PhysicalRoleSession } from './physical-role-session.js';
import { getNormalRoleSettlement } from './normal-role-settlement.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const pullbackRandom = new SeededRandomSource(0x2016080d);
const physicalRandom = new SeededRandomSource(0x2016080e);
const bonusEndEntryRandom = new SeededRandomSource(0x20160814);
const bonusEndOutcomeRandom = new SeededRandomSource(0x20160815);
const physicalSession = new PhysicalRoleSession({ randomSource: physicalRandom, setting: app.machineSetting ?? 1 });
const wrappedContinuation = core.resolveGoldenTimeContinuation.bind(core);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let pendingRole = null;
let revengeGameStarted = false;
let revengeSource = null;
let revengeHiddenOutcome = null;

function renderRevenge() {
  const s = core.snapshot();
  if (s.mode !== GameMode.REVENGE_CHANCE) return;
  if (phaseBadge) phaseBadge.textContent = 'REVENGE CHANCE';
  if (stateValue) {
    stateValue.textContent = s.modeResult === REVENGE_SUCCESS_MECHANISM_SPEC.pendingState
      ? 'REVENGE SUCCESS'
      : `REVENGE CHANCE ${s.modeGamesRemaining ?? 0}G`;
  }
}

function enterRevengeChance(resolution, options = {}) {
  revengeSource = options.source ?? resolution.source ?? 'GT_BATTLE';
  revengeHiddenOutcome = options.hiddenOutcome ?? null;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.REVENGE_CHANCE,
    modeGamesRemaining: resolution.games,
    modeEvidenceStatus: resolution.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null,
    goldenTimeLastContinuation: revengeSource === 'GT_BATTLE'
      ? Object.freeze({
          continued: false,
          source: 'TREASURE_BATTLE_LOSS_PULLBACK_HIT',
          treasure: resolution.treasure,
          pullbackPercent: resolution.percent,
          evidenceStatus: resolution.evidenceStatus
        })
      : core.kernelState.goldenTimeLastContinuation
  });
  core.emit('revenge-chance-enter', {
    games: resolution.games,
    treasure: resolution.treasure ?? null,
    pullbackPercent: resolution.percent ?? null,
    source: revengeSource,
    evidenceStatus: resolution.evidenceStatus
  });
  core.emit('mode-enter', {
    mode: GameMode.REVENGE_CHANCE,
    games: resolution.games,
    source: revengeSource,
    evidenceStatus: resolution.evidenceStatus
  });
  if (message) message.textContent = 'REVENGE CHANCE';
  renderRevenge();
  return true;
}

function tryEnterBonusEndRevengeChance() {
  const entry = resolveBonusEndRevengeEntry(bonusEndEntryRandom);
  core.emit('bonus-end-revenge-entry-resolved', { ...entry });
  if (!entry.hit) return Object.freeze({ entered: false, entry, outcome: null });
  const outcome = resolveBonusEndRevengeOutcome(bonusEndOutcomeRandom);
  enterRevengeChance(entry, { source: 'LUPIN_BONUS_END', hiddenOutcome: outcome });
  return Object.freeze({ entered: true, entry, outcome });
}

function applyRevengeSuccessMechanism(mechanism) {
  const before = core.snapshot();
  if (before.mode !== GameMode.REVENGE_CHANCE || before.modeResult !== REVENGE_SUCCESS_MECHANISM_SPEC.pendingState) {
    return Object.freeze({ applied: false, reason: 'NOT_PENDING_REVENGE_SUCCESS_MECHANISM' });
  }

  const resolution = resolveRevengeSuccessMechanism(mechanism);
  if (!resolution.resolved) {
    core.emit('revenge-chance-success-mechanism-pending', {
      mechanism: resolution.mechanism,
      destination: null,
      destinationCandidates: [...resolution.destinationCandidates],
      evidenceStatus: resolution.evidenceStatus
    });
    return Object.freeze({ applied: false, reason: 'UNRESOLVED_SUCCESS_MECHANISM', resolution });
  }

  core.emit('revenge-chance-success-mechanism-resolved', {
    mechanism: resolution.mechanism,
    destination: resolution.destination,
    evidenceStatus: resolution.evidenceStatus
  });
  core.emit('mode-exit', { from: GameMode.REVENGE_CHANCE, to: resolution.destination });

  if (resolution.destination === GameMode.LUPIN_BONUS) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeResult: 'PENDING_LUPIN_BONUS',
      modeResultEvidenceStatus: resolution.evidenceStatus
    });
    const entered = typeof app.enterLupinBonus === 'function' && app.enterLupinBonus('REVENGE_CHANCE');
    return Object.freeze({ applied: Boolean(entered), resolution });
  }

  if (resolution.destination === GameMode.GOLDEN_TIME) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeResult: 'PENDING_GOLDEN_TIME',
      modeResultEvidenceStatus: resolution.evidenceStatus
    });
    const entered = typeof app.enterGoldenTime === 'function' && Boolean(app.enterGoldenTime());
    return Object.freeze({ applied: entered, resolution });
  }

  return Object.freeze({ applied: false, reason: 'UNSUPPORTED_REVENGE_DESTINATION', resolution });
}

core.resolveGoldenTimeContinuation = (resolution, profile) => {
  const before = core.snapshot();
  if (
    before.mode === GameMode.GOLDEN_TIME
    && before.modeResult === 'PENDING_GT_CONTINUATION'
    && before.goldenTimeStockCount === 0
    && resolution?.continued === false
  ) {
    const pullback = resolveRevengePullback(pullbackRandom, before.goldenTimeTreasure);
    core.emit('revenge-pullback-resolved', { ...pullback });
    if (pullback.hit) return enterRevengeChance(pullback, { source: 'GT_BATTLE' });
  }
  return wrappedContinuation(resolution, profile);
};

core.addEventListener('spin-start', (event) => {
  const s = event.detail.snapshot;
  revengeGameStarted = s.mode === GameMode.REVENGE_CHANCE && s.mbFollowupGamesRemaining === 0 && !s.modeResult;
  pendingRole = revengeGameStarted ? physicalSession.start(event.detail.spinId) : null;
});

core.addEventListener('spin-end', (event) => {
  if (!revengeGameStarted || event.detail.snapshot.mode !== GameMode.REVENGE_CHANCE) return;

  const production = pendingRole?.production ?? null;
  if (production) {
    const settlement = getNormalRoleSettlement(production, 3);
    core.settleNormalRole(settlement);
  }

  const s = core.snapshot();
  const remaining = Math.max(0, (s.modeGamesRemaining ?? 0) - 1);
  core.kernelState = Object.freeze({ ...core.kernelState, modeGamesRemaining: remaining });
  core.emit('revenge-chance-game-advanced', { remaining, source: revengeSource });

  if (remaining === 0) {
    const successful = revengeSource === 'GT_BATTLE' ? true : Boolean(revengeHiddenOutcome?.hit);
    const outcome = revengeHiddenOutcome;
    revengeHiddenOutcome = null;

    if (successful) {
      core.kernelState = Object.freeze({
        ...core.kernelState,
        modeResult: REVENGE_SUCCESS_MECHANISM_SPEC.pendingState,
        modeResultEvidenceStatus: 'UNRESOLVED'
      });
      core.emit('revenge-chance-success', {
        mechanism: null,
        destination: null,
        destinationCandidates: [...REVENGE_CHANCE_SPEC.successDestinations],
        destinationSplit: REVENGE_CHANCE_SPEC.successDestinationSplit,
        source: revengeSource,
        outcome,
        evidenceStatus: 'UNRESOLVED'
      });
      core.emit('revenge-chance-success-mechanism-pending', {
        mechanism: null,
        destination: null,
        destinationCandidates: [...REVENGE_CHANCE_SPEC.successDestinations],
        evidenceStatus: 'UNRESOLVED'
      });
      if (message) message.textContent = 'REVENGE SUCCESS — 復活機構解析待ち';
    } else {
      core.kernelState = Object.freeze({
        ...core.kernelState,
        mode: GameMode.NORMAL,
        modeGamesRemaining: null,
        modeResult: null,
        modeResultEvidenceStatus: null
      });
      core.emit('revenge-chance-failed', {
        source: revengeSource,
        outcome,
        evidenceStatus: 'PUBLISHED_ANALYSIS'
      });
      core.emit('mode-exit', { from: GameMode.REVENGE_CHANCE, to: GameMode.NORMAL });
      if (message) message.textContent = 'REVENGE CHANCE END';
    }
    revengeSource = null;
  } else if (message && !String(message.textContent).includes('PAY') && message.textContent !== 'REPLAY') {
    message.textContent = `REVENGE CHANCE ${remaining}G`;
  }

  pendingRole = null;
  revengeGameStarted = false;
  renderRevenge();
});

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.REVENGE_CHANCE) renderRevenge();
});

app.revengePullbackRandom = pullbackRandom;
app.revengePhysicalRandom = physicalRandom;
app.bonusEndRevengeEntryRandom = bonusEndEntryRandom;
app.bonusEndRevengeOutcomeRandom = bonusEndOutcomeRandom;
app.resolveRevengePullback = resolveRevengePullback;
app.tryEnterBonusEndRevengeChance = tryEnterBonusEndRevengeChance;
app.applyRevengeSuccessMechanism = applyRevengeSuccessMechanism;
app.revengeSuccessMechanismSpec = REVENGE_SUCCESS_MECHANISM_SPEC;
