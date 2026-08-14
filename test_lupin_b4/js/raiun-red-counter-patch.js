// Verified Raiun red-counter behavior.
// Natural BLUE->RED promotion probability remains UNVERIFIED and is not implemented here.
// Once RED exists: the next 100pt Raiun high is the published HIGH rank (1/13.3, ~40%),
// RED survives LUPIN BONUS, and is cleared when GOLDEN TIME starts.
import { GameCore } from './game-core.js?v=step6w';
import { NormalSystem } from './normal.js?v=step6w';

function ensureCounterColor(normal){
  if(!normal?.raiun)return null;
  if(!['BLUE','RED'].includes(normal.raiun.counterColor))normal.raiun.counterColor='BLUE';
  return normal.raiun.counterColor;
}

function clearRedForArt(core,source){
  const raiun=core?.normal?.raiun;
  if(!raiun)return false;
  ensureCounterColor(core.normal);
  if(raiun.counterColor!=='RED')return false;
  raiun.counterColor='BLUE';
  raiun.counterColorSource=`${source}_VERIFIED_ART_CLEAR`;
  return true;
}

if(!NormalSystem.prototype.__raiunRedCounterPatched){
  NormalSystem.prototype.setRaiunCounterRedForTest=function setRaiunCounterRedForTest(){
    if(this.mode!=='NORMAL'||!this.raiun)return false;
    this.raiun.counterColor='RED';
    this.raiun.counterColorSource='DEBUG_ONLY_RED_STATE_FOR_VERIFIED_POST_PROMOTION_BEHAVIOR';
    this.lastEvent='DEBUG_RAIUN_COUNTER_RED';
    return true;
  };

  const originalCompleteGame=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function completeGameWithVerifiedRedCounter(...args){
    ensureCounterColor(this);
    const out=originalCompleteGame.apply(this,args);
    ensureCounterColor(this);
    if(this.mode==='NORMAL'&&this.raiun?.counterColor==='RED'&&this.raiun.points>=100&&this.raiun.state==='100PT_READY_HIGH_LEVEL_UNVERIFIED'){
      this.beginRaiunHigh('HIGH','VERIFIED_RED_COUNTER_100PT_HIGH');
      this.raiun.counterColorSource='VERIFIED_RED_COUNTER_PERSISTS_UNTIL_ART';
      return this.snapshot();
    }
    return out;
  };

  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function snapshotWithRaiunCounterColor(...args){
    ensureCounterColor(this);
    return originalSnapshot.apply(this,args);
  };

  NormalSystem.prototype.__raiunRedCounterPatched=true;
}

if(!GameCore.prototype.__raiunRedCounterPatched){
  GameCore.prototype.setRaiunCounterRedForTest=function setRaiunCounterRedForTest(){
    if(!this.baseNormalReady?.())return false;
    return this.normal.setRaiunCounterRedForTest();
  };

  const originalSetSetting=GameCore.prototype.setSetting;
  GameCore.prototype.setSetting=function setSettingWithRedCounterClear(setting,...args){
    const ok=originalSetSetting.call(this,setting,...args);
    if(ok&&this.normal?.raiun){
      this.normal.raiun.counterColor='BLUE';
      this.normal.raiun.counterColorSource='SETTING_CHANGE_VERIFIED_RESET';
    }
    return ok;
  };

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithRedCounterArtClear(index){
    const out=originalStopReel.call(this,index);
    if(out?.complete&&out.result?.mode==='GOLDEN_TIME')clearRedForArt(this,'GOLDEN_TIME_START');
    return out;
  };

  const originalStartGoldenTimeForTest=GameCore.prototype.startGoldenTimeForTest;
  GameCore.prototype.startGoldenTimeForTest=function startGoldenTimeForTestWithRedCounterClear(...args){
    const ok=originalStartGoldenTimeForTest.apply(this,args);
    if(ok)clearRedForArt(this,'DEBUG_GOLDEN_TIME_START');
    return ok;
  };

  const originalStartGoldenTimeFromPending=GameCore.prototype.startGoldenTimeFromPending;
  GameCore.prototype.startGoldenTimeFromPending=function startGoldenTimeFromPendingWithRedCounterClear(...args){
    const ok=originalStartGoldenTimeFromPending.apply(this,args);
    if(ok)clearRedForArt(this,'PENDING_GOLDEN_TIME_START');
    return ok;
  };

  GameCore.prototype.__raiunRedCounterPatched=true;
}
