// Step 6Z: normalize and audit per-set state around LUPIN RUSH -> 30G body.
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { drawArtStageScenario } from './art-stage-scenario-profile.js?v=step6l';

if (!GoldenTimeSystem.prototype.__step6zSetBoundaryPatched) {
  const originalStartContinuationLupinRush = GoldenTimeSystem.prototype.startContinuationLupinRush;
  GoldenTimeSystem.prototype.startContinuationLupinRush = function patchedStartContinuationLupinRush(source='TREASURE_BATTLE_WIN', ...rest) {
    const stocksBefore = this.guaranteedStocks;
    const treasureBefore = this.treasurePoints;
    const out = originalStartContinuationLupinRush.call(this, source, ...rest);
    if (!out) return out;
    this.stageScenario = drawArtStageScenario(this.setting, this.rng);
    this.stageScenarioSource = 'VERIFIED_SETTING_TABLE_CONTINUATION_SET_REDRAW';
    this.__setBoundaryPending = {
      setNo: this.setNo,
      continuationSource: source,
      scenario: this.stageScenario,
      stocksBefore,
      stocksAfterRushEntry: this.guaranteedStocks,
      treasureBefore,
      treasureAfterRushEntry: this.treasurePoints,
      expectedTreasureReset: this.treasurePoints === 0,
      stockInvariant: stocksBefore === this.guaranteedStocks ? 'PRESERVED' : 'CHANGED_BEFORE_RUSH_ENTRY'
    };
    this.lastEvent = `${this.lastEvent}_STAGE_SCENARIO_REDRAWN_BOUNDARY_AUDIT`;
    return this.snapshot();
  };

  const originalApplyLupinRushAverageForTest = GoldenTimeSystem.prototype.applyLupinRushAverageForTest;
  GoldenTimeSystem.prototype.applyLupinRushAverageForTest = function patchedApplyLupinRushAverageForTest(type, ...rest) {
    const sourceBefore = this.battleSource;
    const setBefore = this.setNo;
    const scenarioBefore = this.stageScenario;
    const stocksBefore = this.guaranteedStocks;
    const treasureBefore = this.treasurePoints;
    const pendingBefore = this.__setBoundaryPending ? { ...this.__setBoundaryPending } : null;
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
      stageScenario: scenarioBefore,
      stageScenarioSource: this.stageScenarioSource,
      stocksBeforeRushResult: stocksBefore,
      stocksAfterRushResult: this.guaranteedStocks,
      stockInvariant: stocksBefore === this.guaranteedStocks ? 'PRESERVED' : 'CHANGED_BY_RUSH_RESULT',
      treasureBeforeRushResult: treasureBefore,
      treasureAfterRushResult: this.treasurePoints,
      rushTreasureApplied: this.treasurePoints >= 0,
      entryAudit: pendingBefore,
      battleStateCleared: true
    };
    this.__setBoundaryPending = null;
    this.lastEvent = `${this.lastEvent}_SET_BOUNDARY_NORMALIZED_AUDITED`;
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
