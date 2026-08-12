// Step 6Z: normalize per-set state when a LUPIN RUSH result opens the 30G body.
// Continuation source metadata is kept, but prior Treasure Battle presentation/outcome
// must not leak into the newly opened set.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';

if (!GoldenTimeSystem.prototype.__step6zSetBoundaryPatched) {
  const originalApplyLupinRushAverageForTest = GoldenTimeSystem.prototype.applyLupinRushAverageForTest;

  GoldenTimeSystem.prototype.applyLupinRushAverageForTest = function patchedApplyLupinRushAverageForTest(type, ...rest) {
    const sourceBefore = this.battleSource;
    const setBefore = this.setNo;
    const out = originalApplyLupinRushAverageForTest.call(this, type, ...rest);
    if (!out) return out;

    this.result = 'UNRESOLVED';
    this.battleResult = null;
    this.battleGameCount = 0;
    this.battlePhase = null;
    this.battleOpponent = null;
    this.battleHiddenOutcome = null;
    this.battleSource = sourceBefore;
    this.__setBoundaryLast = {
      setNo: this.setNo,
      priorSetNo: Math.max(0, setBefore - 1),
      continuationSource: sourceBefore ?? 'INITIAL_ENTRY',
      openedState: this.state,
      gameInSet: this.gameInSet,
      remainingGames: this.remainingGames,
      stocksRemaining: this.guaranteedStocks,
      battleStateCleared: true
    };
    this.lastEvent = `${this.lastEvent}_SET_BOUNDARY_NORMALIZED`;
    return this.snapshot();
  };

  const originalSnapshot = GoldenTimeSystem.prototype.snapshot;
  GoldenTimeSystem.prototype.snapshot = function patchedSetBoundarySnapshot() {
    const snap = originalSnapshot.call(this);
    return {
      ...snap,
      setBoundaryLast: this.__setBoundaryLast ? { ...this.__setBoundaryLast } : null
    };
  };

  const originalReset = GoldenTimeSystem.prototype.reset;
  GoldenTimeSystem.prototype.reset = function patchedSetBoundaryReset() {
    this.__setBoundaryLast = null;
    return originalReset.call(this);
  };

  GoldenTimeSystem.prototype.__step6zSetBoundaryPatched = true;
}
