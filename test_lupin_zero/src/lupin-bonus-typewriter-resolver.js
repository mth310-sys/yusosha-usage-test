export const LUPIN_BONUS_TYPEWRITER_SPEC = Object.freeze({
  highChanceZoneExists: true,
  highChanceEntryRateKnown: false,
  typewriterOccurrenceGuaranteesArt: true,
  exactTypewriterOccurrenceRateKnown: false,
  exactPerRoleArtLotteryKnown: false,
  evidenceStatus: 'MULTI_SOURCE_MATCH'
});

export function applyLupinBonusTypewriterGuarantee(hiddenOutcome) {
  if (!hiddenOutcome || typeof hiddenOutcome.artHit !== 'boolean') throw new TypeError('hiddenOutcome is required');
  if (hiddenOutcome.artHit) return hiddenOutcome;
  return Object.freeze({
    ...hiddenOutcome,
    artHit: true,
    successDestination: 'GOLDEN_TIME',
    evidenceStatus: 'TYPEWRITER_ART_GUARANTEE',
    guaranteedBy: 'LUPIN_BONUS_TYPEWRITER'
  });
}
