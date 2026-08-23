import { MachineState } from './machine-core.js';
import { GameMode } from './game-flow-spec.js';
import { resolveGoldenTimeContinuationPriority } from './golden-time-stock-resolver.js';
import { createTreasureBattlePresentationSession } from './treasure-battle-presentation-session.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const originalResolveGoldenTimeContinuation = core.resolveGoldenTimeContinuation.bind(core);
const originalBetOne = core.betOne.bind(core);
const originalMaxBetNow = core.maxBetNow.bind(core);
const originalStart = core.start.bind(core);

let session = null;
let pendingResolution = null;
let pendingProfile = null;

export const TREASURE_BATTLE_RUNTIME_POLICY = Object.freeze({
  activation: 'INTERCEPT_CONFIRMED_GT_CONTINUATION_RESOLUTION_AFTER_STOCK_PRIORITY',
  stockPriorityPreserved: true,
  usesNormalBetStartStopControls: true,
  usesExistingResearchReelSpin: true,
  presentationAdvanceUnit: 'ONE_COMPLETED_PHYSICAL_SPIN',
  battleRoleLottery: null,
  battlePayoutCoins: null,
  battleRoleAndPayoutEvidenceStatus: 'UNRESOLVED',
  economyAccounting: 'SUSPENDED_UNTIL_BATTLE_ROLE_AND_PAYOUT_ARE_RESOLVED',
  battleBetChangesCredit: false,
  syntheticZeroPayoutForbidden: true,
  outcomeAppliedOnlyAfterFinalPresentationGame: true,
  automaticEntryGameNumber: null,
  automaticEntryGameNumberEvidenceStatus: 'UNRESOLVED'
});

function isBattlePending(snapshot = core.snapshot()) {
  return snapshot.mode === GameMode.GOLDEN_TIME
    && snapshot.modeResult === 'PENDING_GT_CONTINUATION'
    && session?.accepted === true
    && session.snapshot().active === true;
}

function battleElements() {
  return {
    bet: document.querySelector('#betBtn'),
    maxBet: document.querySelector('#maxBetBtn'),
    start: document.querySelector('#startBtn'),
    stops: [...document.querySelectorAll('.stop')],
    message: document.querySelector('#message')
  };
}

function phaseLabel(state = session?.snapshot()) {
  if (!state?.active) return 'TREASURE BATTLE';
  return `TREASURE BATTLE ${state.nextGame}/${state.totalGamesCandidate} ${String(state.nextPhase ?? '').replaceAll('_', ' ')}`;
}

function syncBattleControls() {
  if (!isBattlePending()) return false;
  const snapshot = core.snapshot();
  const elements = battleElements();
  const busy = [MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state);
  const maxBet = core.kernelState.maxBet ?? 3;

  if (elements.bet) elements.bet.disabled = busy || snapshot.bet >= maxBet;
  if (elements.maxBet) elements.maxBet.disabled = busy || snapshot.bet >= maxBet;
  if (elements.start) elements.start.disabled = snapshot.state !== MachineState.READY || snapshot.bet !== maxBet;
  elements.stops.forEach((button, index) => {
    button.disabled = !busy || snapshot.stopped[index];
  });
  if (elements.message && !busy) elements.message.textContent = phaseLabel();
  app.refreshGoldenTimeLcd?.(phaseLabel());
  return true;
}

function armBattleBet(targetBet) {
  if (!isBattlePending()) return false;
  const snapshot = core.snapshot();
  const maxBet = core.kernelState.maxBet ?? 3;
  const nextBet = Math.max(0, Math.min(maxBet, Number(targetBet) || 0));
  if ([MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state) || nextBet <= snapshot.bet) return false;

  core.kernelState = Object.freeze({
    ...core.kernelState,
    bet: nextBet,
    phase: MachineState.READY
  });
  core.emit('change', { reason: 'treasure-battle-bet-arm-no-economy' });
  core.emit('treasure-battle-bet-armed', {
    bet: nextBet,
    creditChanged: false,
    economyAccounting: TREASURE_BATTLE_RUNTIME_POLICY.economyAccounting,
    evidenceStatus: TREASURE_BATTLE_RUNTIME_POLICY.battleRoleAndPayoutEvidenceStatus
  });
  syncBattleControls();
  return true;
}

function prepareSessionFromResolvedContinuation(resolution, profile) {
  if (!resolution || resolution.eligible === false || typeof resolution.continued !== 'boolean') {
    session = null;
    pendingResolution = null;
    pendingProfile = null;
    core.emit('treasure-battle-unresolved', {
      treasure: core.snapshot().goldenTimeTreasure,
      reason: 'CONTINUATION_OUTCOME_UNRESOLVED',
      evidenceStatus: resolution?.evidenceStatus ?? 'UNRESOLVED'
    });
    return false;
  }

  const prepared = Object.freeze({
    eligible: true,
    treasure: core.snapshot().goldenTimeTreasure,
    hiddenOutcome: resolution.continued ? 'WIN' : 'LOSE',
    continuation: resolution,
    evidenceStatus: resolution.evidenceStatus ?? 'UNRESOLVED'
  });
  const nextSession = createTreasureBattlePresentationSession(prepared);
  if (!nextSession.accepted) return false;

  session = nextSession;
  pendingResolution = resolution;
  pendingProfile = profile;
  core.emit('treasure-battle-enter', {
    treasure: prepared.treasure,
    presentation: session.snapshot(),
    outcomeVisibility: 'HIDDEN',
    roleLottery: null,
    payoutCoins: null,
    economyAccounting: TREASURE_BATTLE_RUNTIME_POLICY.economyAccounting,
    roleAndPayoutEvidenceStatus: TREASURE_BATTLE_RUNTIME_POLICY.battleRoleAndPayoutEvidenceStatus
  });
  syncBattleControls();
  return true;
}

core.resolveGoldenTimeContinuation = (resolution, profile) => {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.modeResult !== 'PENDING_GT_CONTINUATION') {
    return originalResolveGoldenTimeContinuation(resolution, profile);
  }

  const priority = resolveGoldenTimeContinuationPriority(snapshot);
  if (priority.route === 'STOCK') return originalResolveGoldenTimeContinuation(resolution, profile);
  if (session?.accepted && session.snapshot().active) return false;
  return prepareSessionFromResolvedContinuation(resolution, profile);
};

core.betOne = () => {
  if (!isBattlePending()) return originalBetOne();
  return armBattleBet(core.snapshot().bet + 1);
};

core.maxBetNow = () => {
  if (!isBattlePending()) return originalMaxBetNow();
  return armBattleBet(core.kernelState.maxBet ?? 3);
};

core.start = () => {
  if (!isBattlePending()) return originalStart();
  const snapshot = core.snapshot();
  const maxBet = core.kernelState.maxBet ?? 3;
  if (snapshot.state !== MachineState.READY || snapshot.bet !== maxBet) return false;

  const spinId = snapshot.spinId + 1;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    phase: MachineState.SPINNING,
    stopped: Object.freeze([false, false, false]),
    spinId
  });
  core.emit('spin-start', { spinId });
  core.emit('treasure-battle-game-started', {
    game: session.snapshot().nextGame,
    phase: session.snapshot().nextPhase,
    phaseNote: session.snapshot().nextPhaseNote,
    roleLottery: null,
    payoutCoins: null,
    economyAccounting: TREASURE_BATTLE_RUNTIME_POLICY.economyAccounting,
    evidenceStatus: session.snapshot().evidenceStatus
  });
  syncBattleControls();
  return true;
};

core.addEventListener('golden-time-battle-ready', () => {
  if (session?.accepted && session.snapshot().active) queueMicrotask(syncBattleControls);
});
core.addEventListener('change', () => {
  if (isBattlePending()) queueMicrotask(syncBattleControls);
});
core.addEventListener('reel-stop', () => {
  if (isBattlePending()) queueMicrotask(syncBattleControls);
});

core.addEventListener('spin-end', (event) => {
  if (!isBattlePending(event.detail.snapshot)) return;
  const progressed = session.advanceConfirmedBattleGame();
  core.emit('treasure-battle-presentation', {
    game: progressed.justCompletedGame,
    phase: progressed.justCompletedPhase,
    phaseNote: progressed.justCompletedPhaseNote,
    completed: progressed.completed,
    outcomeVisibility: progressed.outcomeRevealedNow ? 'REVEALED' : 'HIDDEN',
    revealedOutcome: progressed.revealedOutcome,
    roleLottery: null,
    payoutCoins: null,
    economyAccounting: TREASURE_BATTLE_RUNTIME_POLICY.economyAccounting,
    roleAndPayoutEvidenceStatus: TREASURE_BATTLE_RUNTIME_POLICY.battleRoleAndPayoutEvidenceStatus
  });

  const elements = battleElements();
  if (!progressed.completed) {
    if (elements.message) elements.message.textContent = phaseLabel(progressed);
    syncBattleControls();
    return;
  }

  const resolution = pendingResolution;
  const profile = pendingProfile;
  session = null;
  pendingResolution = null;
  pendingProfile = null;
  if (elements.message) elements.message.textContent = progressed.revealedOutcome === 'WIN' ? 'TREASURE BATTLE WIN' : 'TREASURE BATTLE LOSE';
  app.refreshGoldenTimeLcd?.(`TREASURE BATTLE ${progressed.revealedOutcome}`);
  originalResolveGoldenTimeContinuation(resolution, profile);
});

core.addEventListener('golden-time-continued', () => {
  session = null;
  pendingResolution = null;
  pendingProfile = null;
});
core.addEventListener('golden-time-ended', () => {
  session = null;
  pendingResolution = null;
  pendingProfile = null;
});

app.getTreasureBattleRuntimeState = () => Object.freeze({
  active: isBattlePending(),
  presentation: session?.snapshot() ?? null,
  hasPendingResolution: Boolean(pendingResolution),
  battleRoleLottery: null,
  battlePayoutCoins: null,
  economyAccounting: TREASURE_BATTLE_RUNTIME_POLICY.economyAccounting,
  roleAndPayoutEvidenceStatus: TREASURE_BATTLE_RUNTIME_POLICY.battleRoleAndPayoutEvidenceStatus
});
app.treasureBattleRuntimePolicy = TREASURE_BATTLE_RUNTIME_POLICY;
