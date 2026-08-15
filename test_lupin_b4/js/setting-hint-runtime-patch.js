// Verified normal-state LCD setting hints (526 / 634 / 456).
// Presentation RNG is isolated so visual hints do not perturb gameplay lotteries.
import { GameCore } from './game-core.js?v=step6w';
import { LCD_SETTING_HINT_PROFILE, drawLcdSettingHint } from './setting-hint-profile.js?v=step6ag-hint1';

function ensurePresentationRng(core){
  if(core.__lcdSettingHintRng)return core.__lcdSettingHintRng;
  let state=(((core?.rng?.state??0)>>>0)^0x4c555049)>>>0;
  if(!state)state=0x6d2b79f5;
  core.__lcdSettingHintRng={
    next(){
      let x=state;
      x^=x<<13;x^=x>>>17;x^=x<<5;
      state=x>>>0;
      return state/0x100000000;
    }
  };
  return core.__lcdSettingHintRng;
}

function isPlainNormalGame(core){
  return core?.phase==='WAIT_LEVER'&&
    core?.normal?.mode==='NORMAL'&&
    core?.goldenTime?.state==='IDLE'&&
    core?.revenge?.state==='IDLE'&&
    core?.lupinBonus?.state==='IDLE';
}

if(!GameCore.prototype.__lcdSettingHintPatched){
  const originalLever=GameCore.prototype.lever;
  GameCore.prototype.lever=function leverWithLcdSettingHint(...args){
    const eligible=isPlainNormalGame(this);
    const out=originalLever.apply(this,args);
    if(!out)return out;
    this.__pendingLcdSettingHint=eligible?drawLcdSettingHint(this.setting,ensurePresentationRng(this)):null;
    return out;
  };

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithLcdSettingHint(index){
    const out=originalStopReel.call(this,index);
    if(!out?.complete||!out.result)return out;
    const hint=this.__pendingLcdSettingHint?{...this.__pendingLcdSettingHint,gameNo:out.result.gameNo}:null;
    this.__lastLcdSettingHint=hint;
    this.__pendingLcdSettingHint=null;
    out.result.settingHint=hint;
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithLcdSettingHint(...args){
    const snap=originalSnapshot.apply(this,args);
    return {...snap,lcdSettingHint:{last:this.__lastLcdSettingHint?{...this.__lastLcdSettingHint}:null,pending:this.__pendingLcdSettingHint?{...this.__pendingLcdSettingHint}:null,profile:LCD_SETTING_HINT_PROFILE}};
  };

  GameCore.prototype.__lcdSettingHintPatched=true;
}
