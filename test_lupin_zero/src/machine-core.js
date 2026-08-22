import { createMachineState, reduceMachine, KernelPhase } from './machine-kernel.js';

export const MachineState = KernelPhase;

export class MachineCore extends EventTarget {
  constructor({ credit = 50, maxBet = 3 } = {}) {
    super();
    this.kernelState = createMachineState({ credit, maxBet });
  }

  snapshot() {
    return Object.freeze({
      credit: this.kernelState.credit,
      bet: this.kernelState.bet,
      state: this.kernelState.phase,
      stopped: [...this.kernelState.stopped],
      spinId: this.kernelState.spinId,
      mode: this.kernelState.mode,
      modeGamesRemaining: this.kernelState.modeGamesRemaining,
      modeEvidenceStatus: this.kernelState.modeEvidenceStatus
    });
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail: { ...detail, snapshot: this.snapshot() } }));
  }

  apply(command) {
    const reduced = reduceMachine(this.kernelState, command);
    if (!reduced.accepted) return false;
    this.kernelState = reduced.state;

    for (const event of reduced.events) {
      if (event.type === 'CHANGE') this.emit('change', { reason: event.reason });
      if (event.type === 'SPIN_START') this.emit('spin-start', { spinId: event.spinId });
      if (event.type === 'REEL_STOP') {
        this.emit('reel-stop', {
          reelIndex: event.reelIndex,
          spinId: event.spinId,
          complete: event.complete
        });
      }
      if (event.type === 'SPIN_END') {
        this.emit('spin-end', {
          reelIndex: event.reelIndex,
          spinId: event.spinId,
          mode: event.mode
        });
      }
      if (event.type === 'MODE_ENTER') {
        this.emit('mode-enter', {
          mode: event.mode,
          games: event.games,
          evidenceStatus: event.evidenceStatus
        });
      }
      if (event.type === 'MODE_GAME_ADVANCED') {
        this.emit('mode-game-advanced', {
          mode: event.mode,
          remaining: event.remaining
        });
      }
      if (event.type === 'MODE_WINDOW_EXHAUSTED') {
        this.emit('mode-window-exhausted', { mode: event.mode });
      }
    }
    return true;
  }

  betOne() {
    return this.apply({ type: 'BET_ONE' });
  }

  maxBetNow() {
    return this.apply({ type: 'MAX_BET' });
  }

  start() {
    return this.apply({ type: 'START' });
  }

  stop(reelIndex) {
    return this.apply({ type: 'STOP_REEL', reelIndex });
  }

  enterMode(mode, games, evidenceStatus = 'UNRESOLVED') {
    return this.apply({ type: 'ENTER_MODE', mode, games, evidenceStatus });
  }

  advanceModeGame() {
    return this.apply({ type: 'ADVANCE_MODE_GAME' });
  }
}
