import { MACHINE } from './config.js';
import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole } from './role-lottery.js';
import { CreditSystem } from './credit.js';
import { ReelController } from './reel-controller.js';
import { NormalSystem } from './normal.js?v=step6w';
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { RevengeChanceSystem } from './revenge-chance.js?v=step6w';
import { LupinBonusSystem } from './lupin-bonus.js?v=step6w';
import { LCD_CHANCE_PROFILE, rollLcdChance } from './lcd-chance-profile.js?v=step6w';
import { NEXT_INITIAL_HIT_PROFILE, drawNextInitialHit } from './next-initial-hit-profile.js?v=step6w';

export class GameCore {
  constructor({setting=1, seed=Date.now()} = {}) {
    this.setting=Number(setting);this.profile=getSettingProfile(this.setting);this.rng=new RNG(seed);
    this.creditSystem=new CreditSystem(MACHINE.initialCredit,MACHINE.betPerGame);this.reels=new ReelController(this.rng);
    this.normal=new NormalSystem(this.rng,this.setting);this.goldenTime=new GoldenTimeSystem(this.rng,this.setting);this.revenge=new RevengeChanceSystem();this.lupinBonus=new LupinBonusSystem(this.rng);
    this.lcdChance={last:null,totalHits:0,weakHits:0,middleHits:0,strongHits:0,normalHits:0,wantedHits:0,wonHits:0,profile:LCD_CHANCE_PROFILE};
    this.nextInitialHit=null;this.nextInitialHitDraws=0;this.nextInitialHitConsumed=0;this.lastInitialHitResolution=null;
    this.drawNextInitialHitReservation('BOOTSTRAP_USING_VERIFIED_END_TABLE');
    this.gameNo=0;this.phase='WAIT_BET';this.lastRole=null;this.pendingRole=null;this.creditBeforeGame=null;
  }
  drawNextInitialHitReservation(source='BONUS_OR_ART_END'){
    const draw=drawNextInitialHit(this.setting,this.rng);this.nextInitialHit={...draw,reservationSource:source,drawNo:++this.nextInitialHitDraws};return this.nextInitialHit;
  }
  consumeNextInitialHit(source){
    if(!this.nextInitialHit)this.drawNextInitialHitReservation('FALLBACK_MISSING_RESERVATION');
    const reservation={...this.nextInitialHit};this.nextInitialHit=null;this.nextInitialHitConsumed+=1;
    this.lastInitialHitResolution={...reservation,consumedBy:source,consumedNo:this.nextInitialHitConsumed};return this.lastInitialHitResolution;
  }
  nextInitialHitSnapshot(){return{reservation:this.nextInitialHit?{...this.nextInitialHit}:null,lastResolution:this.lastInitialHitResolution?{...this.lastInitialHitResolution}:null,draws:this.nextInitialHitDraws,consumed:this.nextInitialHitConsumed,profile:NEXT_INITIAL_HIT_PROFILE};}
  setSetting(setting){if(this.phase!=='WAIT_BET'||this.goldenTime.state!=='IDLE'||this.revenge.state!=='IDLE'||this.lupinBonus.state!=='IDLE')return false;this.setting=Number(setting);this.profile=getSettingProfile(this.setting);this.normal.setSetting(this.setting);this.goldenTime.setSetting(this.setting);this.drawNextInitialHitReservation('SETTING_CHANGE_DEBUG_REDRAW');return true;}
  bet(){const playableGtStates=['IDLE','LUPIN_RUSH_ACTIVE','ACTIVE_SET','EXTRA_BONUS_ACTIVE','GOLD_RUSH_ACTIVE','BATTLE_ACTIVE'];const revengePlayable=this.revenge.state==='ACTIVE';const bonusPlayable=this.lupinBonus.state==='ACTIVE';const normalPlayable=this.revenge.state==='IDLE'&&this.lupinBonus.state==='IDLE'&&playableGtStates.includes(this.goldenTime.state);if(this.phase!=='WAIT_BET'||(!revengePlayable&&!bonusPlayable&&!normalPlayable)||!this.creditSystem.maxBet())return false;this.phase='WAIT_LEVER';return true;}
  lever(){if(this.phase!=='WAIT_LEVER')return null;this.gameNo+=1;this.creditBeforeGame=this.creditSystem.snapshot();this.pendingRole=drawRole(this.profile,this.rng);this.lastRole=this.pendingRole;this.reels.start(this.pendingRole);this.phase='SPINNING';return{role:this.pendingRole.name};}
  recordLcdChance(hit){if(!hit)return null;this.lcdChance.totalHits+=1;if(hit.mode==='NORMAL')this.lcdChance.normalHits+=1;else if(hit.mode==='WANTED_CHANCE')this.lcdChance.wantedHits+=1;if(hit.won)this.lcdChance.wonHits+=1;if(hit.key==='WEAK_BLUE')this.lcdChance.weakHits+=1;else if(hit.key==='MIDDLE_RED')this.lcdChance.middleHits+=1;else if(hit.key==='STRONG_7')this.lcdChance.strongHits+=1;this.lcdChance.last={...hit,gameNo:this.gameNo};return this.lcdChance.last;}
  processWantedLcdChance(){if(this.normal.mode!=='WANTED_CHANCE'||!this.normal.holdQueue)return null;const hit=rollLcdChance('WANTED_CHANCE',this.rng);if(!hit)return null;this.normal.holdQueue.injectNext(hit.holdType,'AUTO_LCD_CHANCE');return this.recordLcdChance(hit);}
  processNormalLcdChance(){if(this.normal.mode!=='NORMAL')return null;const hit=rollLcdChance('NORMAL',this.rng);if(!hit)return null;this.recordLcdChance(hit);if(!hit.won)return hit;const source=`NORMAL_LCD_${hit.key}_VERIFIED_ROUTE`;if(hit.destination==='LB_OR_GT'){this.normal.pendingReward={type:'LB_OR_GT',source,guarantee:'NORMAL_INITIAL_HIT',status:'NEXT_INITIAL_HIT_RESERVATION_READY'};this.normal.transitionSource=source;this.normal.lastEvent=`${source}_NEXT_INITIAL_HIT_READY`;}else if(hit.destination==='FUJIKO_ZONE'||hit.destination==='DOROBO_ZONE'){this.normal.startCz(hit.destination,source);this.normal.transitionSource=source;this.normal.lastEvent=`${source}_${hit.destination}_AUTO`;}return hit;}
  resolveNormalInitialHitPending(){
    const p=this.normal.pendingReward;if(!p||p.type!=='LB_OR_GT')return null;
    const resolved=this.consumeNextInitialHit(p.source);p.status=`AUTO_RESOLVED_${resolved.type}_VERIFIED_NEXT_HIT_TABLE`;
    if(resolved.type==='LUPIN_BONUS'){
      this.lupinBonus.reset();this.lupinBonus.start(`NEXT_INITIAL_HIT_${p.source}`);return{destination:'LUPIN_BONUS',event:'NEXT_INITIAL_HIT_LUPIN_BONUS_AUTO'};
    }
    this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:`NEXT_INITIAL_HIT_${p.source}`});return{destination:'GOLDEN_TIME',event:'NEXT_INITIAL_HIT_GOLDEN_TIME_AUTO'};
  }
  stopReel(index){if(this.phase!=='SPINNING')return null;const symbol=this.reels.stop(index);if(symbol==null)return null;if(!this.reels.allStopped)return{complete:false,symbol};this.phase='RESULT';this.creditSystem.settle(this.pendingRole);let normal=this.normal.snapshot(),gt=this.goldenTime.snapshot(),revenge=this.revenge.snapshot(),lupinBonus=this.lupinBonus.snapshot(),mode,event;
    if(this.revenge.state==='ACTIVE'){
      revenge=this.revenge.completeGame();mode='REVENGE_CHANCE';event=revenge.lastEvent;
      if(revenge.state==='FAIL'){this.goldenTime.reset();this.revenge.reset();gt=this.goldenTime.snapshot();revenge=this.revenge.snapshot();mode='NORMAL';event='REVENGE_CHANCE_FAIL_RETURN_NORMAL';}
    }else if(this.lupinBonus.state==='ACTIVE'){
      lupinBonus=this.lupinBonus.completeGame();mode='LUPIN_BONUS';event=lupinBonus.lastEvent;
      if(lupinBonus.state==='SUCCESS_ART_PENDING_GT'){
        this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:'LUPIN_BONUS_WIN_STEP6W'});gt=this.goldenTime.snapshot();this.lupinBonus.reset();lupinBonus=this.lupinBonus.snapshot();mode='GOLDEN_TIME';event='LUPIN_BONUS_WIN_GOLDEN_TIME_AUTO_START';
      }else if(lupinBonus.state==='FAIL_REVENGE_ENTRY_PENDING'){
        this.drawNextInitialHitReservation('LUPIN_BONUS_END_VERIFIED_TIMING');this.revenge.reset();this.revenge.offer('LUPIN_BONUS_LOSE');revenge=this.revenge.snapshot();this.lupinBonus.reset();lupinBonus=this.lupinBonus.snapshot();mode='REVENGE_CHANCE_PENDING';event='LUPIN_BONUS_LOSE_REVENGE_ENTRY_PENDING_NEXT_HIT_REDRAWN';
      }
    }else if(this.goldenTime.state!=='IDLE'){
      gt=this.goldenTime.completeGame();mode='GOLDEN_TIME';event=gt.lastEvent;
      if(gt.state==='ART_END_PENDING_RETURN'&&gt.lastEvent==='TREASURE_BATTLE_G4_LOSE_ART_END'){
        this.drawNextInitialHitReservation('ART_END_VERIFIED_TIMING');this.revenge.reset();this.revenge.offer('TREASURE_BATTLE_LOSE');revenge=this.revenge.snapshot();mode='REVENGE_CHANCE_PENDING';event='TREASURE_BATTLE_LOSE_REVENGE_ENTRY_PENDING_NEXT_HIT_REDRAWN';
      }
    }else{
      const normalModeBefore=this.normal.mode;normal=this.normal.completeGame();let lcdHit=null;
      if(normalModeBefore==='WANTED_CHANCE'&&normal.mode==='WANTED_CHANCE')lcdHit=this.processWantedLcdChance();else if(normalModeBefore==='NORMAL'&&normal.mode==='NORMAL')lcdHit=this.processNormalLcdChance();
      const routed=this.resolveNormalInitialHitPending();normal=this.normal.snapshot();gt=this.goldenTime.snapshot();lupinBonus=this.lupinBonus.snapshot();
      if(routed){mode=routed.destination;event=routed.event;}
      else{mode=normal.mode;if(lcdHit){const outcome=lcdHit.won?`WIN_${lcdHit.destination}`:'MISS';event=`LCD_CHANCE_${lcdHit.mode}_${lcdHit.key}_${outcome}`;}else event=normal.lastEvent;}
    }
    const after=this.creditSystem.snapshot(),reels=this.reels.snapshot();const result={gameNo:this.gameNo,setting:this.setting,mode,normalGameCount:normal.gameCount,wantedCount:normal.wantedCount,wantedCycle:normal.wantedCycle,wantedTargetZone:normal.wantedTargetZone,wantedTargetGame:normal.wantedTargetGame,wantedTargetDistribution:normal.wantedTargetDistribution,wantedState:normal.wantedState,wantedEntrySource:normal.wantedEntrySource,wantedChanceGameCount:normal.wantedChanceGameCount,wantedChanceRemaining:normal.wantedChanceRemaining,wantedChanceFrozen:normal.wantedChanceFrozen,wantedChanceResult:normal.wantedChanceResult,holdCapacity:normal.holdCapacity,holdQueue:normal.holdQueue,consumedHold:normal.lastConsumedHold,pendingReward:normal.pendingReward,transitionSource:normal.transitionSource,cz:normal.cz,rize:normal.rize,raiun:normal.raiun,legendGate:normal.legendGate,lcdChance:this.lcdChanceSnapshot(),nextInitialHit:this.nextInitialHitSnapshot(),goldenTime:gt,revenge,lupinBonus,event,role:this.pendingRole.name,payout:this.pendingRole.payout,replay:this.pendingRole.replay,creditBefore:this.creditBeforeGame.credit,creditAfter:after.credit,reelResult:reels.result,stopOrder:reels.stopOrder,reelSource:this.pendingRole.name==='MB'?'VERIFIED_MB_PATTERN':'PROVISIONAL',nextPhase:'WAIT_BET'};this.pendingRole=null;this.phase='WAIT_BET';return{complete:true,symbol,result};}
  lcdChanceSnapshot(){return{last:this.lcdChance.last?{...this.lcdChance.last}:null,totalHits:this.lcdChance.totalHits,weakHits:this.lcdChance.weakHits,middleHits:this.lcdChance.middleHits,strongHits:this.lcdChance.strongHits,normalHits:this.lcdChance.normalHits,wantedHits:this.lcdChance.wantedHits,wonHits:this.lcdChance.wonHits,profile:this.lcdChance.profile};}
  baseNormalReady(){return this.phase==='WAIT_BET'&&this.goldenTime.state==='IDLE'&&this.revenge.state==='IDLE'&&this.lupinBonus.state==='IDLE';}
  seekWantedForTest(){if(!this.baseNormalReady())return false;return this.normal.seekWantedForTest();}
  injectHoldForTest(type){if(!this.baseNormalReady())return false;return this.normal.injectHoldForTest(type);}
  resolveCzForTest(result){if(!this.baseNormalReady())return false;const ok=this.normal.resolveCzForTest(result);if(ok&&result==='SUCCESS')this.resolveNormalInitialHitPending();return ok;}
  startRizeForTest(variant='RIZE'){if(!this.baseNormalReady()||this.normal.mode!=='NORMAL')return false;return this.normal.startRizeZone(variant,'DEBUG_DIRECT_ENTRY');}
  setRizeBackgroundForTest(background){if(!this.baseNormalReady())return false;return this.normal.setRizeBackgroundForTest(background);}
  resolveRizeForTest(result){if(!this.baseNormalReady())return false;const ok=this.normal.resolveRizeForTest(result);if(ok&&result==='SUCCESS')this.resolveNormalInitialHitPending();return ok;}
  seekRaiun100ForTest(level='LOW'){if(!this.baseNormalReady())return false;return this.normal.seekRaiun100ForTest(level);}
  startRaiunModeForTest(variant='RAIUN'){if(!this.baseNormalReady())return false;return this.normal.startRaiunModeForTest(variant);}
  resolveRaiunForTest(result){if(!this.baseNormalReady())return false;return this.normal.resolveRaiunForTest(result);}
  startLegendGateForTest(){if(!this.baseNormalReady())return false;return this.normal.startLegendGateForTest();}
  setLegendGateMedalsForTest(medals){if(!this.baseNormalReady())return false;return this.normal.setLegendGateMedalsForTest(medals);}
  startGoldenTimeForTest(stocks=0){if(!this.baseNormalReady())return false;return this.goldenTime.start({guaranteedStocks:Number(stocks)||0,source:'DEBUG_DIRECT_ENTRY'});}
  startGoldenTimeFromPending(){if(!this.baseNormalReady())return false;const p=this.normal.pendingReward;if(!p||!['GOLDEN_TIME','GOLDEN_TIME_STOCKS'].includes(p.type))return false;const stocks=p.type==='GOLDEN_TIME_STOCKS'?(Number(p.minStocks)||0):0;const ok=this.goldenTime.start({guaranteedStocks:stocks,source:`PENDING_${p.source}`});if(ok){p.status='ROUTED_TO_GOLDEN_TIME_STEP6W';}return ok;}
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
  forceLupinBonusEarlyArtForTest(trigger='BATTLE_WIN'){if(this.phase!=='WAIT_BET'||!this.lupinBonus.forceVerifiedEarlyBattleWinForTest(trigger))return false;this.goldenTime.reset();this.goldenTime.start({guaranteedStocks:0,source:`LUPIN_BONUS_EARLY_${trigger}_STEP6W`});this.lupinBonus.reset();return true;}
  snapshot(){return{gameNo:this.gameNo,setting:this.setting,phase:this.phase,role:this.lastRole?.name??'----',normal:this.normal.snapshot(),lcdChance:this.lcdChanceSnapshot(),nextInitialHit:this.nextInitialHitSnapshot(),goldenTime:this.goldenTime.snapshot(),revenge:this.revenge.snapshot(),lupinBonus:this.lupinBonus.snapshot(),reels:this.reels.snapshot(),...this.creditSystem.snapshot()};}
}
