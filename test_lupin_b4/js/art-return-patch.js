// Step 6Y: non-invasive patch that inserts the verified ART-return lottery
// after Treasure Battle loss and before the existing Revenge Chance route.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { ART_RETURN_PROFILE, rollArtReturn } from './art-return-profile.js?v=step6y';

function installArtReturnPanel() {
  if (document.getElementById('artReturnPanel')) return;
  const gameLog = document.getElementById('log')?.closest('.panel');
  if (!gameLog) return;
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.id = 'artReturnPanel';
  panel.innerHTML = '<h2>ART RETURN / STEP 6Y</h2><p class="note">Treasure Battle敗北後、Revenge Chance判定より前に最終TREASURE量で引き戻し抽選。公開確認済みの完全一致テーブルのみ使用し、未掲載値は補間しない。</p><pre id="artReturnState">TREASURE     ---\nRETURN RATE  ---\nRESULT       NOT RUN</pre>';
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
  const result = !draw.resolved ? 'UNRESOLVED' : (draw.hit ? 'HIT → GOLDEN TIME' : 'FAIL → REVENGE ROUTE');
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

    // Miss/unresolved must preserve the legacy event string so GameCore continues
    // into the existing Revenge Chance offer path.
    if (!draw.resolved || !draw.hit) {
      this.lastEvent = 'TREASURE_BATTLE_G4_LOSE_ART_END';
      const snap = originalSnapshot.call(this);
      renderArtReturnDebug({ ...snap, artReturn:this.artReturnLast });
      return snap;
    }

    const retained = { ...draw };
    this.start({ guaranteedStocks:0, source:`ART_RETURN_${draw.treasurePoints}_${draw.pct}PCT_VERIFIED` });
    this.artReturnLast = retained;
    this.lastEvent = `ART_RETURN_HIT_${draw.treasurePoints}_${draw.pct}PCT_GOLDEN_TIME_RESTART`;
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
