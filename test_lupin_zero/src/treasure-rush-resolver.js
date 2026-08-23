import { ReuseEvidenceStatus } from './reuse-registry.js';

const EMPIRICAL_DURATION_COUNTS = Object.freeze({ 4: 5, 5: 3, 6: 2 });
const EMPIRICAL_SAMPLE_SIZE = 10;

export const TREASURE_RUSH_SPEC = Object.freeze({
  minimumGames: 4,
  maximumGames: 9,
  publishedAverageTreasure: 499000,
  everyGameAddsTreasure: true,
  minimumTreasurePerGame: 50000,
  durationDistributionResolved: false,
  perGameDistributionResolved: false,
  naturalEntryRateResolved: false,
  productionModel: Object.freeze({
    durationModel: Object.freeze({
      source: 'SETTING6_SHOWROOM_EMPIRICAL_10_RUSHES',
      sampleSize: EMPIRICAL_SAMPLE_SIZE,
      counts: EMPIRICAL_DURATION_COUNTS,
      weightsPercent: Object.freeze({ 4: 50, 5: 30, 6: 20 }),
      unobservedPublishedDurations: Object.freeze([7, 8, 9]),
      evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE
    }),
    awardModelByDuration: Object.freeze({
      4: Object.freeze({ low: 100000, high: 150000, highProbability: 0.495, expectedTotal: 499000 }),
      5: Object.freeze({ low: 50000, high: 100000, highProbability: 0.996, expectedTotal: 499000 }),
      6: Object.freeze({ low: 50000, high: 100000, highProbability: 0.6633333333333333, expectedTotal: 499000 })
    }),
    expectedTreasure: 499000,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE
  }),
  boundaries: Object.freeze({
    publishedDurationRange: '4_TO_9_GAMES',
    firstGameCanExceedOneMillion: true,
    excessOverOneMillionCarriesToNextSet: true,
    noSyntheticNaturalEntry: true,
    sevenToNineGamesRemainPossibleButUncalibrated: true
  })
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveTreasureRushDuration(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const games = draw < 0.5 ? 4 : draw < 0.8 ? 5 : 6;
  return Object.freeze({
    games,
    draw,
    evidenceStatus: TREASURE_RUSH_SPEC.productionModel.durationModel.evidenceStatus,
    method: 'SETTING6_SHOWROOM_EMPIRICAL_5_3_2',
    exactPublishedDistribution: false
  });
}

export function createTreasureRushProfile(randomSource) {
  const duration = randomSource
    ? resolveTreasureRushDuration(randomSource)
    : Object.freeze({ games: 5, draw: null, evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE, method: 'COMPATIBILITY_DEFAULT', exactPublishedDistribution: false });
  return Object.freeze({
    games: duration.games,
    duration,
    evidenceStatus: TREASURE_RUSH_SPEC.productionModel.evidenceStatus,
    inference: 'Duration uses the observed 4G/5G/6G counts from ten setting-6 showroom Treasure RUSH samples. Published 7-9G remain possible but their formal weights are unresolved. Awards are duration-conditioned only to keep the published 499k mean while the exact award table remains unresolved.'
  });
}

export function resolveTreasureRushGame(randomSource, durationGames = 5) {
  requireRandomSource(randomSource);
  const model = TREASURE_RUSH_SPEC.productionModel.awardModelByDuration[durationGames];
  if (!model) throw new RangeError('Unsupported calibrated Treasure RUSH duration');
  const draw = randomSource.nextFloat();
  const treasure = draw < model.highProbability ? model.high : model.low;
  return Object.freeze({
    treasure,
    draw,
    durationGames,
    hit: true,
    evidenceStatus: TREASURE_RUSH_SPEC.productionModel.evidenceStatus,
    inference: 'Treasure RUSH adds treasure every game; exact award distribution remains unresolved. This replaceable duration-conditioned model preserves the published 499k mean.'
  });
}
