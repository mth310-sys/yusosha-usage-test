import { GT_SYSTEM_SPEC } from './gt-system-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

const RATES = GT_SYSTEM_SPEC.lupinRush.patternSelectionRates;
const ORDER = GT_SYSTEM_SPEC.lupinRush.patterns;
const SELECTION_CONTEXT = 'UNRESOLVED_BETWEEN_INITIAL_AND_CONTINUATION_ENTRY';

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

// The published 63/31/5/1 split is retained for research/debug reference only.
// Previous B4 analysis verified that initial ART and continuation play do not share
// the same Walther selection rate, so this unqualified split must not drive production.
export function resolveLupinRushPattern(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat() * 100;
  let cursor = 0;
  for (const pattern of ORDER) {
    cursor += RATES[pattern];
    if (draw < cursor) return Object.freeze({
      pattern,
      draw,
      evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
      referenceOnly: true,
      selectionContext: SELECTION_CONTEXT
    });
  }
  return Object.freeze({
    pattern: ORDER.at(-1),
    draw,
    evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
    referenceOnly: true,
    selectionContext: SELECTION_CONTEXT
  });
}

export function createLupinRushProfile() {
  return Object.freeze({
    pattern: null,
    draw: null,
    evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
    referenceOnlyPatternRates: RATES,
    automaticPatternSelectionAllowed: false,
    selectionContext: SELECTION_CONTEXT,
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
  patternSelectionRatesVerified: false,
  patternSelectionContextResolved: false,
  automaticPatternSelectionAllowed: false,
  patternSelectionContext: SELECTION_CONTEXT,
  patternRatesReferenceOnly: true,
  patternRates: RATES,
  games: GT_SYSTEM_SPEC.lupinRush.games,
  averageTreasure: GT_SYSTEM_SPEC.lupinRush.averageTreasurePoints,
  exactPatternAwardDistributionKnown: false,
  addExtraGamesOutsideGoldenTimeSet: false,
  synthesizePerPatternAwards: false
});
