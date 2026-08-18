// Step 6Z: audit normal-route entry/exit state contracts without inventing unknown probabilities.
import { NormalSystem } from './normal.js?v=step6w';

function save(normal,operation,checks){
  const failed=Object.entries(checks).filter(([,v])=>v!==true).map(([k])=>k);
  normal.lastRouteEntryIntegrity={status:failed.length?'ERROR_NORMAL_ROUTE_ENTRY_INTEGRITY':'OK',operation,checks,failed};
}
function wrap(name,audit){
  const original=NormalSystem.prototype[name];
  if(typeof original!=='function')return;
  NormalSystem.prototype[name]=function(...args){const out=original.apply(this,args);if(out!==false&&out!=null)audit.call(this,args,out);return out;};
}

if(!NormalSystem.prototype.__step6zRouteEntryIntegrityPatched){
  wrap('startWantedChance',function(){save(this,'WANTED_ENTRY',{mode:this.mode==='WANTED_CHANCE',state:this.wantedState==='ACTIVE',remaining:Number(this.wantedChanceRemaining)>0,holds:!!this.holdQueue,pending:this.pendingReward==null});});
  wrap('startCz',function(args){const type=args[0];save(this,`${type}_ENTRY`,{mode:this.mode===type,czActive:this.cz?.state==='ACTIVE',czType:this.cz?.type===type,rizeCleared:this.rize==null,legendCleared:this.legendGate==null});});
  wrap('startSevenZone',function(){save(this,'SEVEN_ZONE_ENTRY',{mode:this.mode==='SEVEN_ZONE',guaranteed:this.cz?.state==='ART_GUARANTEED',success:this.cz?.result==='SUCCESS',reward:this.pendingReward?.type==='GOLDEN_TIME',wantedSuccess:this.wantedChanceResult==='SUCCESS_ROUTE'});});
  wrap('startRizeZone',function(args){save(this,`${args[0]??'RIZE'}_ENTRY`,{mode:this.mode==='RIZE_ZONE',active:this.rize?.state==='ACTIVE_PREMONITION',pendingCleared:this.pendingReward==null,czCleared:this.cz==null,legendCleared:this.legendGate==null});});
  wrap('resolveRizeForTest',function(args){const success=args[0]==='SUCCESS';save(this,`RIZE_${args[0]}_EXIT`,{result:this.rize?.result===args[0],reward:success?this.pendingReward?.type==='LB_OR_GT':this.pendingReward==null,state:success?this.rize?.state==='SUCCESS_PENDING_DESTINATION':this.rize?.state==='FAIL_PENDING_RETURN'});});
  wrap('startRaiunMode',function(){save(this,`${this.raiun?.variant??'RAIUN'}_ENTRY`,{mode:this.mode==='RAIUN_MODE',active:['ACTIVE_20G','SHIN_ACTIVE_UNTIL_ART'].includes(this.raiun?.state),result:this.raiun?.result==='UNRESOLVED',legendCleared:this.legendGate==null});});
  wrap('resolveRaiunForTest',function(args){const success=args[0]==='SUCCESS';save(this,`RAIUN_${args[0]}_EXIT`,{result:this.raiun?.result===args[0],reward:success?this.pendingReward?.type==='GOLDEN_TIME':this.pendingReward==null,state:success?this.raiun?.state==='ART_SUCCESS_PENDING_GT':this.raiun?.state==='FAIL_PENDING_RETURN'});});
  wrap('startLegendGate',function(){save(this,'LEGEND_GATE_ENTRY',{mode:this.mode==='LEGEND_GATE',active:this.legendGate?.state==='ACTIVE_STOCK_ZONE',pendingCleared:this.pendingReward==null,czCleared:this.cz==null,rizeCleared:this.rize==null,raiunMarked:this.raiun?.state==='LEGEND_GATE_ENTERED'});});
  wrap('setLegendGateMedalsForTest',function(args){save(this,'LEGEND_GATE_REWARD_FIXED',{medals:Number(this.legendGate?.medals)===Number(args[0]),fixed:this.legendGate?.state==='MEDAL_RESULT_FIXED_DEBUG',reward:this.pendingReward?.type==='GOLDEN_TIME_STOCKS',minStocks:Number(this.pendingReward?.minStocks)>0});});
  wrap('resolveCzForTest',function(args){const success=args[0]==='SUCCESS';save(this,`${this.cz?.type??'CZ'}_${args[0]}_EXIT`,{result:this.cz?.result===args[0],ended:this.cz?.remainingGames===0,reward:success?this.pendingReward?.type==='LB_OR_GT':this.pendingReward==null,state:success?this.cz?.state==='SUCCESS_PENDING_DESTINATION':this.cz?.state==='FAIL_PENDING_RETURN'});});
  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastRouteEntryIntegrity:this.lastRouteEntryIntegrity?{...this.lastRouteEntryIntegrity}:null};};
  NormalSystem.prototype.__step6zRouteEntryIntegrityPatched=true;
}
