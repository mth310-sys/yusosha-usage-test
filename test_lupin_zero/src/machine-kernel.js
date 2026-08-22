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
    spinId: 0
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
    if (complete) events.push({ type: 'SPIN_END', reelIndex: index, spinId: state.spinId });
    return result(next, events);
  }

  return result(state, [], false);
}
