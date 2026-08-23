import { GT_SYSTEM_SPEC } from './gt-system-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

const RATES = GT_SYSTEM_SPEC.lupinRush.patternSelectionRates;
const ORDER = GT_SYSTEM_SPEC.lupinRush.patterns;

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveLupinRushPattern(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat() * 100;
  let cursor = 0;
  for (const pattern of ORDER) {
    cursor += RATES[pattern];
    if (draw < cursor) return Object.freeze({ pattern, draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
  }
  return Object.freeze({ pattern: ORDER.at(-1), draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function createLupinRushProfile(randomSource) {
  const resolution = resolveLupinRushPattern(randomSource);
  return Object.freeze({
    ...resolution,
    games: GT_SYSTEM_SPEC.lupinRush.games,
    publishedAverageTreasure: GT_SYSTEM_SPEC.lupinRush.averageTreasurePoints,
    exactPatternAwardDistributionKnown: false,
    productionTreasureHandledByExistingInitialFallback: true,
    productionTreasureFallback: 350000,
    relationToGoldenTimeSet: 'FIRST_4_GAMES_OF_EXISTING_40G_WORKING_MODEL',
    relationEvidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
    replaceable: true
  });
}

export const LUPIN_RUSH_POLICY = Object.freeze({
  patternSelectionRatesVerified: true,
  patternRates: RATES,
  games: GT_SYSTEM_SPEC.lupinRush.games,
  averageTreasure: GT_SYSTEM_SPEC.lupinRush.averageTreasurePoints,
  exactPatternAwardDistributionKnown: false,
  addExtraGamesOutsideGoldenTimeSet: false,
  synthesizePerPatternAwards: false
});
