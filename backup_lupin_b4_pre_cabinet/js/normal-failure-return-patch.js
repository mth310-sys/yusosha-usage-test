// Step 6Z: failed CZ/RIZE/RAIUN routes must not remain stuck forever.
// Preserve failure-pending states for observation, then normalize before the next completed game.
// Natural BLUE->RED promotion after a Raiun-high miss remains UNVERIFIED; automatic promotion stays disabled.
import { NormalSystem } from './normal.js?v=step6w';

const WANTED_POST_ROUTE_UNRESOLVED='POST_SUCCESS_NEXT_CYCLE_UNRESOLVED';

function failureKind(normal){
  if(['DOROBO_ZONE','FUJIKO_ZONE'].includes(normal.mode)&&normal.cz?.state==='FAIL_PENDING_RETURN')return 'CZ';
  if(normal.mode==='RIZE_ZONE'&&normal.rize?.state==='FAIL_PENDING_RETURN')return 'RIZE';
  if(normal.mode==='RAIUN_HIGH'&&normal.raiun?.state==='HIGH_MISS_PENDING_RETURN')return 'RAIUN_HIGH';
  if(normal.mode==='RAIUN_MODE'&&normal.raiun?.state==='FAIL_PENDING_RETURN')return 'RAIUN';
  return null;
}

function normalizeFailureReturn(normal,kind){
  const cameFromWanted=normal.wantedChanceResult==='SUCCESS_ROUTE'||normal.wantedState==='SUSPENDED';
  normal.mode='NORMAL';
  normal.pendingReward=null;
  normal.cz=null;
  normal.rize=null;
  normal.legendGate=null;
  normal.closeWantedHolds?.();
  normal.wantedChanceFrozen=false;
  normal.wantedChanceGameCount=0;
  normal.wantedChanceRemaining=null;
  if(cameFromWanted){
    normal.wantedState=WANTED_POST_ROUTE_UNRESOLVED;
    normal.wantedEntrySource='WANTED_ROUTE_FAILURE_EXIT_NEXT_CYCLE_MODEL_UNRESOLVED';
  }
  if(kind==='RAIUN_HIGH'&&normal.raiun){
    const color=['BLUE','RED'].includes(normal.raiun.counterColor)?normal.raiun.counterColor:'BLUE';
    normal.raiun.points=0;
    normal.raiun.lastPointAdd=0;
    normal.raiun.state='COUNTING';
    normal.raiun.highLevel=null;
    normal.raiun.highGameCount=0;
    normal.raiun.highRemainingGames=null;
    normal.raiun.highEntryDenominator=null;
    normal.raiun.highExpectation=null;
    normal.raiun.result='FAIL';
    normal.raiun.resultSource='RAIUN_HIGH_MISS_RETURN_CONSUMED';
    normal.raiun.counterColor=color;
    normal.raiun.counterColorSource=color==='RED'?'VERIFIED_RED_COUNTER_PERSISTS_UNTIL_ART':'BLUE_TO_RED_NATURAL_PROMOTION_RATE_UNVERIFIED_DISABLED';
    normal.raiun.successModel='POST_HIGH_MISS_NEXT_100PT_CYCLE';
  }
  if(kind==='RAIUN'&&normal.raiun){
    normal.raiun.state='COUNTING';
    normal.raiun.highLevel=null;
    normal.raiun.highGameCount=0;
    normal.raiun.highRemainingGames=null;
    normal.raiun.variant=null;
    normal.raiun.modeGameCount=0;
    normal.raiun.modeRemainingGames=null;
    normal.raiun.result='FAIL';
    normal.raiun.resultSource='FAILURE_RETURN_CONSUMED';
    normal.raiun.successModel='POST_FAILURE_NORMAL_COUNTING';
    normal.raiun.legendGateRate=null;
    normal.raiun.lastLegendGateGame=null;
  }
  normal.transitionSource=`${kind}_FAILURE_RETURN_CONSUMED_ON_NEXT_GAME`;
  normal.lastEvent=`${kind}_FAILURE_RETURN_TO_NORMAL`;
}

if(!NormalSystem.prototype.__step6zFailureReturnPatched){
  const originalComplete=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function(...args){
    const kind=failureKind(this);
    if(kind)normalizeFailureReturn(this,kind);
    return originalComplete.apply(this,args);
  };
  NormalSystem.prototype.__step6zFailureReturnPatched=true;
}
