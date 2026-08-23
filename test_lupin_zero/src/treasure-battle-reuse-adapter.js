import {
  TREASURE_BATTLE_PROFILE as PREVIOUS_B4_TREASURE_BATTLE_PROFILE,
  getBattlePhase as getPreviousB4BattlePhase
} from '../../test_lupin_b4/js/treasure-battle-profile.js';
import { evaluateReuseCandidate, ReuseEvidenceStatus } from './reuse-registry.js';
import { LUPIN_ZERO_TARGET } from './target-lock.js';

export const TREASURE_BATTLE_REUSE_EVALUATION = evaluateReuseCandidate({
  sourcePath: 'test_lupin_b4/js/treasure-battle-profile.js',
  targetIdentityKey: LUPIN_ZERO_TARGET.identityKey,
  evidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY,
  responsibility: 'PRESENTATION',
  productionBehavior: false,
  zeroYen: true,
  adaptationCost: 'LOW'
});

export const TREASURE_BATTLE_REUSE_POLICY = Object.freeze({
  sourceModule: 'test_lupin_b4/js/treasure-battle-profile.js',
  backupSourceModule: 'backup_lupin_b4_pre_cabinet/js/treasure-battle-profile.js',
  originCommit: 'e89d51896bddbbb31261bc7084eeed5bc1e1743c',
  originCommitMessage: 'Step 6L add Treasure Battle profile',
  subsequentPriorImplementationCommits: Object.freeze([
    '9f9a23007367dd385f828f3969832aab2250ee2d',
    '2a679cbebe11f7c1f47a77bbd2e5d4c88eb8a737',
    'ea963bd717c60b4e448ccf076280d06b0e355e1d',
    'a865c731e38e6e588fedd7c41a256711bc1c0c4f'
  ]),
  priorProfilePreservedInBackup: true,
  reuseMode: 'DIRECT_IMPORT_NO_DUPLICATION',
  reuseRegistryApproved: TREASURE_BATTLE_REUSE_EVALUATION.reusable,
  reuseRegistryMode: TREASURE_BATTLE_REUSE_EVALUATION.mode,
  setEndWithoutStockTriggerStatus: 'MULTI_SOURCE_MATCH',
  exactBattleEntryGameNumberStatus: 'UNRESOLVED',
  presentationStructureStatus: 'PRIOR_B4_VERIFIED_PRESENTATION_STRUCTURE_EXTERNAL_RECONFIRMATION_PENDING',
  presentationStructureProductionUse: 'PRESENTATION_ONLY_WHEN_BATTLE_ENTRY_IS_ALREADY_RESOLVED',
  opponentListStatus: 'MULTI_SOURCE_MATCH',
  opponentExpectationOrderStatus: 'MULTI_SOURCE_MATCH',
  opponentDistributionStatus: 'UNRESOLVED',
  chanceUpDistributionStatus: 'UNRESOLVED',
  autoDriveBattleFromPreviousFourGameProfile: false,
  noSyntheticEntryGameNumber: true,
  noSyntheticOpponentDistribution: true,
  noSyntheticChanceUpDistribution: true
});

export function getReusableTreasureBattlePresentationProfile() {
  return PREVIOUS_B4_TREASURE_BATTLE_PROFILE;
}

export function getReusableTreasureBattlePhase(game) {
  return getPreviousB4BattlePhase(game);
}
