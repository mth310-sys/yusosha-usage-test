// Step 6Z: normalize per-set state around the LUPIN RUSH -> 30G body boundary.
// Each continuation set receives a fresh setting-based stage scenario. Prior battle
// presentation is cleared only when the new 30G body actually opens.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { drawArtStageScenario } from './art-stage-scenario-profile.js?v=step6l';

if (!GoldenTimeSystem.prototype.__step6zSetBoundaryPatched) {
  const originalStartContinuationLupinRush = GoldenTimeSystem.prototype.startContinuationLupinRush;
  GoldenTimeSystem.prototype.startContinuationLupinRush = function patchedStartContinuationLupinRush(source='TREASURE_BATTLE_WIN', ...rest) {
    const out = originalStartContinuationLupinRush.call(this, source, ...rest);
    if (!out) return out;
    this.stageScenario = drawArtStageScenario(this.setting, this.rng);
    this.stageScenarioSource = 'VERIFIED_SETTING_TABLE_CONTINUATION_SET_REDRAW';
    this.__setBoundaryPending = {
      setNo: this.setNo,
      continuationSource: source,
      scenario: this.stageScenario,
      stocksRemaining: this.guaranteedStocks
    };
    this.lastEvent = `${this.lastEvent}_STAGE_SCENARIO_REDRAWN`;
    return this.snapshot();
  };

  const originalApplyLupinRushAverageForTest = GoldenTimeSystem.prototype.applyLupinRushAverageForTest;
  GoldenTimeSystem.prototype.applyLupinRushAverageForTest = function patchedApplyLupinRushAverageForTest(type, ...rest) {
    const sourceBefore = this.battleSource;
    const setBefore = this.setNo;
    const scenarioBefore = this.stageScenario;
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
      stageScenario: scenarioBefore,
      stageScenarioSource: this.stageScenarioSource,
      battleStateCleared: true
    };
    this.__setBoundaryPending = null;
    this.lastEvent = `${this.lastEvent}_SET_BOUNDARY_NORMALIZED`;
    return this.snapshot();
  };

  const originalSnapshot = GoldenTimeSystem.prototype.snapshot;
  GoldenTimeSystem.prototype.snapshot = function patchedSetBoundarySnapshot() {
    const snap = originalSnapshot.call(this);
    return {
      ...snap,
      setBoundaryPending: this.__setBoundaryPending ? { ...this.__setBoundaryPending } : null,
      setBoundaryLast: this.__setBoundaryLast ? { ...this.__setBoundaryLast } : null
    };
  };

  const originalReset = GoldenTimeSystem.prototype.reset;
  GoldenTimeSystem.prototype.reset = function patchedSetBoundaryReset() {
    this.__setBoundaryPending = null;
    this.__setBoundaryLast = null;
    return originalReset.call(this);
  };

  GoldenTimeSystem.prototype.__step6zSetBoundaryPatched = true;
}
