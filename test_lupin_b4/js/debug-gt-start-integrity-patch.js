// Step 6Z: keep DEBUG Golden Time entry/setters from coercing invalid numeric inputs.
import { GameCore } from './game-core.js?v=step6w';
import { GoldenTimeSystem } from './golden-time.js?v=step6w';

if(!GameCore.prototype.__step6zDebugGtStartInputGuardPatched){
  const originalStartGoldenTimeForTest=GameCore.prototype.startGoldenTimeForTest;
  GameCore.prototype.startGoldenTimeForTest=function startGoldenTimeForTestFailClosed(stocks=0,...args){
    if(typeof stocks!=='number'||!Number.isFinite(stocks)||!Number.isInteger(stocks)||stocks<0)return false;
    return originalStartGoldenTimeForTest.call(this,stocks,...args);
  };
  GameCore.prototype.__step6zDebugGtStartInputGuardPatched=true;
}

if(!GoldenTimeSystem.prototype.__step6zDebugTreasureInputGuardPatched){
  const originalSetTreasureForTest=GoldenTimeSystem.prototype.setTreasureForTest;
  GoldenTimeSystem.prototype.setTreasureForTest=function setTreasureForTestFailClosed(points,...args){
    if(typeof points!=='number'||!Number.isFinite(points)||!Number.isInteger(points)||points<0)return false;
    return originalSetTreasureForTest.call(this,points,...args);
  };
  GoldenTimeSystem.prototype.__step6zDebugTreasureInputGuardPatched=true;
}
