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
      spinId: this.kernelState.spinId
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
          spinId: event.spinId
        });
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
}
