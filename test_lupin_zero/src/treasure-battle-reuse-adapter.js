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
  reuseMode: 'DIRECT_IMPORT_NO_DUPLICATION',
  reuseRegistryApproved: TREASURE_BATTLE_REUSE_EVALUATION.reusable,
  reuseRegistryMode: TREASURE_BATTLE_REUSE_EVALUATION.mode,
  presentationStructureStatus: 'REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION',
  opponentListStatus: 'REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION',
  opponentDistributionStatus: 'UNRESOLVED',
  chanceUpDistributionStatus: 'UNRESOLVED',
  exactBattleEntryTimingStatus: 'UNRESOLVED',
  autoDriveBattleFromPreviousFourGameProfile: false,
  noSyntheticOpponentDistribution: true,
  noSyntheticChanceUpDistribution: true
});

export function getReusableTreasureBattlePresentationProfile() {
  return PREVIOUS_B4_TREASURE_BATTLE_PROFILE;
}

export function getReusableTreasureBattlePhase(game) {
  return getPreviousB4BattlePhase(game);
}
