import { MACHINE } from './config.js';

export class GameLogger {
  constructor(limit = MACHINE.logLimit) {
    this.limit = limit;
    this.rows = [];
  }
  push(result) {
    this.rows.unshift(result);
    if (this.rows.length > this.limit) this.rows.length = this.limit;
  }
  clear() { this.rows = []; }
  toText() {
    if (!this.rows.length) return 'NO DATA';
    return this.rows.map(r => [
      `#${String(r.gameNo).padStart(6,'0')} S${r.setting}`,
      `MODE ${r.mode}`,
      `NORMAL_G ${r.normalGameCount}`,
      `WANTED ${r.wantedCount}`,
      `WANTED_TARGET ${r.wantedTargetZone.min}-${r.wantedTargetZone.max}G`,
      `WANTED_STATE ${r.wantedState}`,
      `WC_G ${r.wantedChanceGameCount}`,
      r.holdCapacity == null ? '' : `HOLD_CAP ${r.holdCapacity}`,
      r.consumedHold ? `HOLD_OUT ${r.consumedHold.type}#${r.consumedHold.id}` : '',
      r.holdQueue?.length ? `HOLD_Q ${r.holdQueue.map(h => `${h.type}#${h.id}`).join('>')}` : '',
      r.event ? `EVENT ${r.event}` : '',
      r.wantedEntrySource ? `WANTED_SRC ${r.wantedEntrySource}` : '',
      `ROLE ${r.role}`,
      `REEL ${r.reelResult.join(' | ')}`,
      `STOP ${r.stopOrder.map(i => ['L','C','R'][i]).join('→')}`,
      `PAY ${r.payout}`,
      `CREDIT ${r.creditBefore} -> ${r.creditAfter}`,
      r.replay ? 'REPLAY' : '',
      `REEL_SRC ${r.reelSource}`,
      `NEXT ${r.nextPhase}`
    ].filter(Boolean).join(' | ')).join('\n');
  }
}
