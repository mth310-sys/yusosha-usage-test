import { test, expect } from '@playwright/test';
import {
  TREASURE_BATTLE_REUSE_EVALUATION,
  TREASURE_BATTLE_REUSE_POLICY,
  getReusableTreasureBattlePresentationProfile
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
