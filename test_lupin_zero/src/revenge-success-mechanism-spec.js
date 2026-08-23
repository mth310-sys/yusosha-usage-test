import { REVENGE_CHANCE_SPEC, resolveKnownRevengeDestination } from './revenge-chance-resolver.js';

export const REVENGE_SUCCESS_MECHANISM_SPEC = Object.freeze({
  pendingState: 'PENDING_REVENGE_SUCCESS_MECHANISM',
  knownMechanisms: Object.freeze([
    Object.freeze({
      key: 'COLLECT_FOUR_CHARACTERS',
      destination: 'LUPIN_BONUS',
      evidenceStatus: REVENGE_CHANCE_SPEC.characterCollectionDestinationEvidenceStatus
    }),
    Object.freeze({
      key: 'DIRECT_GOLDEN_TIME',
      destination: 'GOLDEN_TIME',
      evidenceStatus: REVENGE_CHANCE_SPEC.directGoldenTimeRouteEvidenceStatus
    })
  ]),
  automaticMechanismSelection: null,
  mechanismSplit: null,
  typewriterImpliesDirectGoldenTime: null,
  typewriterRouteEvidenceStatus: 'UNRESOLVED',
  unresolvedBehavior: 'HOLD_SUCCESS_WITHOUT_SYNTHETIC_DESTINATION'
});

export function resolveRevengeSuccessMechanism(mechanism) {
  const destination = resolveKnownRevengeDestination(mechanism);
  if (!destination.resolved) {
    return Object.freeze({
      resolved: false,
      mechanism: mechanism ?? null,
      destination: null,
      destinationCandidates: Object.freeze([...REVENGE_CHANCE_SPEC.successDestinations]),
      evidenceStatus: 'UNRESOLVED'
    });
  }
  return Object.freeze({
    resolved: true,
    mechanism: destination.mechanism,
    destination: destination.destination,
    destinationCandidates: Object.freeze([destination.destination]),
    evidenceStatus: destination.evidenceStatus
  });
}
