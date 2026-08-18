import { LUPIN_BONUS_PROFILE, rollCalibratedLupinBonusArt } from './lupin-bonus-profile.js?v=step6o';

export class LupinBonusSystem {
  constructor(rng){this.rng=rng;this.reset();}
  reset(){this.state='IDLE';this.source=null;this.gameCount=0;this.remainingGames=null;this.phase=null;this.hiddenOutcome=null;this.result='UNRESOLVED';this.presentationCue=null;this.lastEvent=null;}
  start(source='DEBUG_DIRECT_ENTRY'){
    if(this.state!=='IDLE')return false;
    this.state='ACTIVE';this.source=source;this.gameCount=0;this.remainingGames=LUPIN_BONUS_PROFILE.totalGamesApprox;this.phase='EPISODE_BODY';this.hiddenOutcome=rollCalibratedLupinBonusArt(this.rng)?'ART':'FAIL';this.result='HIDDEN';this.presentationCue='11_EPISODE_PROGRESS_STRUCTURE_VERIFIED_TIMING_UNRESOLVED';this.lastEvent='LUPIN_BONUS_START_CALIBRATED_50PCT_OUTCOME';return true;
  }
  forceVerifiedEarlyBattleWinForTest(trigger='BATTLE_WIN'){
    if(this.state!=='ACTIVE'||this.gameCount>=LUPIN_BONUS_PROFILE.bodyGames)return false;
    this.state='SUCCESS_ART_PENDING_GT';this.phase='EARLY_BATTLE_WIN';this.result='ART';this.hiddenOutcome=null;this.presentationCue=trigger==='TYPEWRITER'?'TYPEWRITER_VERY_HIGH_EXPECTATION_DEBUG_WIN':'EARLY_BATTLE_WIN_VERIFIED_ROUTE';this.lastEvent=`LUPIN_BONUS_EARLY_${trigger}_ART_DEBUG_ROUTE`;return true;
  }
  completeGame(){
    if(this.state!=='ACTIVE')return this.snapshot();
    this.gameCount+=1;this.remainingGames=Math.max(0,LUPIN_BONUS_PROFILE.totalGamesApprox-this.gameCount);
    if(this.gameCount<=LUPIN_BONUS_PROFILE.bodyGames){
      this.phase='EPISODE_BODY';
      this.presentationCue='HOLD_CHANGE_CAN_SIGNAL_BATTLE_TYPEWRITER_VERY_HIGH_EXPECTATION_RATES_UNVERIFIED';
      this.lastEvent='LUPIN_BONUS_BODY_GAME';return this.snapshot();
    }
    const battleG=this.gameCount-LUPIN_BONUS_PROFILE.bodyGames;this.phase=`ZENIGATA_BATTLE_G${battleG}`;
    this.presentationCue='BULLET_EVASION_ART_CONFIRMED_ARREST_CAN_REVIVE_BY_SHUTTER';
    if(this.remainingGames>0){this.lastEvent=`LUPIN_BONUS_FINAL_BATTLE_G${battleG}`;return this.snapshot();}
    this.result=this.hiddenOutcome;this.hiddenOutcome=null;
    if(this.result==='ART'){this.state='SUCCESS_ART_PENDING_GT';this.presentationCue='FINAL_BATTLE_WIN_ART';this.lastEvent='LUPIN_BONUS_BATTLE_WIN_GOLDEN_TIME_PENDING';}
    else{this.state='FAIL_REVENGE_ENTRY_PENDING';this.presentationCue='ARREST_NO_REVIVAL_MODELLED_RESULT_FAIL';this.lastEvent='LUPIN_BONUS_BATTLE_LOSE_REVENGE_ENTRY_PENDING_UNVERIFIED_RATE';}
    return this.snapshot();
  }
  snapshot(){return{state:this.state,source:this.source,gameCount:this.gameCount,remainingGames:this.remainingGames,phase:this.phase,result:this.result,presentationCue:this.presentationCue,lastEvent:this.lastEvent,profile:LUPIN_BONUS_PROFILE};}
}
