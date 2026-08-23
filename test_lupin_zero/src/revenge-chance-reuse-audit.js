import { REVENGE_CHANCE_PROFILE as PREVIOUS_B4_REVENGE_CHANCE_PROFILE } from '../../test_lupin_b4/js/revenge-chance-profile.js';
import { REVENGE_CHANCE_SPEC } from './revenge-chance-resolver.js';
import { evaluateReuseCandidate, ReuseEvidenceStatus } from './reuse-registry.js';
import { LUPIN_ZERO_TARGET } from './target-lock.js';

const previousDestinations = Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.successDestinations]);
const currentDestination = REVENGE_CHANCE_SPEC.destination;
const destinationConflict = previousDestinations.length !== 1 || previousDestinations[0] !== currentDestination;

export const REVENGE_CHANCE_REUSE_EVALUATION = evaluateReuseCandidate({
  sourcePath: 'test_lupin_b4/js/revenge-chance-profile.js',
  targetIdentityKey: LUPIN_ZERO_TARGET.identityKey,
  evidenceStatus: destinationConflict ? ReuseEvidenceStatus.CONFLICT : ReuseEvidenceStatus.PRESENTATION_ONLY,
  responsibility: 'RULES',
  productionBehavior: true,
  zeroYen: true,
  adaptationCost: 'LOW'
});

export const REVENGE_CHANCE_REUSE_AUDIT = Object.freeze({
  sourceModule: 'test_lupin_b4/js/revenge-chance-profile.js',
  sameTargetMachine: true,
  sharedGames: PREVIOUS_B4_REVENGE_CHANCE_PROFILE.games === REVENGE_CHANCE_SPEC.games,
  sharedEntrySources: Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.entrySources]),
  previousSuccessDestinations: previousDestinations,
  currentAutomaticDestination: currentDestination,
  successDestinationStatus: destinationConflict ? 'CONFLICT' : 'MATCH',
  reuseSharedStructureOnly: true,
  reuseDestinationRule: false,
  autoResolveDestinationConflict: false,
  evidenceStatus: destinationConflict ? 'CONFLICT' : 'PRESENTATION_ONLY',
  reuseRegistryApprovedForProductionRules: REVENGE_CHANCE_REUSE_EVALUATION.reusable
});
