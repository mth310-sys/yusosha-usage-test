// LUPIN B4 ceiling runtime.
// Keep special-context ceiling benefits unresolved rather than inventing a route.
import './next-initial-hit-integrity-patch.js?v=step6z-ceiling-dependency1';
import { GameCore } from './game-core.js?v=step6w';
import { drawCeilingGame, CEILING_PROFILE } from './ceiling-profile.js?v=step6ab-ceiling1';

const RESET_SOURCES=new Set([
  'BOOTSTRAP_USING_VERIFIED_END_TABLE',
  'LUPIN_BONUS_END_VERIFIED_TIMING',
  'ART_END_VERIFIED_TIMING'
]);

function drawCeiling(core,source){
  const target=drawCeilingGame(core.setting,core.rng);
  core.ceiling={
    counter:0,
    targetGame:target,
    drawSource:source,
    reached:false,
    reachedMode:null,
    resolution:target==null?'UNRESOLVED_UNSUPPORTED_SETTING':'COUNTING',
    profile:CEILING_PROFILE
  };
  return core.ceiling;
}

function ensureCeiling(core){
  if(!core.ceiling)drawCeiling(core,'LAZY_BOOTSTRAP');
  return core.ceiling;
}

function plainNormalCeilingHit(core,result){
  core.lupinBonus.reset();
  core.lupinBonus.start('VERIFIED_GAME_COUNT_CEILING');
  core.normal.pendingReward=null;
  core.ceiling.reached=true;
  core.ceiling.reachedMode='NORMAL';
  core.ceiling.resolution='LUPIN_BONUS';
  if(result){
    result.mode='LUPIN_BONUS';
    result.event='CEILING_LUPIN_BONUS_AUTO';
    result.lupinBonus=core.lupinBonus.snapshot();
    result.pendingReward=null;
  }
}

if(!GameCore.prototype.__step6abCeilingRuntimePatched){
  const originalDrawNextInitialHitReservation=GameCore.prototype.drawNextInitialHitReservation;
  GameCore.prototype.drawNextInitialHitReservation=function drawNextInitialHitReservationWithCeiling(source='BONUS_OR_ART_END',...args){
    const out=originalDrawNextInitialHitReservation.call(this,source,...args);
    if(RESET_SOURCES.has(source))drawCeiling(this,source);
    return out;
  };

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithCeiling(index,...args){
    const bonusActiveBefore=this.lupinBonus?.state!=='IDLE';
    const gtActiveBefore=this.goldenTime?.state!=='IDLE';
    const out=originalStopReel.call(this,index,...args);
    if(!out?.complete)return out;

    const ceiling=ensureCeiling(this);
    if(!bonusActiveBefore&&!gtActiveBefore&&ceiling.targetGame!=null&&!ceiling.reached){
      ceiling.counter+=1;
      if(ceiling.counter>=ceiling.targetGame){
        const result=out.result;
        const alreadyHit=result?.mode==='LUPIN_BONUS'||result?.mode==='GOLDEN_TIME';
        if(alreadyHit){
          ceiling.reached=true;
          ceiling.reachedMode=this.normal?.mode??null;
          ceiling.resolution='SUPERSEDED_BY_SAME_GAME_INITIAL_HIT';
        }else if(this.normal?.mode==='NORMAL'&&this.revenge?.state==='IDLE'){
          plainNormalCeilingHit(this,result);
        }else{
          ceiling.reached=true;
          ceiling.reachedMode=this.normal?.mode??(this.revenge?.state==='ACTIVE'?'REVENGE_CHANCE':'UNKNOWN');
          ceiling.resolution='SPECIAL_CONTEXT_PENDING';
          if(result)result.ceilingSpecialContextPending=true;
        }
      }
    }
    if(out.result)out.result.ceiling={...ceiling,profile:CEILING_PROFILE};
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithCeiling(...args){
    const snap=originalSnapshot.apply(this,args);
    const ceiling=ensureCeiling(this);
    return {...snap,ceiling:{...ceiling,profile:CEILING_PROFILE}};
  };

  GameCore.prototype.__step6abCeilingRuntimePatched=true;
}
