// Step 6Y: non-invasive patch that inserts the verified ART-return lottery
// after Treasure Battle loss and before the existing Revenge Chance route.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { ART_RETURN_PROFILE, rollArtReturn } from './art-return-profile.js?v=step6y';

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
      return originalSnapshot.call(this);
    }

    const retained = { ...draw };
    this.start({ guaranteedStocks:0, source:`ART_RETURN_${draw.treasurePoints}_${draw.pct}PCT_VERIFIED` });
    this.artReturnLast = retained;
    this.lastEvent = `ART_RETURN_HIT_${draw.treasurePoints}_${draw.pct}PCT_GOLDEN_TIME_RESTART`;
    return originalSnapshot.call(this);
  };

  GoldenTimeSystem.prototype.snapshot = function patchedSnapshot() {
    const snap = originalSnapshot.call(this);
    return {
      ...snap,
      artReturn: this.artReturnLast ? { ...this.artReturnLast } : null,
      artReturnProfile: ART_RETURN_PROFILE
    };
  };

  GoldenTimeSystem.prototype.__step6yArtReturnPatched = true;
}
