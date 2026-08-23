import { REVENGE_CHANCE_PROFILE as PREVIOUS_B4_REVENGE_CHANCE_PROFILE } from '../../test_lupin_b4/js/revenge-chance-profile.js';
import { REVENGE_CHANCE_SPEC } from './revenge-chance-resolver.js';
import { evaluateReuseCandidate, ReuseEvidenceStatus } from './reuse-registry.js';
import { LUPIN_ZERO_TARGET } from './target-lock.js';

const previousDestinations = Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.successDestinations]);
const currentDestinations = Object.freeze([...REVENGE_CHANCE_SPEC.successDestinations]);
const destinationSetMatches = previousDestinations.length === currentDestinations.length
  && previousDestinations.every((destination) => currentDestinations.includes(destination));

export const REVENGE_CHANCE_REUSE_EVALUATION = evaluateReuseCandidate({
  sourcePath: 'test_lupin_b4/js/revenge-chance-profile.js',
  targetIdentityKey: LUPIN_ZERO_TARGET.identityKey,
  evidenceStatus: destinationSetMatches ? ReuseEvidenceStatus.PUBLISHED_ANALYSIS : ReuseEvidenceStatus.CONFLICT,
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
  currentSuccessDestinations: currentDestinations,
  currentAutomaticDestination: REVENGE_CHANCE_SPEC.automaticSuccessDestination,
  successDestinationStatus: destinationSetMatches ? 'MATCH' : 'CONFLICT',
  successDestinationSplitStatus: REVENGE_CHANCE_SPEC.successDestinationSplit == null ? 'UNRESOLVED' : 'RESOLVED',
  reuseSharedStructure: destinationSetMatches,
  reuseDestinationSet: destinationSetMatches,
  reuseDestinationSplit: false,
  autoSelectDestination: false,
  evidenceStatus: destinationSetMatches ? 'PUBLISHED_ANALYSIS' : 'CONFLICT',
  reuseRegistryApprovedForProductionRules: REVENGE_CHANCE_REUSE_EVALUATION.reusable
});
