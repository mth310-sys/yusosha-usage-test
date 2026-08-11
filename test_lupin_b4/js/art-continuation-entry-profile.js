// Step 6Z: ART continuation-set entry presentation with explicit source conflict.
// HAZUSE and P-WORLD describe Treasure Battle victory / set continuation as entering LUPIN RUSH.
// Pachigabu practical-play data reports that normal continuations showed direct Treasure add about 70%
// of the time, while initial ART and post-EXTRA entries always used a RUSH presentation.
// Until the original continuation-entry distribution table is recovered, do not collapse these sources
// into a synthetic exact rule or use the empirical ~70% as a machine probability.
export const ART_CONTINUATION_ENTRY_PROFILE = Object.freeze({
  initialArt: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'CROSS_SOURCE_PUBLISHED_DESCRIPTION'
  }),
  postExtra: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'CROSS_SOURCE_PUBLISHED_DESCRIPTION'
  }),
  normalContinuation: Object.freeze({
    startingTreasureGuaranteed: true,
    exactRouteResolved: false,
    publishedAnalysisRoute: Object.freeze({
      route: 'TREASURE_BATTLE_WIN_TO_LUPIN_RUSH',
      sources: Object.freeze(['HAZUSE','P_WORLD'])
    }),
    publishedPlayObservation: Object.freeze({
      directAddObservedApproxPct: 70,
      source: 'PACHIGABU_PRACTICAL_PLAY_DATA',
      exactProbability: false
    }),
    exactRushVsDirectSplitResolved: false,
    exactDirectAddDistributionResolved: false,
    exactRushTypeDistributionResolved: false,
    currentCoreAlwaysRushRouteKnownProvisional: true
  }),
  sourceConflict: 'ANALYSIS_DESCRIPTION_ALWAYS_RUSH_VS_PRACTICAL_PLAY_DIRECT_ADD_OBSERVED',
  policy: 'KEEP_CURRENT_CORE_ROUTE_PROVISIONAL; DO_NOT_USE_EMPIRICAL_70_PERCENT_AS_EXACT_LOTTERY; RECOVER ORIGINAL CONTINUATION_ENTRY_TABLE_BEFORE ROUTE CHANGE'
});

export function continuationEntrySnapshot() {
  return {
    initialArt: { ...ART_CONTINUATION_ENTRY_PROFILE.initialArt },
    postExtra: { ...ART_CONTINUATION_ENTRY_PROFILE.postExtra },
    normalContinuation: {
      ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation,
      publishedAnalysisRoute: { ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation.publishedAnalysisRoute },
      publishedPlayObservation: { ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation.publishedPlayObservation }
    },
    sourceConflict: ART_CONTINUATION_ENTRY_PROFILE.sourceConflict,
    policy: ART_CONTINUATION_ENTRY_PROFILE.policy
  };
}
