// Step 6Z: verified Treasure Hunt guarantees and minimum treasure floors.
// Source basis: published machine-analysis pages for Pachislot Lupin III - Kesareta Lupin.
// Only confirmed effects are encoded. Natural entry rate and generic success destination split remain unresolved.
export const TREASURE_HUNT_PROFILE = Object.freeze({
  successOutcome: Object.freeze({
    description: 'TREASURE_HUNT_SUCCESS_GIVES_TREASURE_OR_TREASURE_RUSH',
    destinationSplitResolved: false
  }),
  presentation: Object.freeze({
    artGameCountFrozenDuringContinuousPerformance: true,
    knownScenarios: Object.freeze([
      'BRIDGE_JUMP',
      'CUT_THROUGH_WARSHIP',
      'SHOOT_DOWN_COMBAT_HELICOPTER',
      'IMMORTAL_BOND'
    ]),
    immortalBond: Object.freeze({
      publishedExpectation: 'OVER_90_PERCENT',
      successGuaranteesTreasureRush: true,
      artStockCanAlsoOccur: true,
      artStockExactRateResolved: false
    })
  }),
  guaranteedHolds: Object.freeze({
    FLAME_LUPIN: Object.freeze({ successGuaranteed:true, minimumTreasurePoints:200000 }),
    FUJIKO: Object.freeze({ successGuaranteed:true, minimumTreasurePoints:300000 }),
    TAMACHAN: Object.freeze({ successGuaranteed:true, minimumTreasurePoints:1000000 })
  }),
  treasureRush: Object.freeze({
    successCanLeadToTreasureRush: true,
    minimumGames: 4,
    averageTreasurePoints: 499000
  }),
  unresolved: Object.freeze({
    naturalEntryRate: true,
    normalHoldSuccessRate: true,
    treasureVsRushDestinationSplit: true,
    successTreasureDistribution: true,
    scenarioSelectionDistribution: true,
    immortalBondArtStockRate: true
  }),
  policy: 'NO_AUTO_ENTRY_OR_SYNTHETIC_SPLIT_UNTIL_VERIFIED',
  source: 'VERIFIED_PUBLISHED_TREASURE_HUNT_HOLD_AND_PRESENTATION_EFFECTS'
});

export function getTreasureHuntHoldGuarantee(type) {
  return TREASURE_HUNT_PROFILE.guaranteedHolds[type] ?? null;
}

export function getTreasureHuntScenario(key) {
  if (key === 'IMMORTAL_BOND') return TREASURE_HUNT_PROFILE.presentation.immortalBond;
  return TREASURE_HUNT_PROFILE.presentation.knownScenarios.includes(key)
    ? { known:true, exactExpectationResolved:false }
    : null;
}
