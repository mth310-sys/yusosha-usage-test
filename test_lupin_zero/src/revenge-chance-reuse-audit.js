import { REVENGE_CHANCE_PROFILE as PREVIOUS_B4_REVENGE_CHANCE_PROFILE } from '../../test_lupin_b4/js/revenge-chance-profile.js';
import { REVENGE_CHANCE_PROFILE as BACKUP_B4_REVENGE_CHANCE_PROFILE } from '../../backup_lupin_b4_pre_cabinet/js/revenge-chance-profile.js';
import { REVENGE_CHANCE_SPEC } from './revenge-chance-resolver.js';
import { evaluateReuseCandidate, ReuseEvidenceStatus } from './reuse-registry.js';
import { LUPIN_ZERO_TARGET } from './target-lock.js';

const previousDestinations = Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.successDestinations]);
const currentDestinations = Object.freeze([...REVENGE_CHANCE_SPEC.successDestinations]);
const destinationSetMatches = previousDestinations.length === currentDestinations.length
  && previousDestinations.every((destination) => currentDestinations.includes(destination));
const previousProfileMatchesBackup = JSON.stringify(PREVIOUS_B4_REVENGE_CHANCE_PROFILE) === JSON.stringify(BACKUP_B4_REVENGE_CHANCE_PROFILE);
const verifiedMechanics = Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.verifiedMechanics]);

export const REVENGE_CHANCE_REUSE_EVALUATION = evaluateReuseCandidate({
  sourcePath: 'test_lupin_b4/js/revenge-chance-profile.js',
  targetIdentityKey: LUPIN_ZERO_TARGET.identityKey,
  evidenceStatus: destinationSetMatches ? ReuseEvidenceStatus.PUBLISHED_ANALYSIS : ReuseEvidenceStatus.CONFLICT,
  responsibility: 'RULES',
  productionBehavior: true,
  zeroYen: true,
  adaptationCost: 'LOW'
});

export const REVENGE_CHANCE_PRESENTATION_REUSE = Object.freeze({
  games: PREVIOUS_B4_REVENGE_CHANCE_PROFILE.games,
  verifiedMechanics,
  characterCollectionMechanic: verifiedMechanics.includes('COLLECT_FOUR_CHARACTERS'),
  typewriterRevengePatterns: verifiedMechanics.includes('TYPEWRITER_REVENGE_PATTERNS'),
  characterCollectionTarget: 4,
  perGameCharacterCollectionLottery: null,
  typewriterPatternDistribution: null,
  automaticCharacterAcquisition: false,
  automaticTypewriterPatternSelection: false,
  presentationUse: 'SHOW_VERIFIED_STRUCTURE_WITHOUT_INVENTING_OCCURRENCE_TIMING',
  evidenceStatus: previousProfileMatchesBackup ? 'PRIOR_B4_VERIFIED_AND_BACKUP_MATCH' : 'PRIOR_B4_VERIFIED_BACKUP_CONFLICT'
});

export const REVENGE_CHANCE_REUSE_AUDIT = Object.freeze({
  sourceModule: 'test_lupin_b4/js/revenge-chance-profile.js',
  backupSourceModule: 'backup_lupin_b4_pre_cabinet/js/revenge-chance-profile.js',
  sameTargetMachine: true,
  priorProfilePreservedInBackup: previousProfileMatchesBackup,
  sharedGames: PREVIOUS_B4_REVENGE_CHANCE_PROFILE.games === REVENGE_CHANCE_SPEC.games,
  sharedEntrySources: Object.freeze([...PREVIOUS_B4_REVENGE_CHANCE_PROFILE.entrySources]),
  verifiedMechanics,
  previousSuccessDestinations: previousDestinations,
  currentSuccessDestinations: currentDestinations,
  currentAutomaticDestination: REVENGE_CHANCE_SPEC.automaticSuccessDestination,
  successDestinationStatus: destinationSetMatches ? 'MATCH' : 'CONFLICT',
  successDestinationSplitStatus: REVENGE_CHANCE_SPEC.successDestinationSplit == null ? 'UNRESOLVED' : 'RESOLVED',
  reuseSharedStructure: destinationSetMatches && previousProfileMatchesBackup,
  reusePresentationMechanics: previousProfileMatchesBackup,
  reuseDestinationSet: destinationSetMatches,
  reuseDestinationSplit: false,
  autoSelectDestination: false,
  autoResolveCharacterCollection: false,
  autoSelectTypewriterPattern: false,
  evidenceStatus: destinationSetMatches && previousProfileMatchesBackup ? 'PUBLISHED_ANALYSIS_PLUS_PRIOR_VERIFIED_PRESENTATION' : 'CONFLICT',
  reuseRegistryApprovedForProductionRules: REVENGE_CHANCE_REUSE_EVALUATION.reusable
});
