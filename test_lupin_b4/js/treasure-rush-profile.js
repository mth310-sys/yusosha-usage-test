// Step 6Z: verified Treasure RUSH outline.
// Sources cross-checked against published machine analysis pages.
// Only confirmed values are modeled here; unknown duration/award distributions are not synthesized.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS',
  minimumGames: 4,
  averageTreasurePoints: 499000,
  everyGameTreasureAdd: true,
  continuationCue: 'MADAMADA',
  perGameAward: Object.freeze({
    normalMinimumPoints: 50000,
    normalMaximumPoints: 1000000,
    firstGameCanExceed1000000: true,
    fiveOrTenManShareApprox: 'ABOUT_90_PERCENT_PUBLISHED_DESCRIPTION_ONLY'
  }),
  source: 'VERIFIED_PUBLISHED_TREASURE_RUSH_OUTLINE',
  unresolved: Object.freeze({
    entryRate: true,
    maximumGames: true,
    durationDistribution: true,
    perGameTreasureDistribution: true,
    firstGameExactAwardRange: true
  }),
  policy: 'NO_AUTO_ENTRY_OR_SYNTHETIC_DISTRIBUTION_UNTIL_VERIFIED'
});

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    averageTreasurePoints: TREASURE_RUSH_PROFILE.averageTreasurePoints,
    everyGameTreasureAdd: TREASURE_RUSH_PROFILE.everyGameTreasureAdd,
    continuationCue: TREASURE_RUSH_PROFILE.continuationCue,
    perGameAward: { ...TREASURE_RUSH_PROFILE.perGameAward },
    unresolved: { ...TREASURE_RUSH_PROFILE.unresolved },
    policy: TREASURE_RUSH_PROFILE.policy
  };
}
