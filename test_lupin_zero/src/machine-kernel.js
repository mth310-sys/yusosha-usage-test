import { GameMode } from './game-flow-spec.js';

export const KernelPhase = Object.freeze({
  IDLE: 'IDLE',
  READY: 'READY',
  SPINNING: 'SPINNING',
  STOPPING: 'STOPPING'
});

export function createMachineState({ credit = 50, maxBet = 3 } = {}) {
  return Object.freeze({
    credit,
    maxBet,
    bet: 0,
    phase: KernelPhase.IDLE,
    stopped: Object.freeze([true, true, true]),
    spinId: 0,
    mode: GameMode.NORMAL,
    modeGamesRemaining: null,
    modeEvidenceStatus: 'VERIFIED_LINK'
  });
}

function freezeState(state) {
  return Object.freeze({ ...state, stopped: Object.freeze([...state.stopped]) });
}

function result(state, events = [], accepted = true) {
  return Object.freeze({ state: freezeState(state), events: Object.freeze(events.map((event) => Object.freeze(event))), accepted });
}

export function reduceMachine(state, command = {}) {
  const type = command.type;

  if (type === 'BET_ONE') {
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase) || state.bet >= state.maxBet || state.credit <= 0) {
      return result(state, [], false);
    }
    const next = { ...state, credit: state.credit - 1, bet: state.bet + 1, phase: KernelPhase.READY };
    return result(next, [{ type: 'CHANGE', reason: 'bet-one' }]);
  }

  if (type === 'MAX_BET') {
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase) || state.bet >= state.maxBet || state.credit <= 0) {
      return result(state, [], false);
    }
    const amount = Math.min(state.maxBet - state.bet, state.credit);
    if (amount <= 0) return result(state, [], false);
    const next = { ...state, credit: state.credit - amount, bet: state.bet + amount, phase: KernelPhase.READY };
    return result(next, [{ type: 'CHANGE', reason: 'max-bet' }]);
  }

  if (type === 'START') {
    if (state.phase !== KernelPhase.READY || state.bet <= 0) return result(state, [], false);
    const spinId = state.spinId + 1;
    const next = { ...state, phase: KernelPhase.SPINNING, stopped: [false, false, false], spinId };
    return result(next, [{ type: 'SPIN_START', spinId }]);
  }

  if (type === 'STOP_REEL') {
    const index = command.reelIndex;
    if (![KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase)) return result(state, [], false);
    if (!Number.isInteger(index) || index < 0 || index > 2 || state.stopped[index]) return result(state, [], false);

    const stopped = [...state.stopped];
    stopped[index] = true;
    const complete = stopped.every(Boolean);
    const next = {
      ...state,
      stopped,
      phase: complete ? KernelPhase.IDLE : KernelPhase.STOPPING,
      bet: complete ? 0 : state.bet
    };
    const events = [{ type: 'REEL_STOP', reelIndex: index, spinId: state.spinId, complete }];
    if (complete) events.push({ type: 'SPIN_END', reelIndex: index, spinId: state.spinId, mode: state.mode });
    return result(next, events);
  }

  if (type === 'ENTER_MODE') {
    const mode = command.mode;
    const games = command.games;
    const evidenceStatus = command.evidenceStatus ?? 'UNRESOLVED';
    if (![GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(mode)) return result(state, [], false);
    if (!Number.isInteger(games) || ![10, 20].includes(games)) return result(state, [], false);
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase)) return result(state, [], false);

    const next = {
      ...state,
      mode,
      modeGamesRemaining: games,
      modeEvidenceStatus: evidenceStatus
    };
    return result(next, [{ type: 'MODE_ENTER', mode, games, evidenceStatus }]);
  }

  if (type === 'ADVANCE_MODE_GAME') {
    if (![GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(state.mode)) return result(state, [], false);
    if (!Number.isInteger(state.modeGamesRemaining) || state.modeGamesRemaining <= 0) return result(state, [], false);
    const remaining = state.modeGamesRemaining - 1;
    const next = { ...state, modeGamesRemaining: remaining };
    const events = [{ type: 'MODE_GAME_ADVANCED', mode: state.mode, remaining }];
    if (remaining === 0) events.push({ type: 'MODE_WINDOW_EXHAUSTED', mode: state.mode });
    return result(next, events);
  }

  return result(state, [], false);
}
