import { ReuseEvidenceStatus } from './reuse-registry.js';

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
    durationGames: 5,
    awardPoints: Object.freeze([50000, 100000]),
    hundredThousandProbability: 0.996,
    expectedTreasure: 499000,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE
  }),
  boundaries: Object.freeze({
    publishedDurationRange: '4_TO_9_GAMES',
    firstGameCanExceedOneMillion: true,
    excessOverOneMillionCarriesToNextSet: true,
    noSyntheticNaturalEntry: true
  })
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function createTreasureRushProfile() {
  return Object.freeze({
    games: TREASURE_RUSH_SPEC.productionModel.durationGames,
    evidenceStatus: TREASURE_RUSH_SPEC.productionModel.evidenceStatus,
    inference: '5G working duration is inside the published 4-9G range; 50k/100k awards are a replaceable mean-matching model for the published 499k average.'
  });
}

export function resolveTreasureRushGame(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const treasure = draw < TREASURE_RUSH_SPEC.productionModel.hundredThousandProbability ? 100000 : 50000;
  return Object.freeze({
    treasure,
    draw,
    hit: true,
    evidenceStatus: TREASURE_RUSH_SPEC.productionModel.evidenceStatus,
    inference: 'Treasure RUSH adds treasure every game; exact award distribution remains unresolved.'
  });
}
