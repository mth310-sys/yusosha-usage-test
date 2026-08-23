import { ReuseEvidenceStatus } from './reuse-registry.js';

export const GT_TREASURE_HUNT_ROUTE_SPEC = Object.freeze({
  productionEntryDenominator: 175,
  calibrationBasis: 'SETTING6_SHOWROOM_ART_SPECIAL_ZONE_EXCLUDED_1750G_10_TREASURE_RUSHES',
  observedTreasureRushCount: 10,
  observedEligibleArtGames: 1750,
  observedTriggerPattern: 'MOST_RECORDED_ENTRIES_GREEN_CHANCE_EYE',
  exactRoleByRoleLotteryResolved: false,
  exactTreasureHuntNaturalEntryRateResolved: false,
  productionPresentationRoute: 'GREEN_CHANCE_EYE_PRECURSOR_TO_TREASURE_HUNT_SUCCESS_TO_TREASURE_RUSH',
  evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  replaceable: true
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveGtTreasureHuntRoute(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const hit = draw < 1 / GT_TREASURE_HUNT_ROUTE_SPEC.productionEntryDenominator;
  return Object.freeze({
    hit,
    draw,
    denominator: GT_TREASURE_HUNT_ROUTE_SPEC.productionEntryDenominator,
    chanceEyePresentation: hit ? 'GREEN_CHANCE_EYE' : null,
    treasureHuntSuccess: hit,
    treasureRush: hit,
    evidenceStatus: GT_TREASURE_HUNT_ROUTE_SPEC.evidenceStatus,
    inference: 'A setting-6 showroom log recorded 10 Treasure RUSH entries across 1750 ART games excluding special zones (about 1/175), with most recorded entries noted as green chance-eye triggered. This is used only as a replaceable production calibration until the original role-by-role image table is recovered.',
    replaceable: true
  });
}
