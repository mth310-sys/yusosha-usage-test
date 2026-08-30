// Observed-play evidence for the 2016 Olympia machine.
// IMPORTANT: the published practical-play table is a cumulative ART timeline,
// not an internal machine trace. The publisher explicitly says the displayed
// game count resets on bonus hit / ART END; it does not say that it resets at
// each continued GT set. Set-number rows are therefore annotations inside the
// cumulative ART count, not direct internal set-length counters.
export const GT_SET_LENGTH_OBSERVATION_SPEC = Object.freeze({
  source: Object.freeze({
    publisher: '1geki',
    title: '設定6 ショールーム実戦データ① パチスロ ルパン三世～消されたルパン～',
    url: 'https://1geki.jp/slot/s_k_lupin/01/',
    sourceType: 'PUBLISHED_OBSERVED_PLAY_DATA',
    publishedCounterNote: 'BONUS_HIT_OR_ART_END_RESETS_GAME_COUNT_ART_CONTINUATION_REMAINS_IN_SAME_COUNTER',
    publishedCounterNoteEvidenceStatus: 'PUBLISHED_SOURCE_EXPLICIT_NOTE'
  }),
  publishedNominalSetGames: 40,
  publishedNominalSetGamesMeaning: 'APPROXIMATE',
  observationUnit: 'PUBLISHED_CUMULATIVE_ART_COUNTER_INTERVAL_BETWEEN_SET_ANNOTATIONS',
  counterResetsAtArtEnd: true,
  counterResetsAtContinuedSetBoundary: false,
  counterResetSemanticsEvidenceStatus: 'PUBLISHED_SOURCE_EXPLICIT_NOTE',
  exactMachineSetLengthObservation: false,
  setAnnotationInternalBoundarySemanticsResolved: false,
  setAnnotationInternalBoundarySemanticsEvidenceStatus: 'UNRESOLVED',
  plainObservedCounterIntervalsGames: Object.freeze([
    42, 37, 38, 38,
    42, 42, 37,
    45, 43, 39, 39, 40, 43,
    42
  ]),
  // Backward-compatible alias only. Consumers must not interpret these counter
  // intervals as exact internal GT set lengths.
  plainObservedSetIntervalsGames: Object.freeze([
    42, 37, 38, 38,
    42, 42, 37,
    45, 43, 39, 39, 40, 43,
    42
  ]),
  observation: 'PUBLISHED_CUMULATIVE_ART_COUNTER_SET_ANNOTATION_INTERVALS_ARE_NOT_FIXED_AT_40',
  exactContinuationBattleEntryGame: null,
  exactContinuationBattleEntryGameEvidenceStatus: 'UNRESOLVED',
  lupinRushGames: 4,
  lupinRushDurationEvidenceStatus: 'PUBLISHED_ANALYSIS',
  lupinRushCountedInsideSetAnnotationInterval: null,
  lupinRushCounterInclusionEvidenceStatus: 'UNRESOLVED',
  treasureBattlePresentationGamesCandidate: 4,
  treasureBattlePresentationGamesCandidateEvidenceStatus: 'PRIOR_B4_VERIFIED_PRESENTATION_STRUCTURE_EXTERNAL_RECONFIRMATION_PENDING',
  treasureBattleCountedInsideSetAnnotationInterval: null,
  treasureBattleCounterInclusionEvidenceStatus: 'UNRESOLVED',
  fixedThirtyPlusTenRuntimeModelAllowed: false,
  fixedFortyGameRuntimeModelAllowed: false,
  inferVariableInternalSetLengthFromCounterIntervalsAllowed: false,
  evidenceStatus: 'PUBLISHED_OBSERVED_PLAY_DATA',
  productionEffect: 'CONSTRAINT_ONLY_DO_NOT_SYNTHESIZE_UNKNOWN_BATTLE_TIMING_OR_VARIABLE_SET_LENGTH'
});

export function summarizeGtSetLengthObservations() {
  const xs = GT_SET_LENGTH_OBSERVATION_SPEC.plainObservedCounterIntervalsGames;
  return Object.freeze({
    count: xs.length,
    min: Math.min(...xs),
    max: Math.max(...xs),
    hasNonFortyInterval: xs.some((value) => value !== 40),
    observationUnit: GT_SET_LENGTH_OBSERVATION_SPEC.observationUnit,
    counterResetsAtArtEnd: true,
    counterResetsAtContinuedSetBoundary: false,
    exactMachineSetLengthObservation: false,
    setAnnotationInternalBoundarySemanticsResolved: false,
    inferVariableInternalSetLengthFromCounterIntervalsAllowed: false,
    exactContinuationBattleEntryGame: null
  });
}
