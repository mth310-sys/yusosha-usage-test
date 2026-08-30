// Observed-play evidence for the 2016 Olympia machine.
// This does not define the internal battle entry game. It only constrains models
// that would incorrectly turn the published "about 40G" set description into a
// fixed 40G / fixed post-30G battle boundary.
export const GT_SET_LENGTH_OBSERVATION_SPEC = Object.freeze({
  source: Object.freeze({
    publisher: '1geki',
    title: '設定6 ショールーム実戦データ① パチスロ ルパン三世～消されたルパン～',
    url: 'https://1geki.jp/slot/s_k_lupin/01/',
    sourceType: 'PUBLISHED_OBSERVED_PLAY_DATA'
  }),
  publishedNominalSetGames: 40,
  publishedNominalSetGamesMeaning: 'APPROXIMATE',
  // Consecutive set-start / END deltas recoverable directly from the published
  // practical-play timeline when no intervening EXTRA BONUS / Treasure RUSH
  // makes the interval unsuitable as a plain set-length observation.
  plainObservedSetIntervalsGames: Object.freeze([
    42, 37, 38, 38, // 1 -> 2 -> 3 -> 4 -> 5 in one run
    42, 42, 37,     // another 1 -> 2 -> 3 -> END run
    45, 43, 39, 39, 40, 43, // long run, early plain intervals
    42              // single-set run ending at 42G
  ]),
  observation: 'PLAIN_SET_INTERVALS_ARE_NOT_FIXED_AT_40_GAMES',
  exactContinuationBattleEntryGame: null,
  exactContinuationBattleEntryGameEvidenceStatus: 'UNRESOLVED',
  fixedThirtyPlusTenRuntimeModelAllowed: false,
  fixedFortyGameRuntimeModelAllowed: false,
  evidenceStatus: 'PUBLISHED_OBSERVED_PLAY_DATA',
  productionEffect: 'CONSTRAINT_ONLY_DO_NOT_SYNTHESIZE_UNKNOWN_BATTLE_TIMING'
});

export function summarizeGtSetLengthObservations() {
  const xs = GT_SET_LENGTH_OBSERVATION_SPEC.plainObservedSetIntervalsGames;
  return Object.freeze({
    count: xs.length,
    min: Math.min(...xs),
    max: Math.max(...xs),
    hasNonFortyInterval: xs.some((value) => value !== 40),
    exactContinuationBattleEntryGame: null
  });
}
