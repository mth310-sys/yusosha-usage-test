// Step 6Z: verified Treasure RUSH outline.
// Sources cross-checked against published machine analysis pages.
// Only confirmed values are modeled here; entry rate and point distribution remain unresolved.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS',
  minimumGames: 4,
  maximumGames: 9,
  averageTreasurePoints: 499000,
  everyGameTreasureAdd: true,
  continuationCue: 'MADAMADA',
  source: 'VERIFIED_PUBLISHED_TREASURE_RUSH_OUTLINE',
  unresolved: Object.freeze({
    entryRate: true,
    durationDistribution4To9: true,
    perGameTreasureDistribution: true
  }),
  policy: 'NO_AUTO_ENTRY_OR_SYNTHETIC_DISTRIBUTION_UNTIL_VERIFIED'
});

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    maximumGames: TREASURE_RUSH_PROFILE.maximumGames,
    averageTreasurePoints: TREASURE_RUSH_PROFILE.averageTreasurePoints,
    everyGameTreasureAdd: TREASURE_RUSH_PROFILE.everyGameTreasureAdd,
    continuationCue: TREASURE_RUSH_PROFILE.continuationCue,
    unresolved: { ...TREASURE_RUSH_PROFILE.unresolved },
    policy: TREASURE_RUSH_PROFILE.policy
  };
}
