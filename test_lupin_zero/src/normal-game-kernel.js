import { MACHINE_EVENTS, MACHINE_SURFACES, machineEvent } from './machine-event-contract.js';

const KNOWN_PAYOUTS = Object.freeze({
  REPLAY: 0,
  THREE_COIN: 3,
  NINE_COIN: 9,
  TEN_COIN: 10,
  MB: 0,
  PREMIUM: 0,
  LEGEND: 0
});

export class NormalGameKernel {
  constructor({ credit = 50, maxBet = 3 } = {}) {
    this.credit = credit;
    this.maxBet = maxBet;
    this.bet = 0;
    this.game = 0;
    this.spinId = 0;
    this.phase = 'IDLE';
    this.resolvedRole = null;
    this.stopped = [true, true, true];
    this.trace = [];
  }

  snapshot() {
    return Object.freeze({
      credit: this.credit,
      bet: this.bet,
      game: this.game,
      spinId: this.spinId,
      phase: this.phase,
      resolvedRole: this.resolvedRole,
      stopped: [...this.stopped]
    });
  }

  emit(type, detail = {}) {
    const event = machineEvent(type, { ...detail, snapshot: this.snapshot() });
    this.trace.push(event);
    return event;
  }

  betMax() {
    if (this.phase !== 'IDLE' || this.credit < this.maxBet) return false;
    this.credit -= this.maxBet;
    this.bet = this.maxBet;
    this.phase = 'READY';
    this.emit(MACHINE_EVENTS.BET_ACCEPTED, { amount: this.maxBet });
    return true;
  }

  leverOn() {
    if (this.phase !== 'READY' || this.bet !== this.maxBet) return false;
    this.spinId += 1;
    this.phase = 'AWAITING_ROLE';
    this.stopped = [false, false, false];
    this.emit(MACHINE_EVENTS.LEVER_ON, { surface: MACHINE_SURFACES.START_LEVER });
    this.emit(MACHINE_EVENTS.REELS_SPIN_START, { surface: MACHINE_SURFACES.PHYSICAL_REELS });
    return true;
  }

  resolveKnownRole(role) {
    if (this.phase !== 'AWAITING_ROLE') return false;
    if (!(role in KNOWN_PAYOUTS)) return false;
    this.resolvedRole = role;
    this.phase = 'SPINNING';
    this.emit(MACHINE_EVENTS.ROLE_RESOLVED, { role });
    this.emit(MACHINE_EVENTS.STOP_BUTTON_ARMED, { surface: MACHINE_SURFACES.STOP_BUTTONS });
    return true;
  }

  stop(index) {
    if (this.phase !== 'SPINNING') return false;
    if (!Number.isInteger(index) || index < 0 || index > 2 || this.stopped[index]) return false;
    this.emit(MACHINE_EVENTS.STOP_BUTTON_PRESSED, { index, surface: MACHINE_SURFACES.STOP_BUTTONS });
    this.stopped[index] = true;
    this.emit(MACHINE_EVENTS.REEL_STOPPED, { index, surface: MACHINE_SURFACES.PHYSICAL_REELS });
    if (this.stopped.every(Boolean)) this.commitGame();
    return true;
  }

  commitGame() {
    const payout = KNOWN_PAYOUTS[this.resolvedRole];
    this.credit += payout;
    this.emit(MACHINE_EVENTS.PAYOUT_COMMITTED, { role: this.resolvedRole, payout });
    this.game += 1;
    this.bet = 0;
    this.phase = 'IDLE';
    this.emit(MACHINE_EVENTS.GAME_COMMITTED, { game: this.game, role: this.resolvedRole });
    this.resolvedRole = null;
  }

  getTrace() {
    return Object.freeze([...this.trace]);
  }
}

export const NORMAL_GAME_KERNEL_POLICY = Object.freeze({
  internalRoleLotteryImplemented: false,
  reason: 'Exact complete role-resolution relationship is not inferred from partial published denominators.',
  unresolvedRoleLottery: 'UNRESOLVED',
  presentationMayReactToEvents: true,
  presentationMayChangeLotteryResult: false
});
