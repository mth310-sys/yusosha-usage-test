// Step 6Z correction: non-invasive patch for the verified Treasure-loss return lottery.
// Published analysis identifies the reward as a LUPIN BONUS return, commonly announced
// through Revenge Chance. Do not restart GOLDEN TIME directly on a hit.
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
  panel.innerHTML = '<h2>RETURN LOTTERY / STEP 6Z</h2><p class="note">Treasure Battle敗北後、最終TREASURE量でLUPIN BONUS引き戻し抽選。当選時はLUPIN BONUSを保証したRevenge Chance告知ルートへ接続。公開資料間で最低段・偶数5万刻みに差があるため、抽選値の確認レベルも表示する。</p><pre id="artReturnState">TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN</pre>';
  gameLog.parentNode.insertBefore(panel, gameLog);
}

function renderArtReturnDebug(snap) {
  installArtReturnPanel();
  const el = document.getElementById('artReturnState');
  if (!el) return;
  const draw = snap?.artReturn;
  if (!draw) {
    el.textContent = 'TREASURE     ---\nRETURN RATE  ---\nCONFIDENCE   ---\nRESULT       NOT RUN';
    return;
  }
  const treasure = Number.isFinite(draw.treasurePoints)
    ? `${Math.round(draw.treasurePoints / 10000)}万`
    : '---';
  const rate = draw.resolved && Number.isFinite(draw.pct) ? `${draw.pct}%` : 'UNRESOLVED';
  const confidence = draw.confidence ?? 'UNRESOLVED';
  const result = !draw.resolved
    ? 'UNRESOLVED'
    : (draw.hit ? 'HIT → REVENGE NOTIFY / LUPIN BONUS GUARANTEED' : 'FAIL → NORMAL REVENGE ENTRY POLICY');
  el.textContent = `TREASURE     ${treasure}\nRETURN RATE  ${rate}\nCONFIDENCE   ${confidence}\nRESULT       ${result}`;
}

if (!GoldenTimeSystem.prototype.__step6yArtReturnPatched) {
  const originalCompleteBattleGame = GoldenTimeSystem.prototype.completeBattleGame;
  const originalSnapshot = GoldenTimeSystem.prototype.snapshot;

  GoldenTimeSystem.prototype.completeBattleGame = function patchedCompleteBattleGame() {
    const result = originalCompleteBattleGame.call(this);

    if (this.state !== 'ART_END_PENDING_RETURN' || this.lastEvent !== 'TREASURE_BATTLE_G4_LOSE_ART_END') {
      return result;
    }

    const draw = rollArtReturn(this.treasurePoints, this.rng);
    this.artReturnLast = { ...draw, timing:ART_RETURN_PROFILE.timing };
    this.lastEvent = 'TREASURE_BATTLE_G4_LOSE_ART_END';
    const snap = originalSnapshot.call(this);
    renderArtReturnDebug({ ...snap, artReturn:this.artReturnLast });
    return snap;
  };

  GoldenTimeSystem.prototype.snapshot = function patchedSnapshot() {
    const snap = originalSnapshot.call(this);
    const patched = {
      ...snap,
      artReturn: this.artReturnLast ? { ...this.artReturnLast } : null,
      artReturnProfile: ART_RETURN_PROFILE
    };
    renderArtReturnDebug(patched);
    return patched;
  };

  GoldenTimeSystem.prototype.__step6yArtReturnPatched = true;
  installArtReturnPanel();
}

if (!GameCore.prototype.__step6zArtReturnRoutePatched) {
  const originalStopReel = GameCore.prototype.stopReel;
  GameCore.prototype.stopReel = function patchedStopReel(index) {
    const out = originalStopReel.call(this,index);
    if (!out?.complete || !out.result) return out;
    const draw = out.result.goldenTime?.artReturn;
    if (!draw?.resolved || !draw.hit) return out;
    if (this.revenge?.state !== 'ENTRY_PENDING_UNVERIFIED_RATE') return out;
    this.revenge.source='ART_RETURN_HIT_LUPIN_BONUS';
    this.revenge.guaranteedDestination='LUPIN_BONUS';
    this.revenge.lastEvent='ART_RETURN_HIT_REVENGE_NOTIFICATION_LUPIN_BONUS_GUARANTEED';
    out.result.revenge=this.revenge.snapshot();
    out.result.mode='REVENGE_CHANCE_PENDING';
    out.result.event='ART_RETURN_HIT_REVENGE_PENDING_LUPIN_BONUS_GUARANTEED';
    return out;
  };
  GameCore.prototype.__step6zArtReturnRoutePatched=true;
}
