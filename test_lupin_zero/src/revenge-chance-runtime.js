import { GameMode } from './game-flow-spec.js';
import { resolveRevengePullback } from './revenge-chance-resolver.js';
import { PhysicalRoleSession } from './physical-role-session.js';
import { getNormalRoleSettlement } from './normal-role-settlement.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const pullbackRandom = new SeededRandomSource(0x2016080d);
const physicalRandom = new SeededRandomSource(0x2016080e);
const physicalSession = new PhysicalRoleSession({ randomSource: physicalRandom, setting: app.machineSetting ?? 1 });
const wrappedContinuation = core.resolveGoldenTimeContinuation.bind(core);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let pendingRole = null;
let revengeGameStarted = false;

function renderRevenge() {
  const s = core.snapshot();
  if (s.mode !== GameMode.REVENGE_CHANCE) return;
  if (phaseBadge) phaseBadge.textContent = 'REVENGE CHANCE';
  if (stateValue) {
    stateValue.textContent = s.modeResult === 'PENDING_LUPIN_BONUS'
      ? 'LUPIN BONUS'
      : `REVENGE CHANCE ${s.modeGamesRemaining ?? 0}G`;
  }
}

function enterRevengeChance(resolution) {
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.REVENGE_CHANCE,
    modeGamesRemaining: resolution.games,
    modeEvidenceStatus: resolution.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null,
    goldenTimeLastContinuation: Object.freeze({
      continued: false,
      source: 'TREASURE_BATTLE_LOSS_PULLBACK_HIT',
      treasure: resolution.treasure,
      pullbackPercent: resolution.percent,
      evidenceStatus: resolution.evidenceStatus
    })
  });
  core.emit('revenge-chance-enter', {
    games: resolution.games,
    treasure: resolution.treasure,
    pullbackPercent: resolution.percent,
    evidenceStatus: resolution.evidenceStatus
  });
  core.emit('mode-enter', {
    mode: GameMode.REVENGE_CHANCE,
    games: resolution.games,
    evidenceStatus: resolution.evidenceStatus
  });
  if (message) message.textContent = 'REVENGE CHANCE';
  renderRevenge();
  return true;
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
    if (pullback.hit) return enterRevengeChance(pullback);
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
  core.emit('revenge-chance-game-advanced', { remaining });

  if (remaining === 0) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeResult: 'PENDING_LUPIN_BONUS',
      modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    core.emit('revenge-chance-success', {
      destination: GameMode.LUPIN_BONUS,
      evidenceStatus: 'PUBLISHED_ANALYSIS'
    });
    if (message) message.textContent = 'LUPIN BONUS';
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
app.resolveRevengePullback = resolveRevengePullback;
