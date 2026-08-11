import { MACHINE } from './config.js';
import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole } from './role-lottery.js';
import { CreditSystem } from './credit.js';
import { ReelController } from './reel-controller.js';
import { NormalSystem } from './normal.js?v=step6r';
import { GoldenTimeSystem } from './golden-time.js?v=step6r';
import { RevengeChanceSystem } from './revenge-chance.js?v=step6r';
import { LupinBonusSystem } from './lupin-bonus.js?v=step6r';

export class GameCore {
  constructor({setting=1, seed=Date.now()} = {}) { this.setting=Number(setting); this.profile=getSettingProfile(this.setting); this.rng=new RNG(seed); this.creditSystem=new CreditSystem(MACHINE.initialCredit,MACHINE.betPerGame); this.reels=new ReelController(this.rng); this.normal=new NormalSystem(this.rng,this.setting); this.goldenTime=new GoldenTimeSystem(this.rng,this.setting); this.revenge=new RevengeChanceSystem(); this.lupinBonus=new LupinBonusSystem(this.rng); this.gameNo=0; this.phase='WAIT_BET'; this.lastRole=null; this.pendingRole=null; this.creditBeforeGame=null; }
  setSetting(setting){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;this.setting=Number(setting);this.profile=getSettingProfile(this.setting);this.normal.setSetting(this.setting);this.goldenTime.setSetting(this.setting);return true;}
  bet(){const playableGtStates=['IDLE','LUPIN_RUSH_ACTIVE','ACTIVE_SET','EXTRA_BONUS_ACTIVE','GOLD_RUSH_ACTIVE','BATTLE_ACTIVE'];const revengePlayable=this.revenge.state==='ACTIVE';const bonusPlayable=this.lupinBonus.state==='ACTIVE';const normalPlayable=this.revenge.state==='IDLE'&&this.lupinBonus.state==='IDLE'&&playableGtStates.includes(this.goldenTime.state);if(this.phase!=='WAIT_BET'||(!revengePlayable&&!bonusPlayable&&!normalPlayable)||!this.creditSystem.maxBet())return false;this.phase='WAIT_LEVER';return true;}
  lever(){if(this.phase!=='WAIT_LEVER')return null;this.gameNo+=1;this.creditBeforeGame=this.creditSystem.snapshot();this.pendingRole=drawRole(this.profile,this.rng);this.lastRole=this.pendingRole;this.reels.start(this.pendingRole);this.phase='SPINNING';return{role:this.pendingRole.name};}
  stopReel(index){if(this.phase!=='SPINNING')return null;const symbol=this.reels.stop(index);if(symbol==null)return null;if(!this.reels.allStopped)return{complete:false,symbol};this.phase='RESULT';this.creditSystem.settle(this.pendingRole);let normal=this.normal.snapshot(),gt=this.goldenTime.snapshot(),revenge=this.revenge.snapshot(),lupinBonus=this.lupinBonus.snapshot(),mode,event;
    if(this.revenge.state==='ACTIVE'){
      revenge=this.revenge.completeGame();mode='REVENGE_CHANCE';event=revenge.lastEvent;
      if(revenge.state==='FAIL'){this.goldenTime.reset();this.revenge.reset();gt=this.goldenTime.snapshot();revenge=this.revenge.snapshot();mode='NORMAL';event='REVENGE_CHANCE_FAIL_RETURN_NORMAL';}
    }else if(this.lupinBonus.state==='ACTIVE'){
      lupinBonus=this.lupinBonus.completeGame();mode='LUPIN_BONUS';event=lupinBonus.lastEvent;
      if(lupinBonus.state==='SUCCESS_ART_PENDING_GT'){
        this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:'LUPIN_BONUS_WIN_STEP6R'});gt=this.goldenTime.snapshot();this.lupinBonus.reset();lupinBonus=this.lupinBonus.snapshot();mode='GOLDEN_TIME';event='LUPIN_BONUS_WIN_GOLDEN_TIME_AUTO_START';
      }else if(lupinBonus.state==='FAIL_REVENGE_ENTRY_PENDING'){
        this.revenge.reset();this.revenge.offer('LUPIN_BONUS_LOSE');revenge=this.revenge.snapshot();this.lupinBonus.reset();lupinBonus=this.lupinBonus.snapshot();mode='REVENGE_CHANCE_PENDING';event='LUPIN_BONUS_LOSE_REVENGE_ENTRY_PENDING_UNVERIFIED_RATE';
      }
    }else if(this.goldenTime.state!=='IDLE'){
      gt=this.goldenTime.completeGame();mode='GOLDEN_TIME';event=gt.lastEvent;
      if(gt.state==='ART_END_PENDING_RETURN'&&gt.lastEvent==='TREASURE_BATTLE_G4_LOSE_ART_END'){this.revenge.reset();this.revenge.offer('TREASURE_BATTLE_LOSE');revenge=this.revenge.snapshot();mode='REVENGE_CHANCE_PENDING';event='TREASURE_BATTLE_LOSE_REVENGE_ENTRY_PENDING_UNVERIFIED_RATE';}
    }else{normal=this.normal.completeGame();gt=this.goldenTime.snapshot();mode=normal.mode;event=normal.lastEvent;}
    const after=this.creditSystem.snapshot(),reels=this.reels.snapshot();const result={gameNo:this.gameNo,setting:this.setting,mode,normalGameCount:normal.gameCount,wantedCount:normal.wantedCount,wantedCycle:normal.wantedCycle,wantedTargetZone:normal.wantedTargetZone,wantedTargetGame:normal.wantedTargetGame,wantedTargetDistribution:normal.wantedTargetDistribution,wantedState:normal.wantedState,wantedEntrySource:normal.wantedEntrySource,wantedChanceGameCount:normal.wantedChanceGameCount,holdCapacity:normal.holdCapacity,holdQueue:normal.holdQueue,consumedHold:normal.lastConsumedHold,pendingReward:normal.pendingReward,transitionSource:normal.transitionSource,cz:normal.cz,rize:normal.rize,raiun:normal.raiun,legendGate:normal.legendGate,goldenTime:gt,revenge,lupinBonus,event,role:this.pendingRole.name,payout:this.pendingRole.payout,replay:this.pendingRole.replay,creditBefore:this.creditBeforeGame.credit,creditAfter:after.credit,reelResult:reels.result,stopOrder:reels.stopOrder,reelSource:this.pendingRole.name==='MB'?'VERIFIED_MB_PATTERN':'PROVISIONAL',nextPhase:'WAIT_BET'};this.pendingRole=null;this.phase='WAIT_BET';return{complete:true,symbol,result};}
  baseNormalReady(){return this.phase==='WAIT_BET'&&this.goldenTime.state==='IDLE'&&this.revenge.state==='IDLE'&&this.lupinBonus.state==='IDLE';}
  seekWantedForTest(){if(!this.baseNormalReady())return false;return this.normal.seekWantedForTest();}
  injectHoldForTest(type){if(!this.baseNormalReady())return false;return this.normal.injectHoldForTest(type);}
  resolveCzForTest(result){if(!this.baseNormalReady())return false;return this.normal.resolveCzForTest(result);}
  startRizeForTest(variant='RIZE'){if(!this.baseNormalReady()||this.normal.mode!=='NORMAL')return false;return this.normal.startRizeZone(variant,'DEBUG_DIRECT_ENTRY');}
  setRizeBackgroundForTest(background){if(!this.baseNormalReady())return false;return this.normal.setRizeBackgroundForTest(background);}
  resolveRizeForTest(result){if(!this.baseNormalReady())return false;return this.normal.resolveRizeForTest(result);}
  seekRaiun100ForTest(level='LOW'){if(!this.baseNormalReady())return false;return this.normal.seekRaiun100ForTest(level);}
  startRaiunModeForTest(variant='RAIUN'){if(!this.baseNormalReady())return false;return this.normal.startRaiunModeForTest(variant);}
  resolveRaiunForTest(result){if(!this.baseNormalReady())return false;return this.normal.resolveRaiunForTest(result);}
  startLegendGateForTest(){if(!this.baseNormalReady())return false;return this.normal.startLegendGateForTest();}
  setLegendGateMedalsForTest(medals){if(!this.baseNormalReady())return false;return this.normal.setLegendGateMedalsForTest(medals);}
  startGoldenTimeForTest(stocks=0){if(!this.baseNormalReady())return false;return this.goldenTime.start({guaranteedStocks:Number(stocks)||0,source:'DEBUG_DIRECT_ENTRY'});}
  startGoldenTimeFromPending(){if(!this.baseNormalReady())return false;const p=this.normal.pendingReward;if(!p||!['GOLDEN_TIME','GOLDEN_TIME_STOCKS'].includes(p.type))return false;const stocks=p.type==='GOLDEN_TIME_STOCKS'?(Number(p.minStocks)||0):0;const ok=this.goldenTime.start({guaranteedStocks:stocks,source:`PENDING_${p.source}`});if(ok){p.status='ROUTED_TO_GOLDEN_TIME_STEP6R';}return ok;}
  addGoldenTimeStocksForTest(count=1){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.addStocks(count,'DEBUG_ONLY');}
  setGoldenTimeTreasureForTest(points){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.setTreasureForTest(points);}
  applyLupinRushAverageForTest(type){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.applyLupinRushAverageForTest(type);}
  setGoldenTimeStageForTest(stage){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.setStageForTest(stage);}
  setGoldChanceAddedGamesForTest(games){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.setGoldChanceAddedGamesForTest(games);}
  startExtraBonusForTest(){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;if(this.goldenTime.state==='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION'){this.goldenTime.setGoldChanceAddedGamesForTest(Math.round(this.goldenTime.snapshot().extraBonusProfile.averageAddedGames));this.goldenTime.goldChanceSource='DEBUG_PUBLISHED_AVERAGE_18_2_ROUNDED_NOT_REAL_DISTRIBUTION';}return this.goldenTime.startExtraBonus('DEBUG_GOLD_CHANCE_AVERAGE_RESULT');}
  forceExtraSevenForTest(){if(this.phase!=='WAIT_BET'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;return this.goldenTime.forceExtraSevenForTest();}
  startRevengeChanceForTest(){if(this.phase!=='WAIT_BET'||this.lupinBonus.state!=='IDLE')return false;return this.revenge.startForTest();}
  skipRevengeChanceForTest(){if(this.phase!=='WAIT_BET'||!this.revenge.skipForTest())return false;this.goldenTime.reset();this.revenge.reset();return true;}
  resolveRevengeForTest(destination){if(this.phase!=='WAIT_BET'||!this.revenge.resolveForTest(destination))return false;if(destination==='GOLDEN_TIME'){this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:'REVENGE_CHANCE_DIRECT_ART_DEBUG_ROUTE'});this.revenge.reset();return true;}if(destination==='LUPIN_BONUS'){this.goldenTime.reset();this.lupinBonus.reset();this.lupinBonus.start('REVENGE_CHANCE_SUCCESS_DEBUG_ROUTE');this.revenge.reset();return true;}return false;}
  startLupinBonusForTest(){if(!this.baseNormalReady())return false;return this.lupinBonus.start('DEBUG_DIRECT_ENTRY');}
  forceLupinBonusEarlyArtForTest(trigger='BATTLE_WIN'){if(this.phase!=='WAIT_BET'||!this.lupinBonus.forceVerifiedEarlyBattleWinForTest(trigger))return false;this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:`LUPIN_BONUS_EARLY_${trigger}_STEP6R`});this.lupinBonus.reset();return true;}
  snapshot(){return{gameNo:this.gameNo,setting:this.setting,phase:this.phase,role:this.lastRole?.name??'----',normal:this.normal.snapshot(),goldenTime:this.goldenTime.snapshot(),revenge:this.revenge.snapshot(),lupinBonus:this.lupinBonus.snapshot(),reels:this.reels.snapshot(),...this.creditSystem.snapshot()};}
}
