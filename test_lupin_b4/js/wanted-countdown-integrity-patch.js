// Step 6Z: audit verified WANTED 10G countdown and changed-hold freeze rule.
import { NormalSystem } from './normal.js?v=step6w';
import { WANTED_CHANCE_PROFILE } from './wanted-profile.js?v=step6s';

if(!NormalSystem.prototype.__step6zWantedCountdownIntegrityPatched){
  const originalComplete=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function(...args){
    const watching=this.mode==='WANTED_CHANCE';
    const before=watching?{
      remaining:Number(this.wantedChanceRemaining),
      gameCount:Number(this.wantedChanceGameCount),
      holds:this.holdQueue?.snapshot?.()??[],
      mode:this.mode
    }:null;
    const changedPending=before?.holds?.some(h=>h.type!=='NORMAL')??false;
    const out=originalComplete.apply(this,args);
    if(watching){
      const routed=this.mode!=='WANTED_CHANCE'&&this.wantedChanceResult==='SUCCESS_ROUTE';
      const failedCycle=this.wantedCycle==='POST_WC_FAILURE'&&this.mode==='NORMAL'&&this.wantedChanceResult==='FAIL';
      const expectedRemaining=changedPending?before.remaining:Math.max(0,before.remaining-1);
      const countdownValid=routed||failedCycle||Number(this.wantedChanceRemaining)===expectedRemaining;
      const gameCountValid=routed||failedCycle||Number(this.wantedChanceGameCount)===before.gameCount+1;
      const freezeFlagValid=routed||failedCycle||Boolean(this.wantedChanceFrozen)===changedPending;
      const boundsValid=routed||failedCycle||(Number(this.wantedChanceRemaining)>=0&&Number(this.wantedChanceRemaining)<=WANTED_CHANCE_PROFILE.baseGames);
      const failAtZeroValid=!failedCycle||expectedRemaining===0;
      const failed=Object.entries({countdownValid,gameCountValid,freezeFlagValid,boundsValid,failAtZeroValid}).filter(([,v])=>!v).map(([k])=>k);
      this.lastWantedCountdownIntegrity={status:failed.length?'ERROR_WANTED_COUNTDOWN_INTEGRITY':'OK',changedPending,routed,failedCycle,beforeRemaining:before.remaining,expectedRemaining,afterRemaining:this.wantedChanceRemaining,beforeGameCount:before.gameCount,afterGameCount:this.wantedChanceGameCount,freeze:this.wantedChanceFrozen,checks:{countdownValid,gameCountValid,freezeFlagValid,boundsValid,failAtZeroValid},failed};
    }
    return out;
  };
  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastWantedCountdownIntegrity:this.lastWantedCountdownIntegrity?{...this.lastWantedCountdownIntegrity}:null};};
  NormalSystem.prototype.__step6zWantedCountdownIntegrityPatched=true;
}
