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
  expect(profile.totalGames).toBe(4);
  expect(profile.opponents).toHaveLength(5);
  expect(profile.opponentDistribution).toBeNull();
  expect(profile.chanceUpDistribution).toBeNull();
  expect(TREASURE_BATTLE_REUSE_POLICY.autoDriveBattleFromPreviousFourGameProfile).toBe(false);
});

test('prior B4 Revenge Chance destination conflict blocks production-rule reuse', () => {
  expect(REVENGE_CHANCE_REUSE_AUDIT.sameTargetMachine).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.sharedGames).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.previousSuccessDestinations).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(REVENGE_CHANCE_REUSE_AUDIT.currentAutomaticDestination).toBe('LUPIN_BONUS');
  expect(REVENGE_CHANCE_REUSE_AUDIT.successDestinationStatus).toBe('CONFLICT');
  expect(REVENGE_CHANCE_REUSE_AUDIT.reuseSharedStructureOnly).toBe(true);
  expect(REVENGE_CHANCE_REUSE_AUDIT.reuseDestinationRule).toBe(false);
  expect(REVENGE_CHANCE_REUSE_AUDIT.autoResolveDestinationConflict).toBe(false);
  expect(REVENGE_CHANCE_REUSE_AUDIT.evidenceStatus).toBe('CONFLICT');
  expect(REVENGE_CHANCE_REUSE_EVALUATION.reusable).toBe(false);
  expect(REVENGE_CHANCE_REUSE_EVALUATION.mode).toBe('REJECT_OR_RESEARCH_ONLY');
});
