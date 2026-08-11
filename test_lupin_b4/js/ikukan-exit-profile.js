// Step 6Z: verified IKUKAN boundary and unresolved exit routing.
// Cross-source published descriptions agree that IKUKAN is a special 10G window with
// Treasure added every game and an average around 70万. Pachigabu additionally notes
// that IKUKAN can fall after those 10G and can be entered at the 30G boundary.
// The exact internal stage to restore after the 10G window has not been recovered.
export const IKUKAN_EXIT_PROFILE = Object.freeze({
  durationGames: 10,
  everyGameTreasureAdd: true,
  minimumTreasurePerGame: 50000,
  averageTreasurePointsApprox: 700000,
  canExitAfterWindow: true,
  entryAt30GBoundaryPossible: true,
  exactReturnInternalStageResolved: false,
  exactReturnVisibleStageResolved: false,
  exactReturnRule: null,
  sourceLevel: 'CROSS_SOURCE_PUBLISHED_DESCRIPTION_PLUS_PACHIGABU_PLAY_DESCRIPTION',
  policy: 'STOP_AT_IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL_UNTIL_RETURN_RULE_IS_VERIFIED'
});

export function ikukanExitSnapshot() {
  return {
    ...IKUKAN_EXIT_PROFILE
  };
}
