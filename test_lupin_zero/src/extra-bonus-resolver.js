import { ReuseEvidenceStatus } from './reuse-registry.js';

export const EXTRA_BONUS_SPEC = Object.freeze({
  minimumAddedGames: 15,
  averageAddedGames: 18.2,
  averageTotalGames: 29.6,
  addedGameDistribution: null,
  addedGameDistributionStatus: 'UNRESOLVED_DO_NOT_SYNTHESIZE_FROM_AVERAGE',
  automaticDurationRollAllowed: false,
  oddAlignmentDenominator: null,
  oddAlignmentPreferredReferenceDenominator: 202.6,
  oddAlignmentConflictingReferenceDenominator: 4924.3,
  oddAlignmentRateStatus: 'CONFLICT',
  automaticOddAlignmentLotteryAllowed: false,
  goldRushDenominator: 4924.3,
  goldRushRateStatus: 'PUBLISHED_ANALYSIS_MULTI_SOURCE_MATCH',
  pureIncreaseModel: 'FOLLOW_ART_3_BET_5_PAY',
  entryTrigger: 'TREASURE_REACHES_1000000',
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function createExtraBonusProfile(goldenTimeGamesRemaining, verifiedAddedGames = null) {
  if (!Number.isInteger(goldenTimeGamesRemaining) || goldenTimeGamesRemaining < 0) {
    throw new RangeError('goldenTimeGamesRemaining must be a non-negative integer');
  }
  const durationResolved = Number.isInteger(verifiedAddedGames)
    && verifiedAddedGames >= EXTRA_BONUS_SPEC.minimumAddedGames;
  return Object.freeze({
    games: durationResolved ? goldenTimeGamesRemaining + verifiedAddedGames : null,
    minimumGames: goldenTimeGamesRemaining + EXTRA_BONUS_SPEC.minimumAddedGames,
    minimumAddedGames: EXTRA_BONUS_SPEC.minimumAddedGames,
    verifiedAddedGames: durationResolved ? verifiedAddedGames : null,
    absorbedGoldenTimeGames: goldenTimeGamesRemaining,
    durationResolved,
    automaticDurationRollAllowed: false,
    addedGameDistributionKnown: false,
    durationEvidenceStatus: durationResolved ? ReuseEvidenceStatus.VERIFIED : ReuseEvidenceStatus.UNRESOLVED,
    betCoinsPerGame: 3,
    payoutCoinsPerGame: 5,
    evidenceStatus: durationResolved ? ReuseEvidenceStatus.VERIFIED : ReuseEvidenceStatus.UNRESOLVED
  });
}

export function resolveExtraBonusGame(randomSource) {
  requireRandomSource(randomSource);
  const goldRushDraw = randomSource.nextFloat();
  const goldRushHit = goldRushDraw < 1 / EXTRA_BONUS_SPEC.goldRushDenominator;

  return Object.freeze({
    payoutCoins: 5,
    oddAligned: null,
    oddDraw: null,
    oddAlignmentDenominator: null,
    oddAlignmentRateStatus: EXTRA_BONUS_SPEC.oddAlignmentRateStatus,
    automaticOddAlignmentLotteryAllowed: false,
    goldRushHit,
    goldRushDraw,
    goldRushDenominator: EXTRA_BONUS_SPEC.goldRushDenominator,
    goldRushRateStatus: EXTRA_BONUS_SPEC.goldRushRateStatus,
    oddAlignmentConsequence: 'GOLDEN_TIME_SET_STOCK_PLUS_1_IF_ODD_ALIGNMENT_OCCURS',
    goldRushDestination: 'GOLD_RUSH',
    evidenceStatus: goldRushHit ? ReuseEvidenceStatus.PUBLISHED_ANALYSIS : ReuseEvidenceStatus.MULTI_SOURCE_MATCH
  });
}
