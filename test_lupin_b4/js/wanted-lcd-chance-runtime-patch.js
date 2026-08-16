// WANTED CHANCE LCD chance-eye integration.
// Keep exactly one verified lottery per GameCore call. The 8-hold visual/step-up
// presentation remains UNVERIFIED, so this patch must not pre-roll or seed future holds.
import { GameCore } from './game-core.js?v=step6w';
import { rollLcdChance } from './lcd-chance-profile.js?v=step6u';

const WANTED_LCD_SOURCE='VERIFIED_WANTED_LCD_CHANCE_APPEARANCE_EXPECTATION_DESTINATION_TABLE';
const WANTED_LCD_VISUAL_POLICY='VISUAL_STEPUP_DISTRIBUTION_UNVERIFIED';

if(!GameCore.prototype.__wantedLcdChanceRuntimePatched){
  GameCore.prototype.processWantedLcdChance=function processWantedLcdChanceVerified(){
    if(this.normal?.mode!=='WANTED_CHANCE'||!this.normal.holdQueue)return null;
    const hit=rollLcdChance('WANTED_CHANCE',this.rng);
    if(!hit)return null;

    this.normal.holdQueue.injectNext(hit.holdType,'VERIFIED_WANTED_LCD_CHANCE_AUTO',{
      lcdChance:{
        key:hit.key,
        mode:hit.mode,
        won:Boolean(hit.won),
        destination:hit.destination??null,
        denominator:hit.denominator,
        expectationPct:hit.expectationPct,
        source:hit.source
      }
    });
    this.normal.wantedLcdChanceSource=WANTED_LCD_SOURCE;
    this.normal.wantedLcdVisualPolicy=WANTED_LCD_VISUAL_POLICY;
    return this.recordLcdChance(hit);
  };

  const originalLcdChanceSnapshot=GameCore.prototype.lcdChanceSnapshot;
  GameCore.prototype.lcdChanceSnapshot=function lcdChanceSnapshotWithWantedAudit(...args){
    const out=originalLcdChanceSnapshot.apply(this,args);
    return {
      ...out,
      wantedSource:WANTED_LCD_SOURCE,
      wantedVisualPolicy:WANTED_LCD_VISUAL_POLICY,
      wantedRuntimeModel:'ONE_VERIFIED_LOTTERY_PER_GAME_NO_FUTURE_HOLD_PREROLL'
    };
  };

  GameCore.prototype.__wantedLcdChanceRuntimePatched=true;
}
