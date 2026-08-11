// Step 6Z: verified Treasure Hunt guarantees and minimum treasure floors.
// Source basis: published machine-analysis pages for Pachislot Lupin III - Kesareta Lupin.
// Only confirmed hold effects are encoded. Natural entry rate and success destination split remain unresolved.
export const TREASURE_HUNT_PROFILE = Object.freeze({
  successOutcome: Object.freeze({
    description: 'TREASURE_HUNT_SUCCESS_GIVES_TREASURE_OR_TREASURE_RUSH',
    destinationSplitResolved: false
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
    successTreasureDistribution: true
  }),
  policy: 'NO_AUTO_ENTRY_OR_SYNTHETIC_SPLIT_UNTIL_VERIFIED',
  source: 'VERIFIED_PUBLISHED_TREASURE_HUNT_HOLD_EFFECTS'
});

export function getTreasureHuntHoldGuarantee(type) {
  return TREASURE_HUNT_PROFILE.guaranteedHolds[type] ?? null;
}
