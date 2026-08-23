import { test, expect } from '@playwright/test';
import {
  TREASURE_BATTLE_REUSE_EVALUATION,
  TREASURE_BATTLE_REUSE_POLICY,
  getReusableTreasureBattlePresentationProfile,
  getReusableTreasureBattlePhase
} from '../test_lupin_zero/src/treasure-battle-reuse-adapter.js';
import {
  REVENGE_CHANCE_REUSE_AUDIT,
  REVENGE_CHANCE_REUSE_EVALUATION
} from '../test_lupin_zero/src/revenge-chance-reuse-audit.js';

test('prior B4 Treasure Battle presentation is reusable through the common reuse gate', () => {
  const profile = getReusableTreasureBattlePresentationProfile();
  expect(TREASURE_BATTLE_REUSE_EVALUATION.reusable).toBe(true);
  expect(TREASURE_BATTLE_REUSE_EVALUATION.mode).toBe('ADAPT_PRESENTATION');
  expect(TREASURE_BATTLE_REUSE_POLICY.reuseRegistryApproved).toBe(true);
  expect(TREASURE_BATTLE_REUSE_POLICY.setEndWithoutStockTriggerStatus).toBe('MULTI_SOURCE_MATCH');
  expect(TREASURE_BATTLE_REUSE_POLICY.exactBattleEntryGameNumberStatus).toBe('UNRESOLVED');
  expect(TREASURE_BATTLE_REUSE_POLICY.opponentListStatus).toBe('MULTI_SOURCE_MATCH');
  expect(TREASURE_BATTLE_REUSE_POLICY.opponentExpectationOrderStatus).toBe('MULTI_SOURCE_MATCH');
  expect(TREASURE_BATTLE_REUSE_POLICY.opponentDistributionStatus).toBe('UNRESOLVED');
  expect(profile.totalGames).toBe(4);
  expect(profile.opponents).toHaveLength(5);
  expect(profile.opponentDistribution).toBeNull();
  expect(profile.chanceUpDistribution).toBeNull();
  expect(TREASURE_BATTLE_REUSE_POLICY.autoDriveBattleFromPreviousFourGameProfile).toBe(false);
  expect(TREASURE_BATTLE_REUSE_POLICY.noSyntheticEntryGameNumber).toBe(true);
  expect(TREASURE_BATTLE_REUSE_POLICY.noSyntheticOpponentDistribution).toBe(true);
});

test('prior B4 Treasure Battle four-game presentation keeps provenance without becoming an automatic battle rule', () => {
  expect(TREASURE_BATTLE_REUSE_POLICY.backupSourceModule).toBe('backup_lupin_b4_pre_cabinet/js/treasure-battle-profile.js');
  expect(TREASURE_BATTLE_REUSE_POLICY.originCommit).toBe('e89d51896bddbbb31261bc7084eeed5bc1e1743c');
  expect(TREASURE_BATTLE_REUSE_POLICY.priorProfilePreservedInBackup).toBe(true);
  expect(TREASURE_BATTLE_REUSE_POLICY.subsequentPriorImplementationCommits).toHaveLength(4);
  expect(TREASURE_BATTLE_REUSE_POLICY.presentationStructureStatus).toBe('PRIOR_B4_VERIFIED_PRESENTATION_STRUCTURE_EXTERNAL_RECONFIRMATION_PENDING');
  expect(TREASURE_BATTLE_REUSE_POLICY.presentationStructureProductionUse).toBe('PRESENTATION_ONLY_WHEN_BATTLE_ENTRY_IS_ALREADY_RESOLVED');
  expect(getReusableTreasureBattlePhase(1)?.key).toBe('FIRST_ATTACK');
  expect(getReusableTreasureBattlePhase(2)?.key).toBe('CHANCE_DISPLAY');
  expect(getReusableTreasureBattlePhase(3)?.key).toBe('CUT_IN');
  expect(getReusableTreasureBattlePhase(4)?.key).toBe('STAND_UP');
  expect(getReusableTreasureBattlePhase(5)).toBeNull();
  expect(TREASURE_BATTLE_REUSE_POLICY.autoDriveBattleFromPreviousFourGameProfile).toBe(false);
});

test('prior B4 Revenge Chance destination set is reused but unresolved split is not invented', () => {
  expect(REVENGE_CHANCE_REUSE_AUDIT.sameTargetMachine).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.sharedGames).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.previousSuccessDestinations).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(REVENGE_CHANCE_REUSE_AUDIT.currentSuccessDestinations).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(REVENGE_CHANCE_REUSE_AUDIT.currentAutomaticDestination).toBeNull();
  expect(REVENGE_CHANCE_REUSE_AUDIT.successDestinationStatus).toBe('MATCH');
  expect(REVENGE_CHANCE_REUSE_AUDIT.successDestinationSplitStatus).toBe('UNRESOLVED');
  expect(REVENGE_CHANCE_REUSE_AUDIT.reuseSharedStructure).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.reuseDestinationSet).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.reuseDestinationSplit).toBe(false);
  expect(REVENGE_CHANCE_REUSE_AUDIT.autoSelectDestination).toBe(false);
  expect(REVENGE_CHANCE_REUSE_AUDIT.evidenceStatus).toBe('PUBLISHED_ANALYSIS');
  expect(REVENGE_CHANCE_REUSE_EVALUATION.reusable).toBe(true);
  expect(REVENGE_CHANCE_REUSE_EVALUATION.mode).toBe('ADAPT_OR_PORT');
});
