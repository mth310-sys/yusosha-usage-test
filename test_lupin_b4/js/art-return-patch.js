// Step 6Z correction: non-invasive patch for the verified Treasure-loss return lottery.
// Published analysis identifies the reward as a LUPIN BONUS return. Notification may be
// through Revenge Chance or the normal stage, so a return hit must not be treated as the
// ordinary Revenge Chance entry lottery.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { GameCore } from './game-core.js?v=step6w';
import { ART_RETURN_PROFILE, rollArtReturn } from './art-return-profile.js?v=step6z2';

function installArtReturnPanel() {
  if (document.getElementById('artReturnPanel')) return;
  const gameLog = document.getElementById('log')?.closest('.panel');
  if (!gameLog) return;
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.id = 'artReturnPanel';
  panel.innerHTML = '<h2>RETURN LOTTERY / STEP 6Z</h2><p class="note">Treasure Battle敗北後、最終TREASURE量でLUPIN BONUS引き戻し抽選。引き戻し当選自体と、その告知がRevenge Chanceか通常ステージかは別管理。告知振り分け未確認のため自動決定しない。</p><pre id="artReturnState">TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN</pre>';
  gameLog.parentNode.insertBefore(panel, gameLog);
}

function renderArtReturnDebug(snap) {
  installArtReturnPanel();
  const el = document.getElementById('artReturnState');
  if (!el) return;
  const draw = snap?.artReturn;
  if (!draw) {el.textContent='TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN';return;}
  const treasure=Number.isFinite(draw.treasurePoints)?`${Math.round(draw.treasurePoints/10000)}万`:'---';
  const rate=draw.resolved&&Number.isFinite(draw.pct)?`${draw.pct}%`:'UNRESOLVED';
  const confidence=draw.confidence??'UNRESOLVED';
  const result=!draw.resolved?'UNRESOLVED':(draw.hit?'HIT → LUPIN BONUS RETURN / NOTIFICATION ROUTE UNRESOLVED':'FAIL → NORMAL REVENGE ENTRY POLICY');
  el.textContent=`TREASURE     ${treasure}\nRETURN RATE  ${rate}\nCONFIDENCE   ${confidence}\nRESULT       ${result}`;
}

if (!GoldenTimeSystem.prototype.__step6yArtReturnPatched) {
  const originalCompleteBattleGame=GoldenTimeSystem.prototype.completeBattleGame;
  const originalSnapshot=GoldenTimeSystem.prototype.snapshot;
  const originalReset=GoldenTimeSystem.prototype.reset;
  GoldenTimeSystem.prototype.reset=function patchedArtReturnReset(){this.artReturnLast=null;return originalReset.call(this);};
  GoldenTimeSystem.prototype.completeBattleGame=function patchedCompleteBattleGame(){
    const result=originalCompleteBattleGame.call(this);
    if(this.state!=='ART_END_PENDING_RETURN'||this.lastEvent!=='TREASURE_BATTLE_G4_LOSE_ART_END')return result;
    const draw=rollArtReturn(this.treasurePoints,this.rng);this.artReturnLast={...draw,timing:ART_RETURN_PROFILE.timing,notificationRoute:'UNRESOLVED'};
    const baseSnap=originalSnapshot.call(this);const routedSnap={...baseSnap,artReturn:{...this.artReturnLast},artReturnProfile:ART_RETURN_PROFILE};renderArtReturnDebug(routedSnap);return routedSnap;
  };
  GoldenTimeSystem.prototype.snapshot=function patchedSnapshot(){const snap=originalSnapshot.call(this);const patched={...snap,artReturn:this.artReturnLast?{...this.artReturnLast}:null,artReturnProfile:ART_RETURN_PROFILE};renderArtReturnDebug(patched);return patched;};
  GoldenTimeSystem.prototype.__step6yArtReturnPatched=true;installArtReturnPanel();
}

if (!GameCore.prototype.__step6zArtReturnRoutePatched) {
  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function patchedStopReel(index){
    const out=originalStopReel.call(this,index);if(!out?.complete||!out.result)return out;
    const draw=out.result.goldenTime?.artReturn;
    if(!draw?.resolved||!draw.hit)return out;
    // The LUPIN BONUS return is already won. The public material does not give the
    // notification split between Revenge Chance and the normal stage, so keep the reward
    // pending instead of inventing that presentation lottery or reusing normal Revenge entry.
    if(this.revenge?.state==='ENTRY_PENDING_UNVERIFIED_RATE')this.revenge.reset();
    out.result.revenge=this.revenge.snapshot();
    out.result.mode='ART_RETURN_PENDING_NOTIFICATION';
    out.result.event='ART_RETURN_HIT_LUPIN_BONUS_GUARANTEED_NOTIFICATION_ROUTE_UNRESOLVED';
    return out;
  };
  GameCore.prototype.__step6zArtReturnRoutePatched=true;
}
