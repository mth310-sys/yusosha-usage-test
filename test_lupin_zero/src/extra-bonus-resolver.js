import { ReuseEvidenceStatus } from './reuse-registry.js';

export const EXTRA_BONUS_SPEC = Object.freeze({
  baseGames: 15,
  averageTotalGames: 29.6,
  oddAlignmentDenominator: 202.6,
  goldRushDenominator: 4924.3,
  pureIncreaseModel: 'FOLLOW_ART_3_BET_5_PAY',
  entryTrigger: 'TREASURE_REACHES_1000000',
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function createExtraBonusProfile(goldenTimeGamesRemaining) {
  if (!Number.isInteger(goldenTimeGamesRemaining) || goldenTimeGamesRemaining < 0) {
    throw new RangeError('goldenTimeGamesRemaining must be a non-negative integer');
  }
  return Object.freeze({
    games: EXTRA_BONUS_SPEC.baseGames + goldenTimeGamesRemaining,
    baseGames: EXTRA_BONUS_SPEC.baseGames,
    absorbedGoldenTimeGames: goldenTimeGamesRemaining,
    betCoinsPerGame: 3,
    payoutCoinsPerGame: 5,
    evidenceStatus: EXTRA_BONUS_SPEC.evidenceStatus
  });
}

export function resolveExtraBonusGame(randomSource) {
  requireRandomSource(randomSource);
  const oddDraw = randomSource.nextFloat();
  const goldRushDraw = randomSource.nextFloat();
  const oddAligned = oddDraw < 1 / EXTRA_BONUS_SPEC.oddAlignmentDenominator;
  const goldRushHit = goldRushDraw < 1 / EXTRA_BONUS_SPEC.goldRushDenominator;

  return Object.freeze({
    payoutCoins: 5,
    oddAligned,
    goldRushHit,
    oddDraw,
    goldRushDraw,
    oddAlignmentDenominator: EXTRA_BONUS_SPEC.oddAlignmentDenominator,
    goldRushDenominator: EXTRA_BONUS_SPEC.goldRushDenominator,
    oddAlignmentConsequence: 'GOLDEN_TIME_SET_STOCK_PLUS_1',
    goldRushDestination: 'GOLD_RUSH',
    evidenceStatus: EXTRA_BONUS_SPEC.evidenceStatus
  });
}
