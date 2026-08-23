import { ReuseEvidenceStatus } from './reuse-registry.js';

export const CONFIRMED_PRESENTATION_SPEC = Object.freeze({
  triggers: Object.freeze([
    'GOLD_PRESENTATION',
    'TIGER_PATTERN',
    'RAINBOW',
    'ATTACK_VISION',
    'GOLD_HOLD',
    'TAMACHAN_HOLD',
    'TIGER_FUJIKO_HOLD'
  ]),
  confirmedDestinationFamily: 'LUPIN_BONUS_OR_GOLDEN_TIME',
  exactBonusVsGoldenTimeSplitResolved: false,
  naturalOccurrenceRatesResolved: false,
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

export function resolveConfirmedPresentation(trigger) {
  const confirmed = CONFIRMED_PRESENTATION_SPEC.triggers.includes(trigger);
  return Object.freeze({
    trigger,
    confirmed,
    destinationFamily: confirmed ? CONFIRMED_PRESENTATION_SPEC.confirmedDestinationFamily : null,
    exactDestination: null,
    exactBonusVsGoldenTimeSplitResolved: false,
    evidenceStatus: confirmed ? CONFIRMED_PRESENTATION_SPEC.evidenceStatus : ReuseEvidenceStatus.UNRESOLVED
  });
}
