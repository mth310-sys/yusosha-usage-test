// Step 6Z correction: verified Treasure-loss LUPIN BONUS return lottery.
// The return win and its notification route are separate. Published material allows
// Revenge Chance or normal-stage notification, but the route split/timing is unresolved.
// Therefore a hit is held in an explicit pending state and the notification route is
// selected manually for verification instead of being synthesized.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { GameCore } from './game-core.js?v=step6w';
import { ART_RETURN_PROFILE, rollArtReturn } from './art-return-profile.js?v=step6z2';

let activeCore=null;

function installArtReturnPanel(){
  let panel=document.getElementById('artReturnPanel');
  if(panel)return panel;
  const gameLog=document.getElementById('log')?.closest('.panel');
  if(!gameLog)return null;
  panel=document.createElement('section');panel.className='panel';panel.id='artReturnPanel';
  panel.innerHTML='<h2>RETURN LOTTERY / STEP 6Z</h2><p class="note">Treasure Battle敗北後のLUPIN BONUS引き戻し。当選後の告知経路はRevenge Chanceまたは通常ステージだが振り分け・通常告知の待機G数は未回収。HIT時のみ手動で告知経路を確定する。</p><div class="panel-head"><button id="artReturnViaRevenge" type="button" disabled>NOTIFY VIA REVENGE</button><button id="artReturnViaNormal" type="button" disabled>NOTIFY VIA NORMAL → LB</button></div><pre id="artReturnState">TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN</pre>';
  gameLog.parentNode.insertBefore(panel,gameLog);
  panel.querySelector('#artReturnViaRevenge')?.addEventListener('click',()=>{activeCore?.resolveArtReturnNotificationForTest?.('REVENGE_CHANCE');renderArtReturnDebug(activeCore);});
  panel.querySelector('#artReturnViaNormal')?.addEventListener('click',()=>{activeCore?.resolveArtReturnNotificationForTest?.('NORMAL_STAGE');renderArtReturnDebug(activeCore);});
  return panel;
}

function currentReturnState(core){
  if(!core)return {draw:null,pending:null,last:null};
  return {draw:core.__artReturnPendingNotification?.draw??core.__artReturnLastResolved?.draw??core.goldenTime?.artReturnLast??null,pending:core.__artReturnPendingNotification??null,last:core.__artReturnLastResolved??null};
}

function renderArtReturnDebug(coreOrSnap){
  const panel=installArtReturnPanel();if(!panel)return;
  const core=coreOrSnap instanceof GameCore?coreOrSnap:null;
  if(core)activeCore=core;
  const state=core?currentReturnState(core):{draw:coreOrSnap?.artReturn??null,pending:null,last:null};
  const draw=state.draw,el=panel.querySelector('#artReturnState'),viaRev=panel.querySelector('#artReturnViaRevenge'),viaNormal=panel.querySelector('#artReturnViaNormal');
  const pending=Boolean(state.pending);
  if(viaRev)viaRev.disabled=!pending;if(viaNormal)viaNormal.disabled=!pending;
  if(!el)return;
  if(!draw){el.textContent='TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN';return;}
  const treasure=Number.isFinite(draw.treasurePoints)?`${Math.round(draw.treasurePoints/10000)}万`:'---';
  const rate=draw.resolved&&Number.isFinite(draw.pct)?`${draw.pct}%`:'UNRESOLVED';
  const confidence=draw.confidence??'UNRESOLVED';
  let result='UNRESOLVED';
  if(draw.resolved&&!draw.hit)result='FAIL → NORMAL REVENGE ENTRY POLICY';
  else if(pending)result='HIT → LUPIN BONUS GUARANTEED / CHOOSE NOTIFICATION ROUTE';
  else if(state.last)result=`HIT → ${state.last.route} / LUPIN BONUS GUARANTEED`;
  el.textContent=`TREASURE     ${treasure}\nRETURN RATE  ${rate}\nCONFIDENCE   ${confidence}\nRESULT       ${result}`;
}

if(!GoldenTimeSystem.prototype.__step6yArtReturnPatched){
  const originalCompleteBattleGame=GoldenTimeSystem.prototype.completeBattleGame;
  const originalSnapshot=GoldenTimeSystem.prototype.snapshot;
  const originalReset=GoldenTimeSystem.prototype.reset;
  GoldenTimeSystem.prototype.reset=function patchedArtReturnReset(){this.artReturnLast=null;return originalReset.call(this);};
  GoldenTimeSystem.prototype.completeBattleGame=function patchedCompleteBattleGame(){
    const result=originalCompleteBattleGame.call(this);
    if(this.state!=='ART_END_PENDING_RETURN'||this.lastEvent!=='TREASURE_BATTLE_G4_LOSE_ART_END')return result;
    const draw=rollArtReturn(this.treasurePoints,this.rng);this.artReturnLast={...draw,timing:ART_RETURN_PROFILE.timing,notificationRoute:'UNRESOLVED'};
    const baseSnap=originalSnapshot.call(this);return {...baseSnap,artReturn:{...this.artReturnLast},artReturnProfile:ART_RETURN_PROFILE};
  };
  GoldenTimeSystem.prototype.snapshot=function patchedSnapshot(){const snap=originalSnapshot.call(this);return {...snap,artReturn:this.artReturnLast?{...this.artReturnLast}:null,artReturnProfile:ART_RETURN_PROFILE};};
  GoldenTimeSystem.prototype.__step6yArtReturnPatched=true;
}

if(!GameCore.prototype.__step6zArtReturnRoutePatched){
  const originalStopReel=GameCore.prototype.stopReel;
  const originalBet=GameCore.prototype.bet;
  const originalSnapshot=GameCore.prototype.snapshot;

  GameCore.prototype.bet=function patchedArtReturnBet(){if(this.__artReturnPendingNotification)return false;return originalBet.call(this);};

  GameCore.prototype.resolveArtReturnNotificationForTest=function resolveArtReturnNotificationForTest(route){
    const pending=this.__artReturnPendingNotification;if(!pending||!pending.draw?.hit)return false;
    if(route!=='REVENGE_CHANCE'&&route!=='NORMAL_STAGE')return false;
    const draw={...pending.draw,notificationRoute:route};
    this.__artReturnPendingNotification=null;
    this.__artReturnLastResolved={draw,route,resolvedAtGameNo:this.gameNo};
    if(route==='REVENGE_CHANCE'){
      this.revenge.reset();
      this.revenge.offer('ART_RETURN_HIT_NOTIFICATION',{guaranteedDestination:'LUPIN_BONUS'});
      this.revenge.startForTest();
      this.__artReturnLastResolved.event='ART_RETURN_REVENGE_NOTIFICATION_10G_START_LUPIN_BONUS_GUARANTEED';
    }else{
      // The normal-stage notification delay is unknown. Manual resolution means the
      // notification has now occurred, so start the already-guaranteed LUPIN BONUS.
      this.lupinBonus.reset();
      this.lupinBonus.start('ART_RETURN_NORMAL_STAGE_NOTIFICATION_RESOLVED_DEBUG');
      this.__artReturnLastResolved.event='ART_RETURN_NORMAL_STAGE_NOTIFICATION_LUPIN_BONUS_START';
    }
    renderArtReturnDebug(this);return true;
  };

  GameCore.prototype.stopReel=function patchedStopReel(index){
    const out=originalStopReel.call(this,index);if(!out?.complete||!out.result)return out;

    // Complete a manually selected Revenge notification once its guaranteed 10G ends.
    if(this.revenge?.state==='SUCCESS'&&this.revenge.guaranteedDestination==='LUPIN_BONUS'&&this.revenge.source==='ART_RETURN_HIT_NOTIFICATION'){
      this.lupinBonus.reset();this.lupinBonus.start('ART_RETURN_REVENGE_NOTIFICATION_COMPLETE');this.revenge.reset();
      out.result.revenge=this.revenge.snapshot();out.result.lupinBonus=this.lupinBonus.snapshot();out.result.mode='LUPIN_BONUS';out.result.event='ART_RETURN_REVENGE_10G_END_LUPIN_BONUS_AUTO_START';renderArtReturnDebug(this);return out;
    }

    const draw=out.result.goldenTime?.artReturn;
    if(!draw?.resolved||!draw.hit){renderArtReturnDebug(this);return out;}

    // The reward is already won. Cancel the ordinary unverified Revenge-entry offer,
    // release the ended ART state, and block further betting until notification is resolved.
    if(this.revenge?.state==='ENTRY_PENDING_UNVERIFIED_RATE')this.revenge.reset();
    this.__artReturnPendingNotification={draw:{...draw},createdAtGameNo:this.gameNo};
    this.__artReturnLastResolved=null;
    this.goldenTime.reset();
    out.result.goldenTime=this.goldenTime.snapshot();out.result.revenge=this.revenge.snapshot();out.result.mode='ART_RETURN_PENDING_NOTIFICATION';out.result.event='ART_RETURN_HIT_LUPIN_BONUS_GUARANTEED_NOTIFICATION_ROUTE_UNRESOLVED';renderArtReturnDebug(this);return out;
  };

  GameCore.prototype.snapshot=function patchedArtReturnCoreSnapshot(){const snap=originalSnapshot.call(this);return {...snap,artReturnPendingNotification:this.__artReturnPendingNotification?{...this.__artReturnPendingNotification,draw:{...this.__artReturnPendingNotification.draw}}:null,artReturnLastResolved:this.__artReturnLastResolved?{...this.__artReturnLastResolved,draw:{...this.__artReturnLastResolved.draw}}:null};};
  GameCore.prototype.__step6zArtReturnRoutePatched=true;
}

installArtReturnPanel();
