import { MACHINE } from './config.js';

export class GameLogger {
  constructor(limit = MACHINE.logLimit) { this.limit = limit; this.rows = []; }
  push(result) { this.rows.unshift(result); if (this.rows.length > this.limit) this.rows.length = this.limit; }
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
      r.transitionSource ? `TRANSITION_SRC ${r.transitionSource}` : '',
      r.pendingReward ? `PENDING ${r.pendingReward.type}` : '',
      r.cz ? `CZ ${r.cz.type} ${r.cz.state} RESULT_${r.cz.result} SCN_${r.cz.scenario} G${r.cz.gameCount}/${r.cz.totalGames} REM${r.cz.remainingGames}` : '',
      r.rize ? `RIZE ${r.rize.variant} ${r.rize.state} BG_${r.rize.background} CONF_${r.rize.backgroundConfidence}% RESULT_${r.rize.result}` : '',
      r.raiun ? `RAIUN ${r.raiun.state} PT_${r.raiun.points} HIGH_${r.raiun.highLevel??'-'} HG_${r.raiun.highGameCount}/${r.raiun.highRemainingGames??'-'} VAR_${r.raiun.variant??'-'} MG_${r.raiun.modeGameCount} REM_${r.raiun.modeRemainingGames??'-'} RESULT_${r.raiun.result}` : '',
      r.legendGate ? `LEGEND_GATE ${r.legendGate.state} MEDALS_${r.legendGate.medals} MIN_STOCKS_${r.legendGate.minGtStocks??'-'}` : '',
      r.goldenTime?.state!=='IDLE' ? `GT ${r.goldenTime.state} SET_${r.goldenTime.setNo} G_${r.goldenTime.gameInSet}/${r.goldenTime.profile.setGamesApprox} REM_${r.goldenTime.remainingGames} STOCK_${r.goldenTime.guaranteedStocks}` : '',
      r.event ? `EVENT ${r.event}` : '',
      r.wantedEntrySource ? `WANTED_SRC ${r.wantedEntrySource}` : '',
      r.wantedTargetSettingHint ? `HINT_WANTED G${r.wantedTargetSettingHint.targetGame} / ${r.wantedTargetSettingHint.meaning}` : '',
      r.settingHint ? `HINT_LCD ${r.settingHint.digits} / ${r.settingHint.meaning}` : '',
      r.machineDescriptionSettingHint ? `HINT_DESC ${r.machineDescriptionSettingHint.text} / ${r.machineDescriptionSettingHint.meaning}` : '',
      r.typewriterSettingHint ? `HINT_TYPEWRITER ${r.typewriterSettingHint.text} / ${r.typewriterSettingHint.meaning}` : '',
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
