export const GoldenTimeSetPhase = Object.freeze({
  MAIN: 'MAIN',
  CONTINUATION_BATTLE: 'CONTINUATION_BATTLE',
  COMPLETE: 'COMPLETE'
});

export const GOLDEN_TIME_SET_PHASE_POLICY = Object.freeze({
  mainGames: 30,
  battleWindowStartsAfterSettledGame: 30,
  totalApproxGames: 40,
  evidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
  continuationBattlePerGameMechanics: 'UNRESOLVED',
  normalStageResidenceDuringBattle: false,
  syntheticBattleLotteryImplemented: false,
  continuationResolutionPipeline: 'REUSE_EXISTING_STOCK_TREASURE_BATTLE_REVENGE_PIPELINE',
  stockPriorityResolverReused: true,
  revengeChanceRuntimeReused: true,
  duplicateContinuationResolverImplemented: false
});

export function getGoldenTimeSetPhase(gamesSettled, totalGames = GOLDEN_TIME_SET_PHASE_POLICY.totalApproxGames) {
  if (!Number.isInteger(gamesSettled) || gamesSettled < 0) throw new RangeError('gamesSettled must be a non-negative integer');
  if (!Number.isInteger(totalGames) || totalGames <= 0) throw new RangeError('totalGames must be a positive integer');
  if (gamesSettled >= totalGames) return GoldenTimeSetPhase.COMPLETE;
  if (gamesSettled >= GOLDEN_TIME_SET_PHASE_POLICY.mainGames) return GoldenTimeSetPhase.CONTINUATION_BATTLE;
  return GoldenTimeSetPhase.MAIN;
}

export function isGoldenTimeMainPhase(gamesSettled, totalGames) {
  return getGoldenTimeSetPhase(gamesSettled, totalGames) === GoldenTimeSetPhase.MAIN;
}
