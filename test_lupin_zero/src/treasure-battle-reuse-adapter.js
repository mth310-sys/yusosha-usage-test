import {
  TREASURE_BATTLE_PROFILE as PREVIOUS_B4_TREASURE_BATTLE_PROFILE,
  getBattlePhase as getPreviousB4BattlePhase
} from '../../test_lupin_b4/js/treasure-battle-profile.js';

export const TREASURE_BATTLE_REUSE_POLICY = Object.freeze({
  sourceModule: 'test_lupin_b4/js/treasure-battle-profile.js',
  reuseMode: 'DIRECT_IMPORT_NO_DUPLICATION',
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
