import { MACHINE } from './config.js';
import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole } from './role-lottery.js';
import { CreditSystem } from './credit.js';
import { ReelController } from './reel-controller.js';
import { NormalSystem } from './normal.js?v=step4d';

export class GameCore {
  constructor({setting=1, seed=Date.now()} = {}) {
    this.setting = Number(setting);
    this.profile = getSettingProfile(this.setting);
    this.rng = new RNG(seed);
    this.creditSystem = new CreditSystem(MACHINE.initialCredit, MACHINE.betPerGame);
    this.reels = new ReelController(this.rng);
    this.normal = new NormalSystem(this.rng, this.setting);
    this.gameNo = 0;
    this.phase = 'WAIT_BET';
    this.lastRole = null;
    this.pendingRole = null;
    this.creditBeforeGame = null;
  }
  setSetting(setting) {
    if (this.phase !== 'WAIT_BET') return false;
    this.setting = Number(setting);
    this.profile = getSettingProfile(this.setting);
    this.normal.setSetting(this.setting);
    return true;
  }
  bet() { if (this.phase !== 'WAIT_BET') return false; if (!this.creditSystem.maxBet()) return false; this.phase='WAIT_LEVER'; return true; }
  lever() { if (this.phase !== 'WAIT_LEVER') return null; this.gameNo+=1; this.creditBeforeGame=this.creditSystem.snapshot(); this.pendingRole=drawRole(this.profile,this.rng); this.lastRole=this.pendingRole; this.reels.start(this.pendingRole); this.phase='SPINNING'; return {role:this.pendingRole.name}; }
  stopReel(index) {
    if (this.phase !== 'SPINNING') return null;
    const symbol=this.reels.stop(index); if (symbol==null) return null;
    if (!this.reels.allStopped) return {complete:false,symbol};
    this.phase='RESULT';
    this.creditSystem.settle(this.pendingRole);
    const normal=this.normal.completeGame(); const after=this.creditSystem.snapshot(); const reels=this.reels.snapshot();
    const result={gameNo:this.gameNo,setting:this.setting,mode:normal.mode,normalGameCount:normal.gameCount,wantedCount:normal.wantedCount,wantedCycle:normal.wantedCycle,wantedTargetZone:normal.wantedTargetZone,wantedState:normal.wantedState,wantedEntrySource:normal.wantedEntrySource,wantedChanceGameCount:normal.wantedChanceGameCount,holdCapacity:normal.holdCapacity,holdQueue:normal.holdQueue,consumedHold:normal.lastConsumedHold,pendingReward:normal.pendingReward,transitionSource:normal.transitionSource,cz:normal.cz,event:normal.lastEvent,role:this.pendingRole.name,payout:this.pendingRole.payout,replay:this.pendingRole.replay,creditBefore:this.creditBeforeGame.credit,creditAfter:after.credit,reelResult:reels.result,stopOrder:reels.stopOrder,reelSource:this.pendingRole.name==='MB'?'VERIFIED_MB_PATTERN':'PROVISIONAL',nextPhase:'WAIT_BET'};
    this.pendingRole=null; this.phase='WAIT_BET'; return {complete:true,symbol,result};
  }
  seekWantedForTest(){ if(this.phase!=='WAIT_BET') return false; return this.normal.seekWantedForTest(); }
  injectHoldForTest(type){ if(this.phase!=='WAIT_BET') return false; return this.normal.injectHoldForTest(type); }
  resolveCzForTest(result){ if(this.phase!=='WAIT_BET') return false; return this.normal.resolveCzForTest(result); }
  snapshot(){ return {gameNo:this.gameNo,setting:this.setting,phase:this.phase,role:this.lastRole?.name??'----',normal:this.normal.snapshot(),reels:this.reels.snapshot(),...this.creditSystem.snapshot()}; }
}
