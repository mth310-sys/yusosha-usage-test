// Step 6Z: verified Treasure RUSH outline.
// Sources cross-checked against published machine analysis pages.
// Only confirmed values are modeled here; entry rate and point distribution remain unresolved.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS',
  minimumGames: 4,
  averageTreasurePoints: 499000,
  source: 'VERIFIED_PUBLISHED_TREASURE_RUSH_OUTLINE',
  unresolved: Object.freeze({
    entryRate: true,
    continuationDistribution: true,
    perGameTreasureDistribution: true,
    exactEndConditionBeyondMinimum4G: true
  }),
  policy: 'NO_AUTO_ENTRY_OR_SYNTHETIC_DISTRIBUTION_UNTIL_VERIFIED'
});

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    averageTreasurePoints: TREASURE_RUSH_PROFILE.averageTreasurePoints,
    unresolved: { ...TREASURE_RUSH_PROFILE.unresolved },
    policy: TREASURE_RUSH_PROFILE.policy
  };
}
