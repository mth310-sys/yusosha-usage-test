export const MachineState = Object.freeze({
  IDLE: 'IDLE',
  READY: 'READY',
  SPINNING: 'SPINNING',
  STOPPING: 'STOPPING'
});

export class MachineCore extends EventTarget {
  constructor({ credit = 50, maxBet = 3 } = {}) {
    super();
    this.credit = credit;
    this.maxBet = maxBet;
    this.bet = 0;
    this.state = MachineState.IDLE;
    this.stopped = [true, true, true];
    this.spinId = 0;
  }

  snapshot() {
    return Object.freeze({
      credit: this.credit,
      bet: this.bet,
      state: this.state,
      stopped: [...this.stopped],
      spinId: this.spinId
    });
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail: { ...detail, snapshot: this.snapshot() } }));
  }

  betOne() {
    if (this.state === MachineState.SPINNING || this.state === MachineState.STOPPING) return false;
    if (this.bet >= this.maxBet || this.credit <= 0) return false;
    this.credit -= 1;
    this.bet += 1;
    this.state = MachineState.READY;
    this.emit('change', { reason: 'bet-one' });
    return true;
  }

  maxBetNow() {
    if (this.state === MachineState.SPINNING || this.state === MachineState.STOPPING) return false;
    let changed = false;
    while (this.bet < this.maxBet && this.credit > 0) {
      this.credit -= 1;
      this.bet += 1;
      changed = true;
    }
    if (changed) {
      this.state = MachineState.READY;
      this.emit('change', { reason: 'max-bet' });
    }
    return changed;
  }

  start() {
    if (this.state !== MachineState.READY || this.bet <= 0) return false;
    this.spinId += 1;
    this.state = MachineState.SPINNING;
    this.stopped = [false, false, false];
    this.emit('spin-start', { spinId: this.spinId });
    return true;
  }

  stop(reelIndex) {
    if (![MachineState.SPINNING, MachineState.STOPPING].includes(this.state)) return false;
    if (!Number.isInteger(reelIndex) || reelIndex < 0 || reelIndex > 2 || this.stopped[reelIndex]) return false;
    this.stopped[reelIndex] = true;
    this.state = this.stopped.every(Boolean) ? MachineState.IDLE : MachineState.STOPPING;
    if (this.state === MachineState.IDLE) {
      this.bet = 0;
      this.emit('spin-end', { spinId: this.spinId });
    } else {
      this.emit('reel-stop', { reelIndex, spinId: this.spinId });
    }
    return true;
  }
}
