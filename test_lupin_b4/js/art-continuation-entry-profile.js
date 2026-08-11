// Step 6Z correction: verified ART continuation-set entry presentation.
// Cross-check across HAZUSE, P-WORLD and 1geki: when a Treasure Battle is won and the
// ART set continues, the next set starts with LUPIN RUSH. The previous empirical note
// suggesting frequent direct-add starts was not suitable as a machine-rule model.
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
    lupinRushGuaranteed: true,
    route: 'TREASURE_BATTLE_WIN_TO_LUPIN_RUSH',
    sourceLevel: 'CROSS_SOURCE_PUBLISHED_ANALYSIS',
    exactRushTypeDistributionResolved: false,
    perGameAwardDistributionResolved: false
  }),
  policy: 'CONTINUED_SET_STARTS_WITH_LUPIN_RUSH; DO_NOT_SYNTHESIZE_RUSH_TYPE_SPLIT'
});

export function continuationEntrySnapshot() {
  return {
    initialArt: { ...ART_CONTINUATION_ENTRY_PROFILE.initialArt },
    postExtra: { ...ART_CONTINUATION_ENTRY_PROFILE.postExtra },
    normalContinuation: { ...ART_CONTINUATION_ENTRY_PROFILE.normalContinuation },
    policy: ART_CONTINUATION_ENTRY_PROFILE.policy
  };
}
