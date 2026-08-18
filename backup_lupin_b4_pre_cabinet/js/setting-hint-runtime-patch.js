// Verified normal-state setting hints: LCD numerals, machine-description windows, and typewriter hint.
// Presentation RNG is isolated so visual hints do not perturb gameplay lotteries.
import { GameCore } from './game-core.js?v=step6w';
import {
  LCD_SETTING_HINT_PROFILE,
  MACHINE_DESCRIPTION_HINT_PROFILE,
  TYPEWRITER_SETTING_HINT_PROFILE,
  drawLcdSettingHint,
  drawMachineDescriptionSettingHint,
  drawTypewriterSettingHint
} from './setting-hint-profile.js?v=step6ai-hint3';

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
  GameCore.prototype.lever=function leverWithSettingHints(...args){
    const eligible=isPlainNormalGame(this);
    const out=originalLever.apply(this,args);
    if(!out)return out;
    if(eligible){
      const presentationRng=ensurePresentationRng(this);
      this.__pendingLcdSettingHint=drawLcdSettingHint(this.setting,presentationRng);
      this.__pendingMachineDescriptionSettingHint=drawMachineDescriptionSettingHint(this.setting,presentationRng);
      this.__pendingTypewriterSettingHint=drawTypewriterSettingHint(this.setting,presentationRng);
    }else{
      this.__pendingLcdSettingHint=null;
      this.__pendingMachineDescriptionSettingHint=null;
      this.__pendingTypewriterSettingHint=null;
    }
    return out;
  };

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithSettingHints(index){
    const out=originalStopReel.call(this,index);
    if(!out?.complete||!out.result)return out;
    const lcdHint=this.__pendingLcdSettingHint?{...this.__pendingLcdSettingHint,gameNo:out.result.gameNo}:null;
    const machineDescriptionHint=this.__pendingMachineDescriptionSettingHint?{...this.__pendingMachineDescriptionSettingHint,gameNo:out.result.gameNo}:null;
    const typewriterHint=this.__pendingTypewriterSettingHint?{...this.__pendingTypewriterSettingHint,gameNo:out.result.gameNo}:null;
    this.__lastLcdSettingHint=lcdHint;
    this.__lastMachineDescriptionSettingHint=machineDescriptionHint;
    this.__lastTypewriterSettingHint=typewriterHint;
    this.__pendingLcdSettingHint=null;
    this.__pendingMachineDescriptionSettingHint=null;
    this.__pendingTypewriterSettingHint=null;
    out.result.settingHint=lcdHint;
    out.result.machineDescriptionSettingHint=machineDescriptionHint;
    out.result.typewriterSettingHint=typewriterHint;
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithSettingHints(...args){
    const snap=originalSnapshot.apply(this,args);
    return {
      ...snap,
      lcdSettingHint:{last:this.__lastLcdSettingHint?{...this.__lastLcdSettingHint}:null,pending:this.__pendingLcdSettingHint?{...this.__pendingLcdSettingHint}:null,profile:LCD_SETTING_HINT_PROFILE},
      machineDescriptionSettingHint:{last:this.__lastMachineDescriptionSettingHint?{...this.__lastMachineDescriptionSettingHint}:null,pending:this.__pendingMachineDescriptionSettingHint?{...this.__pendingMachineDescriptionSettingHint}:null,profile:MACHINE_DESCRIPTION_HINT_PROFILE},
      typewriterSettingHint:{last:this.__lastTypewriterSettingHint?{...this.__lastTypewriterSettingHint}:null,pending:this.__pendingTypewriterSettingHint?{...this.__pendingTypewriterSettingHint}:null,profile:TYPEWRITER_SETTING_HINT_PROFILE}
    };
  };

  GameCore.prototype.__lcdSettingHintPatched=true;
}
