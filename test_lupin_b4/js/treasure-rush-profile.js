// Step 6Z: verified Treasure RUSH outline.
// Sources cross-checked against published machine analysis pages.
// Only confirmed values are modeled here; conflicting duration claims are retained explicitly.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS_OR_ART_CONTINUOUS_PERFORMANCE_SUCCESS',
  minimumGames: 4,
  maximumGames: null,
  publishedDurationClaims: Object.freeze([
    Object.freeze({range:'4G_OR_MORE',confidence:'HIGH',sourceGroup:'1GEKI_PWORLD_PACHIGABU'}),
    Object.freeze({range:'4_TO_9G',confidence:'SECONDARY_CROSS_SOURCE',sourceGroup:'CHONBORISTA_PACHISLO_DATA'}),
    Object.freeze({range:'5_TO_10G',confidence:'CONFLICTING_SECONDARY',sourceGroup:'KUMAPAPA'})
  ]),
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
  policy: 'USE_MINIMUM_4G_ONLY; DO_NOT_AUTO_ENTRY_OR_SYNTHESIZE_DURATION/AWARD DISTRIBUTIONS UNTIL VERIFIED'
});

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    maximumGames: TREASURE_RUSH_PROFILE.maximumGames,
    publishedDurationClaims: TREASURE_RUSH_PROFILE.publishedDurationClaims.map(x=>({ ...x })),
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
