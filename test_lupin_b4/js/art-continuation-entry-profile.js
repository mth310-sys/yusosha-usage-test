// Step 6Z correction: ART continuation-set entry presentation.
// Published Pachigabu play data explicitly reports that normal ART continuations use a
// direct Treasure add about 70% of the time, while initial ART and post-EXTRA entries
// always pass through a RUSH presentation. Because the ~70% value is empirical play data,
// not a recovered exact analysis-table probability, it is retained as evidence only and
// must not be used as an exact automatic lottery.
export const ART_CONTINUATION_ENTRY_PROFILE = Object.freeze({
  initialArt: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'PUBLISHED_ANALYSIS_DESCRIPTION'
  }),
  postExtra: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'PUBLISHED_ANALYSIS_DESCRIPTION'
  }),
  normalContinuation: Object.freeze({
    startingTreasureGuaranteed: true,
    lupinRushGuaranteed: false,
    directAddPossible: true,
    rushPossible: true,
    directAddObservedApproxPct: 70,
    directAddObservedOnly: true,
    exactRushVsDirectSplitResolved: false,
    exactDirectAddDistributionResolved: false,
    exactRushTypeDistributionResolved: false,
    currentCoreAlwaysRushRouteKnownProvisional: true
  }),
  policy: 'DO_NOT_USE_EMPIRICAL_70_PERCENT_AS_EXACT_LOTTERY; RECOVER CONTINUATION RUSH/DIRECT TABLE BEFORE CORE ROUTE CHANGE'
});

export function continuationEntrySnapshot() {
  return {
    initialArt: { ...ART_CONTINUATION_ENTRY_PROFILE.initialArt },
    postExtra: { ...ART_CONTINUATION_ENTRY_PROFILE.postExtra },
    normalContinuation: { ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation },
    policy: ART_CONTINUATION_ENTRY_PROFILE.policy
  };
}
