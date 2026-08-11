import { MACHINE } from './config.js';
import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole } from './role-lottery.js';
import { CreditSystem } from './credit.js';
import { ReelController } from './reel-controller.js';
import { NormalSystem } from './normal.js?v=step6g';
import { GoldenTimeSystem } from './golden-time.js?v=step6g';

export class GameCore {
  constructor({setting=1, seed=Date.now()} = {}) { this.setting=Number(setting); this.profile=getSettingProfile(this.setting); this.rng=new RNG(seed); this.creditSystem=new CreditSystem(MACHINE.initialCredit,MACHINE.betPerGame); this.reels=new ReelController(this.rng); this.normal=new NormalSystem(this.rng,this.setting); this.goldenTime=new GoldenTimeSystem(this.rng,this.setting); this.gameNo=0; this.phase='WAIT_BET'; this.lastRole=null; this.pendingRole=null; this.creditBeforeGame=null; }
  setSetting(setting){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;this.setting=Number(setting);this.profile=getSettingProfile(this.setting);this.normal.setSetting(this.setting);this.goldenTime.setSetting(this.setting);return true;}
  bet(){const playableGtStates=['IDLE','LUPIN_RUSH_ACTIVE','ACTIVE_SET','EXTRA_BONUS_ACTIVE'];if(this.phase!=='WAIT_BET'||!playableGtStates.includes(this.goldenTime.state)||!this.creditSystem.maxBet())return false;this.phase='WAIT_LEVER';return true;}
  lever(){if(this.phase!=='WAIT_LEVER')return null;this.gameNo+=1;this.creditBeforeGame=this.creditSystem.snapshot();this.pendingRole=drawRole(this.profile,this.rng);this.lastRole=this.pendingRole;this.reels.start(this.pendingRole);this.phase='SPINNING';return{role:this.pendingRole.name};}
  stopReel(index){if(this.phase!=='SPINNING')return null;const symbol=this.reels.stop(index);if(symbol==null)return null;if(!this.reels.allStopped)return{complete:false,symbol};this.phase='RESULT';this.creditSystem.settle(this.pendingRole);let normal,gt,mode,event;if(this.goldenTime.state!=='IDLE'){gt=this.goldenTime.completeGame();normal=this.normal.snapshot();mode='GOLDEN_TIME';event=gt.lastEvent;}else{normal=this.normal.completeGame();gt=this.goldenTime.snapshot();mode=normal.mode;event=normal.lastEvent;}const after=this.creditSystem.snapshot(),reels=this.reels.snapshot();const result={gameNo:this.gameNo,setting:this.setting,mode,normalGameCount:normal.gameCount,wantedCount:normal.wantedCount,wantedCycle:normal.wantedCycle,wantedTargetZone:normal.wantedTargetZone,wantedState:normal.wantedState,wantedEntrySource:normal.wantedEntrySource,wantedChanceGameCount:normal.wantedChanceGameCount,holdCapacity:normal.holdCapacity,holdQueue:normal.holdQueue,consumedHold:normal.lastConsumedHold,pendingReward:normal.pendingReward,transitionSource:normal.transitionSource,cz:normal.cz,rize:normal.rize,raiun:normal.raiun,legendGate:normal.legendGate,goldenTime:gt,event,role:this.pendingRole.name,payout:this.pendingRole.payout,replay:this.pendingRole.replay,creditBefore:this.creditBeforeGame.credit,creditAfter:after.credit,reelResult:reels.result,stopOrder:reels.stopOrder,reelSource:this.pendingRole.name==='MB'?'VERIFIED_MB_PATTERN':'PROVISIONAL',nextPhase:'WAIT_BET'};this.pendingRole=null;this.phase='WAIT_BET';return{complete:true,symbol,result};}
  seekWantedForTest(){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.seekWantedForTest();}
  injectHoldForTest(type){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.injectHoldForTest(type);}
  resolveCzForTest(result){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.resolveCzForTest(result);}
  startRizeForTest(variant='RIZE'){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE'||this.normal.mode!=='NORMAL')return false;return this.normal.startRizeZone(variant,'DEBUG_DIRECT_ENTRY');}
  setRizeBackgroundForTest(background){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.setRizeBackgroundForTest(background);}
  resolveRizeForTest(result){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.resolveRizeForTest(result);}
  seekRaiun100ForTest(level='LOW'){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.seekRaiun100ForTest(level);}
  startRaiunModeForTest(variant='RAIUN'){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.startRaiunModeForTest(variant);}
  resolveRaiunForTest(result){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.resolveRaiunForTest(result);}
  startLegendGateForTest(){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.startLegendGateForTest();}
  setLegendGateMedalsForTest(medals){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.normal.setLegendGateMedalsForTest(medals);}
  startGoldenTimeForTest(stocks=0){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;return this.goldenTime.start({guaranteedStocks:Number(stocks)||0,source:'DEBUG_DIRECT_ENTRY'});}
  startGoldenTimeFromPending(){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE')return false;const p=this.normal.pendingReward;if(!p||!['GOLDEN_TIME','GOLDEN_TIME_STOCKS'].includes(p.type))return false;const stocks=p.type==='GOLDEN_TIME_STOCKS'?(Number(p.minStocks)||0):0;const ok=this.goldenTime.start({guaranteedStocks:stocks,source:`PENDING_${p.source}`});if(ok){p.status='ROUTED_TO_GOLDEN_TIME_STEP6G';}return ok;}
  addGoldenTimeStocksForTest(count=1){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.addStocks(count,'DEBUG_ONLY');}
  setGoldenTimeTreasureForTest(points){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.setTreasureForTest(points);}
  applyLupinRushAverageForTest(type){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.applyLupinRushAverageForTest(type);}
  setGoldenTimeStageForTest(stage){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.setStageForTest(stage);}
  startExtraBonusForTest(){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.startExtraBonus('DEBUG_CONFIRMED_1M_ROUTE');}
  forceExtraSevenForTest(){if(this.phase!=='WAIT_BET')return false;return this.goldenTime.forceExtraSevenForTest();}
  snapshot(){return{gameNo:this.gameNo,setting:this.setting,phase:this.phase,role:this.lastRole?.name??'----',normal:this.normal.snapshot(),goldenTime:this.goldenTime.snapshot(),reels:this.reels.snapshot(),...this.creditSystem.snapshot()};}
}
