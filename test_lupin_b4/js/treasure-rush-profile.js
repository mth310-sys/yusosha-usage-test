// Step 6Z: Treasure RUSH outline with cross-source duration confidence.
// Multiple independent published machine-analysis pages now agree on a 4-9G duration,
// while major summary pages state 4G or more. A conflicting 5-10G secondary claim is
// retained as a note, but 4-9G is promoted as the best-supported working model.
export const TREASURE_RUSH_PROFILE = Object.freeze({
  entryTrigger: 'TREASURE_HUNT_SUCCESS_OR_ART_CONTINUOUS_PERFORMANCE_SUCCESS',
  minimumGames: 4,
  maximumGames: 9,
  durationConfidence: 'CROSS_SOURCE_SECONDARY_PLUS_PRIMARY_4G_MINIMUM',
  publishedDurationClaims: Object.freeze([
    Object.freeze({range:'4G_OR_MORE',confidence:'HIGH',sourceGroup:'1GEKI_PWORLD_PACHIGABU'}),
    Object.freeze({range:'4_TO_9G',confidence:'CROSS_SOURCE',sourceGroup:'CHONBORISTA_PACHISLO_DATA'}),
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
  source: 'CROSS_SOURCE_PUBLISHED_TREASURE_RUSH_OUTLINE',
  unresolved: Object.freeze({
    entryRate: true,
    durationDistribution4To9: true,
    perGameTreasureDistribution: true,
    firstGameExactAwardRange: true,
    exactFujikoCueDistribution: true
  }),
  policy: '4_TO_9G_WORKING_MODEL; DO_NOT_AUTO_ENTRY OR SYNTHESIZE DURATION/AWARD DISTRIBUTIONS UNTIL EXACT TABLES ARE RECOVERED'
});

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    maximumGames: TREASURE_RUSH_PROFILE.maximumGames,
    durationConfidence: TREASURE_RUSH_PROFILE.durationConfidence,
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
