import { LUPIN_BONUS_PROFILE, rollCalibratedLupinBonusArt } from './lupin-bonus-profile.js?v=step6n';

export class LupinBonusSystem {
  constructor(rng){this.rng=rng;this.reset();}
  reset(){this.state='IDLE';this.source=null;this.gameCount=0;this.remainingGames=null;this.phase=null;this.hiddenOutcome=null;this.result='UNRESOLVED';this.lastEvent=null;}
  start(source='DEBUG_DIRECT_ENTRY'){
    if(this.state!=='IDLE')return false;
    this.state='ACTIVE';this.source=source;this.gameCount=0;this.remainingGames=LUPIN_BONUS_PROFILE.totalGamesApprox;this.phase='BODY';this.hiddenOutcome=rollCalibratedLupinBonusArt(this.rng)?'ART':'FAIL';this.result='HIDDEN';this.lastEvent='LUPIN_BONUS_START_CALIBRATED_50PCT_OUTCOME';return true;
  }
  completeGame(){
    if(this.state!=='ACTIVE')return this.snapshot();
    this.gameCount+=1;this.remainingGames=Math.max(0,LUPIN_BONUS_PROFILE.totalGamesApprox-this.gameCount);
    if(this.gameCount<=LUPIN_BONUS_PROFILE.bodyGames){this.phase='BODY';this.lastEvent='LUPIN_BONUS_BODY_GAME';return this.snapshot();}
    const battleG=this.gameCount-LUPIN_BONUS_PROFILE.bodyGames;this.phase=`ZENIGATA_BATTLE_G${battleG}`;
    if(this.remainingGames>0){this.lastEvent=`LUPIN_BONUS_FINAL_BATTLE_G${battleG}`;return this.snapshot();}
    this.result=this.hiddenOutcome;this.hiddenOutcome=null;
    if(this.result==='ART'){this.state='SUCCESS_ART_PENDING_GT';this.lastEvent='LUPIN_BONUS_BATTLE_WIN_GOLDEN_TIME_PENDING';}
    else{this.state='FAIL_REVENGE_ENTRY_PENDING';this.lastEvent='LUPIN_BONUS_BATTLE_LOSE_REVENGE_ENTRY_PENDING_UNVERIFIED_RATE';}
    return this.snapshot();
  }
  snapshot(){return{state:this.state,source:this.source,gameCount:this.gameCount,remainingGames:this.remainingGames,phase:this.phase,result:this.result,lastEvent:this.lastEvent,profile:LUPIN_BONUS_PROFILE};}
}
