// Step 6Z correction: non-invasive patch for the verified Treasure-loss return lottery.
// Published analysis identifies the reward as a LUPIN BONUS return, commonly announced
// through Revenge Chance. Do not restart GOLDEN TIME directly on a hit.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { ART_RETURN_PROFILE, rollArtReturn } from './art-return-profile.js?v=step6z';

function installArtReturnPanel() {
  if (document.getElementById('artReturnPanel')) return;
  const gameLog = document.getElementById('log')?.closest('.panel');
  if (!gameLog) return;
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.id = 'artReturnPanel';
  panel.innerHTML = '<h2>RETURN LOTTERY / STEP 6Z</h2><p class="note">Treasure Battle敗北後、最終TREASURE量でLUPIN BONUS引き戻し抽選。引き戻し当選はRevenge Chance経由で告知されやすい。公開確認済みの完全一致テーブルのみ使用し、未掲載値は補間しない。</p><pre id="artReturnState">TREASURE     ---\nRETURN RATE  ---\nRESULT       NOT RUN</pre>';
  gameLog.parentNode.insertBefore(panel, gameLog);
}

function renderArtReturnDebug(snap) {
  installArtReturnPanel();
  const el = document.getElementById('artReturnState');
  if (!el) return;
  const draw = snap?.artReturn;
  if (!draw) {
    el.textContent = 'TREASURE     ---\nRETURN RATE  ---\nRESULT       NOT RUN';
    return;
  }
  const treasure = Number.isFinite(draw.treasurePoints)
    ? `${Math.round(draw.treasurePoints / 10000)}万`
    : '---';
  const rate = draw.resolved && Number.isFinite(draw.pct) ? `${draw.pct}%` : 'UNRESOLVED';
  const result = !draw.resolved
    ? 'UNRESOLVED'
    : (draw.hit ? 'HIT → LUPIN BONUS RETURN / REVENGE NOTIFY LIKELY' : 'FAIL → LEGACY REVENGE ROUTE');
  el.textContent = `TREASURE     ${treasure}\nRETURN RATE  ${rate}\nRESULT       ${result}`;
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

    // Whether the return lottery hits or misses, preserve the existing ART-end event so
    // GameCore can continue into its current Revenge Chance offer path. The hit is retained
    // in the snapshot for the next routing step; direct GT restart was an incorrect model.
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
