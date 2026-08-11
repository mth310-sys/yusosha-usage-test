// Step 6Z: verified Treasure RUSH outline.
// Sources cross-checked against published machine analysis pages.
// Only confirmed values are modeled here; unknown duration/award distributions are not synthesized.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS_OR_ART_CONTINUOUS_PERFORMANCE_SUCCESS',
  minimumGames: 4,
  maximumGames: null,
  averageTreasurePoints: 499000,
  everyGameTreasureAdd: true,
  continuationCue: 'MADAMADA',
  countdownStartsFromRemaining4Games: true,
  perGameAward: Object.freeze({
    normalMinimumPoints: 50000,
    normalMaximumPoints: 1000000,
    firstGameCanExceed1000000: true,
    fiveOrTenManShareApprox: 'ABOUT_90_PERCENT_PUBLISHED_DESCRIPTION_ONLY'
  }),
  presentation: Object.freeze({
    hotCharacters: Object.freeze(['LUPIN','FUJIKO']),
    fujikoCueGuarantee: '50_OR_100_MAN_POINTS_OR_MORE_PUBLISHED_DESCRIPTION'
  }),
  carryover: Object.freeze({
    canContinueAddingBeyondDisplayed1000000: true,
    excessPointsCarryToNextArtSet: true,
    extraBonusCanChainFromEarlyNextSetCarryover: true
  }),
  source: 'VERIFIED_PUBLISHED_TREASURE_RUSH_OUTLINE',
  unresolved: Object.freeze({
    entryRate: true,
    maximumGames: true,
    durationDistribution: true,
    perGameTreasureDistribution: true,
    firstGameExactAwardRange: true,
    exactFujikoCueDistribution: true
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
    countdownStartsFromRemaining4Games: TREASURE_RUSH_PROFILE.countdownStartsFromRemaining4Games,
    perGameAward: { ...TREASURE_RUSH_PROFILE.perGameAward },
    presentation: { ...TREASURE_RUSH_PROFILE.presentation },
    carryover: { ...TREASURE_RUSH_PROFILE.carryover },
    unresolved: { ...TREASURE_RUSH_PROFILE.unresolved },
    policy: TREASURE_RUSH_PROFILE.policy
  };
}
