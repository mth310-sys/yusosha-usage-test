// Step 6Z: verified IKUKAN boundary and unresolved exit routing.
// Published analysis identifies IKUKAN as a fixed 10G special window with Treasure
// added every game, minimum 5万 per game, and an analysis average of 70.2万 Treasure.
// Pachigabu additionally notes that IKUKAN can fall after those 10G and can be entered
// at the 30G boundary. The exact internal stage to restore after the window is unresolved.
export const IKUKAN_EXIT_PROFILE = Object.freeze({
  durationGames: 10,
  everyGameTreasureAdd: true,
  minimumTreasurePerGame: 50000,
  averageTreasurePoints: 702000,
  averageSourceLevel: 'PUBLISHED_ANALYSIS_VALUE',
  canExitAfterWindow: true,
  entryAt30GBoundaryPossible: true,
  exactReturnInternalStageResolved: false,
  exactReturnVisibleStageResolved: false,
  exactReturnRule: null,
  sourceLevel: 'CROSS_SOURCE_PUBLISHED_ANALYSIS_PLUS_PACHIGABU_DESCRIPTION',
  policy: 'STOP_AT_IKUKAN_EXIT_PENDING_RETURN_STAGE_MODEL_UNTIL RETURN RULE IS VERIFIED'
});

export function ikukanExitSnapshot() {
  return {
    ...IKUKAN_EXIT_PROFILE
  };
}
