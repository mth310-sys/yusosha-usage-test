// Step 6Z: Treasure RUSH outline with cross-source duration confidence.
// Multiple independent published machine-analysis pages agree on a 4-9G duration,
// while major summary pages state 4G or more. The per-game award table itself has now
// been located on P-GABU, but its numeric cells remain image-only and are not yet safely
// transcribed. Automatic award draws therefore remain disabled.
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
  roundedPublishedAverageTreasurePoints: 500000,
  averageTreasureStatus: '499K_PRECISE_WORKING_VALUE_WITH_MULTIPLE_SUMMARY_SOURCES_ROUNDING_TO_500K',
  everyGameTreasureAdd: true,
  continuationCue: 'MADAMADA',
  countdownStartsFromRemaining4Games: true,
  perGameAward: Object.freeze({
    normalMinimumPoints: 50000,
    normalMaximumPoints: 1000000,
    firstGameCanExceed1000000: true,
    fiveOrTenManShareApprox: 'ABOUT_90_PERCENT_PUBLISHED_DESCRIPTION_ONLY',
    exactDistribution:null,
    exactDistributionStatus:'SOURCE_IMAGE_TABLE_LOCATED_NUMERIC_CELLS_NOT_SAFELY_TRANSCRIBED',
    exactDistributionSourceLocation:'P_GABU_TREASURE_RUSH_PER_GAME_AWARD_IMAGE_TABLE'
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
  testPolicy: Object.freeze({
    allowManualDurationOnly: true,
    allowManualAwardOnly: true,
    automaticDurationDraw: false,
    automaticAwardDraw: false,
    automaticEntry: false,
    reason: 'EXACT_DISTRIBUTION_IMAGE_TABLE_LOCATED_BUT_NUMERIC_CELLS_NOT_RECOVERED'
  }),
  policy: '4_TO_9G_WORKING_MODEL; MANUAL TESTS MAY USE VERIFIED BOUNDS; DO NOT AUTO ENTRY OR SYNTHESIZE DURATION/AWARD DISTRIBUTIONS UNTIL EXACT TABLES ARE RECOVERED'
});

export function isSupportedTreasureRushDuration(games) {
  const value = Number(games);
  return Number.isInteger(value)
    && value >= TREASURE_RUSH_PROFILE.minimumGames
    && value <= TREASURE_RUSH_PROFILE.maximumGames;
}

export function getTreasureRushAwardBounds(gameIndex=1) {
  const firstGame = Number(gameIndex) === 1;
  return {
    minimumPoints: TREASURE_RUSH_PROFILE.perGameAward.normalMinimumPoints,
    maximumPoints: firstGame && TREASURE_RUSH_PROFILE.perGameAward.firstGameCanExceed1000000
      ? null
      : TREASURE_RUSH_PROFILE.perGameAward.normalMaximumPoints,
    maximumResolved: !(firstGame && TREASURE_RUSH_PROFILE.perGameAward.firstGameCanExceed1000000)
  };
}

export function validateTreasureRushManualAward(points, gameIndex=1) {
  const value = Number(points);
  if (!Number.isFinite(value)) return false;
  const bounds = getTreasureRushAwardBounds(gameIndex);
  if (value < bounds.minimumPoints) return false;
  if (bounds.maximumResolved && value > bounds.maximumPoints) return false;
  return true;
}

export function hasVerifiedTreasureRushAwardDistribution(){
  return Array.isArray(TREASURE_RUSH_PROFILE.perGameAward.exactDistribution)
    && TREASURE_RUSH_PROFILE.perGameAward.exactDistribution.length>0;
}

export function treasureRushSnapshot() {
  return {
    entryTrigger: TREASURE_RUSH_PROFILE.entryTrigger,
    minimumGames: TREASURE_RUSH_PROFILE.minimumGames,
    maximumGames: TREASURE_RUSH_PROFILE.maximumGames,
    durationConfidence: TREASURE_RUSH_PROFILE.durationConfidence,
    publishedDurationClaims: TREASURE_RUSH_PROFILE.publishedDurationClaims.map(x=>({ ...x })),
    averageTreasurePoints: TREASURE_RUSH_PROFILE.averageTreasurePoints,
    roundedPublishedAverageTreasurePoints: TREASURE_RUSH_PROFILE.roundedPublishedAverageTreasurePoints,
    everyGameTreasureAdd: TREASURE_RUSH_PROFILE.everyGameTreasureAdd,
    continuationCue: TREASURE_RUSH_PROFILE.continuationCue,
    countdownStartsFromRemaining4Games: TREASURE_RUSH_PROFILE.countdownStartsFromRemaining4Games,
    perGameAward: { ...TREASURE_RUSH_PROFILE.perGameAward },
    presentation: { ...TREASURE_RUSH_PROFILE.presentation },
    carryover: { ...TREASURE_RUSH_PROFILE.carryover },
    unresolved: { ...TREASURE_RUSH_PROFILE.unresolved },
    testPolicy: { ...TREASURE_RUSH_PROFILE.testPolicy },
    policy: TREASURE_RUSH_PROFILE.policy
  };
}
