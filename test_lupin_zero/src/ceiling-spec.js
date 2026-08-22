export const CEILING_SPEC = Object.freeze({
  counter: Object.freeze({
    basis: 'BONUS_OR_ART_INTERVAL_GAMES',
    selectableGames: Object.freeze([499, 999]),
    resetByRaiunMode: false,
    resetConditions: Object.freeze(['LUPIN_BONUS_END', 'GOLDEN_TIME_END']),
    note: 'Published guides describe the ceiling as bonus/ART interval based; Raiun Mode does not reset the ceiling counter.'
  }),
  selectionBySetting: Object.freeze({
    1: Object.freeze({ 499: 0.8, 999: 99.2 }),
    2: Object.freeze({ 499: 1.6, 999: 98.4 }),
    3: Object.freeze({ 499: 3.1, 999: 96.9 }),
    4: Object.freeze({ 499: 4.7, 999: 95.3 }),
    5: Object.freeze({ 499: 9.4, 999: 90.6 }),
    6: Object.freeze({ 499: 12.5, 999: 87.5 })
  }),
  normalArrival: Object.freeze({
    destination: 'LUPIN_BONUS',
    immediateNoticeWithoutPrecursor: 'PUBLISHED_MACHINE_GUIDE',
    directGoldenTimeFromCeiling: null,
    directGoldenTimeProbability: null
  }),
  raiunArrivalOverride: Object.freeze({
    condition: 'CEILING_REACHED_WHILE_RAIUN_MODE_ACTIVE',
    destination: 'SHIN_RAIUN_MODE',
    goldenTimeGuaranteed: true,
    legendGateRelationshipStatus: 'CONFLICT',
    note: 'Published sources agree that ceiling arrival during Raiun Mode changes the route to Shin Raiun Mode. The exact Legend Gate relationship remains conflicting across sources and is not inferred here.'
  }),
  evidence: Object.freeze({
    ceilingSelectionBySetting: 'MULTI_SOURCE_MATCH',
    normalCeilingDestination: 'MULTI_SOURCE_MATCH',
    raiunDoesNotResetCeiling: 'PUBLISHED_MACHINE_GUIDE',
    raiunCeilingOverride: 'MULTI_SOURCE_MATCH',
    directGoldenTimeFromNormalCeiling: 'UNRESOLVED',
    shinRaiunLegendGateRelationship: 'CONFLICT'
  }),
  policy: Object.freeze({
    inferUnlistedCeilingGames: false,
    inferDirectGoldenTimeFromCeiling: false,
    inferLegendGateGuaranteeFromShinRaiun: false,
    reinterpretRaiunAsCeilingReset: false
  })
});

export function getCeilingSelection(setting) {
  return CEILING_SPEC.selectionBySetting[setting] ?? null;
}
