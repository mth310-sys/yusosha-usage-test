// Step 6Z: ART continuation-set entry presentation.
// Published analysis confirms that every continued set receives starting Treasure,
// but unlike initial ART / post-EXTRA entry, a normal continuation does NOT always
// enter one of the four LUPIN RUSH presentations.
// Pachigabu observed about 70% direct-add on normal continuations; this is explicitly
// an empirical value, so it must not be used as an exact automatic lottery.
export const ART_CONTINUATION_ENTRY_PROFILE = Object.freeze({
  initialArt: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'PUBLISHED_ANALYSIS'
  }),
  postExtra: Object.freeze({
    lupinRushGuaranteed: true,
    sourceLevel: 'PUBLISHED_ANALYSIS'
  }),
  normalContinuation: Object.freeze({
    startingTreasureGuaranteed: true,
    lupinRushGuaranteed: false,
    directAddObservedApproxPct: 70,
    directAddObservedOnly: true,
    exactRushVsDirectSplitResolved: false,
    exactDirectAddDistributionResolved: false,
    exactRushTypeDistributionResolved: false
  }),
  policy: 'DO_NOT_AUTO_ROUTE_NORMAL_CONTINUATION_USING_EMPIRICAL_70_PERCENT'
});

export function continuationEntrySnapshot() {
  return {
    initialArt: { ...ART_CONTINUATION_ENTRY_PROFILE.initialArt },
    postExtra: { ...ART_CONTINUATION_ENTRY_PROFILE.postExtra },
    normalContinuation: { ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation },
    policy: ART_CONTINUATION_ENTRY_PROFILE.policy
  };
}
