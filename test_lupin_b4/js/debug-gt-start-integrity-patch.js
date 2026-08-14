// Step 6Z: keep the DEBUG direct Golden Time entry from coercing invalid stock values to zero.
import { GameCore } from './game-core.js?v=step6w';

if(!GameCore.prototype.__step6zDebugGtStartInputGuardPatched){
  const originalStartGoldenTimeForTest=GameCore.prototype.startGoldenTimeForTest;
  GameCore.prototype.startGoldenTimeForTest=function startGoldenTimeForTestFailClosed(stocks=0,...args){
    if(typeof stocks!=='number'||!Number.isFinite(stocks)||!Number.isInteger(stocks)||stocks<0)return false;
    return originalStartGoldenTimeForTest.call(this,stocks,...args);
  };
  GameCore.prototype.__step6zDebugGtStartInputGuardPatched=true;
}
