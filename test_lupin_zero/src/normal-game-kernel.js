import { MACHINE_EVENTS, MACHINE_SURFACES, machineEvent } from './machine-event-contract.js';
import { resolveNormalRole } from './normal-role-resolver.js';

const KNOWN_PAYOUTS = Object.freeze({
  REPLAY: 0,
  THREE_COIN: 3,
  NINE_COIN: 9,
  TEN_COIN: 10,
  MB: 0,
  RUPIN_REPLAY_A: 0,
  RUPIN_REPLAY_B: 0,
  RUPIN_REPLAY_C: 0,
  PREMIUM: 0,
  LEGEND: 0
});

export class NormalGameKernel {
  constructor({ credit = 50, maxBet = 3, setting = 1 } = {}) {
    this.credit = credit; this.maxBet = maxBet; this.setting = setting; this.bet = 0; this.game = 0; this.spinId = 0; this.phase = 'IDLE'; this.resolvedRole = null; this.lastRoleResolution = null; this.stopped = [true, true, true]; this.trace = [];
  }
  snapshot() { return Object.freeze({ credit:this.credit,bet:this.bet,game:this.game,spinId:this.spinId,setting:this.setting,phase:this.phase,resolvedRole:this.resolvedRole,lastRoleResolution:this.lastRoleResolution,stopped:[...this.stopped] }); }
  emit(type, detail = {}) { const event = machineEvent(type, { ...detail, snapshot: this.snapshot() }); this.trace.push(event); return event; }
  betMax() { if (this.phase !== 'IDLE' || this.credit < this.maxBet) return false; this.credit -= this.maxBet; this.bet = this.maxBet; this.phase = 'READY'; this.emit(MACHINE_EVENTS.BET_ACCEPTED, { amount: this.maxBet }); return true; }
  leverOn() { if (this.phase !== 'READY' || this.bet !== this.maxBet) return false; this.spinId += 1; this.phase = 'AWAITING_ROLE'; this.stopped = [false,false,false]; this.emit(MACHINE_EVENTS.LEVER_ON,{surface:MACHINE_SURFACES.START_LEVER}); this.emit(MACHINE_EVENTS.REELS_SPIN_START,{surface:MACHINE_SURFACES.PHYSICAL_REELS}); return true; }
  resolveKnownRole(role, metadata = {}) { if (this.phase !== 'AWAITING_ROLE' || !(role in KNOWN_PAYOUTS)) return false; this.resolvedRole=role; this.lastRoleResolution=Object.freeze({kind:'KNOWN_ROLE',role,...metadata}); this.phase='SPINNING'; this.emit(MACHINE_EVENTS.ROLE_RESOLVED,{role,...metadata}); this.emit(MACHINE_EVENTS.STOP_BUTTON_ARMED,{surface:MACHINE_SURFACES.STOP_BUTTONS}); return true; }
  resolveRoleFromRandom(randomSource) { if(this.phase!=='AWAITING_ROLE') return Object.freeze({accepted:false,reason:'INVALID_PHASE'}); const result=resolveNormalRole(randomSource,this.setting); this.lastRoleResolution=result; if(result.kind!=='KNOWN_ROLE') return Object.freeze({accepted:false,reason:'UNRESOLVED_OTHER',result}); const accepted=this.resolveKnownRole(result.role,{evidenceStatus:result.evidenceStatus,setting:result.setting,draw:result.draw}); return Object.freeze({accepted,reason:accepted?'KNOWN_ROLE_RESOLVED':'REJECTED',result}); }
  stop(index) { if(this.phase!=='SPINNING'||!Number.isInteger(index)||index<0||index>2||this.stopped[index]) return false; this.emit(MACHINE_EVENTS.STOP_BUTTON_PRESSED,{index,surface:MACHINE_SURFACES.STOP_BUTTONS}); this.stopped[index]=true; this.emit(MACHINE_EVENTS.REEL_STOPPED,{index,surface:MACHINE_SURFACES.PHYSICAL_REELS}); if(this.stopped.every(Boolean)) this.commitGame(); return true; }
  commitGame() { const payout=KNOWN_PAYOUTS[this.resolvedRole]; this.credit+=payout; this.emit(MACHINE_EVENTS.PAYOUT_COMMITTED,{role:this.resolvedRole,payout}); this.game+=1; this.bet=0; this.phase='IDLE'; this.emit(MACHINE_EVENTS.GAME_COMMITTED,{game:this.game,role:this.resolvedRole}); this.resolvedRole=null; }
  getTrace() { return Object.freeze([...this.trace]); }
}

export const NORMAL_GAME_KERNEL_POLICY = Object.freeze({ internalKnownRoleLotteryImplemented:true,completeRoleLotteryImplemented:false,knownRoleSource:'VERIFIED_SPEC.normalRoleDenominators',unresolvedResidual:'UNRESOLVED_OTHER',unresolvedResidualAutoPayout:false,presentationMayReactToEvents:true,presentationMayChangeLotteryResult:false });
