export const GoldenTimeSetPhase = Object.freeze({
  MAIN_STAGE_WINDOW: 'MAIN_STAGE_WINDOW',
  POST_STAGE_WINDOW_UNRESOLVED: 'POST_STAGE_WINDOW_UNRESOLVED',
  COMPLETE: 'COMPLETE'
});

export const GOLDEN_TIME_SET_PHASE_POLICY = Object.freeze({
  stageResidenceWindowGames: 30,
  totalApproxGames: 40,
  totalApproxGamesEvidenceStatus: 'MULTI_SOURCE_MATCH',
  stageResidenceWindowEvidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
  continuationBattleExactEntryGame: null,
  continuationBattleExactEntryGameEvidenceStatus: 'UNRESOLVED',
  previousB4BattlePresentationGamesCandidate: 4,
  previousB4BattlePresentationEvidenceStatus: 'REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION',
  continuationBattlePerGameMechanics: 'UNRESOLVED',
  syntheticBattleLotteryImplemented: false,
  continuationResolutionPipeline: 'REUSE_EXISTING_STOCK_TREASURE_BATTLE_REVENGE_PIPELINE',
  stockPriorityResolverReused: true,
  revengeChanceRuntimeReused: true,
  duplicateContinuationResolverImplemented: false,
  thirtyGameResidenceMustNotImplyBattleEntry: true
});

export function getGoldenTimeSetPhase(gamesSettled, totalGames = GOLDEN_TIME_SET_PHASE_POLICY.totalApproxGames) {
  if (!Number.isInteger(gamesSettled) || gamesSettled < 0) throw new RangeError('gamesSettled must be a non-negative integer');
  if (!Number.isInteger(totalGames) || totalGames <= 0) throw new RangeError('totalGames must be a positive integer');
  if (gamesSettled >= totalGames) return GoldenTimeSetPhase.COMPLETE;
  if (gamesSettled >= GOLDEN_TIME_SET_PHASE_POLICY.stageResidenceWindowGames) return GoldenTimeSetPhase.POST_STAGE_WINDOW_UNRESOLVED;
  return GoldenTimeSetPhase.MAIN_STAGE_WINDOW;
}

export function isGoldenTimeMainStageWindow(gamesSettled, totalGames) {
  return getGoldenTimeSetPhase(gamesSettled, totalGames) === GoldenTimeSetPhase.MAIN_STAGE_WINDOW;
}

// Backward-compatible alias for existing stage-runtime imports.
export const isGoldenTimeMainPhase = isGoldenTimeMainStageWindow;
