// Verified reset behavior: a setting change resets the Raiun counter to 0pt.
// Only apply this to the base NORMAL state; special-state reset semantics are not generalized here.
import { GameCore } from './game-core.js?v=step6w';

function resetRaiunCounterAfterSettingChange(core){
  const normal=core?.normal;
  const raiun=normal?.raiun;
  if(!raiun||normal.mode!=='NORMAL')return false;

  raiun.points=0;
  raiun.lastPointAdd=0;
  raiun.pointAddEvents=0;
  raiun.state='COUNTING';
  raiun.highLevel=null;
  raiun.highGameCount=0;
  raiun.highRemainingGames=null;
  raiun.highEntryDenominator=null;
  raiun.highExpectation=null;
  raiun.variant=null;
  raiun.modeGameCount=0;
  raiun.modeRemainingGames=null;
  raiun.result='UNRESOLVED';
  raiun.resultSource='SETTING_CHANGE_VERIFIED_COUNTER_RESET';
  raiun.successModel='NOT_IN_RAIUN_MODE';
  raiun.legendGateRate=null;
  raiun.lastLegendGateGame=null;
  normal.legendGate=null;
  normal.lastEvent='SETTING_CHANGE_RAIUN_COUNTER_RESET_0PT';
  return true;
}

if(!GameCore.prototype.__raiunSettingResetPatched){
  const originalSetSetting=GameCore.prototype.setSetting;
  GameCore.prototype.setSetting=function setSettingWithRaiunReset(setting,...args){
    const ok=originalSetSetting.call(this,setting,...args);
    if(ok)resetRaiunCounterAfterSettingChange(this);
    return ok;
  };
  GameCore.prototype.__raiunSettingResetPatched=true;
}
