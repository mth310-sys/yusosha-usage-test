import { test, expect } from '@playwright/test';

test('Zero reuses previous B4 Treasure Battle presentation profile without inventing distributions', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const reuse = await import('/test_lupin_zero/src/treasure-battle-reuse-adapter.js');
    const profile = reuse.getReusableTreasureBattlePresentationProfile();
    return {
      policy: reuse.TREASURE_BATTLE_REUSE_POLICY,
      totalGames: profile.totalGames,
      opponents: profile.opponents,
      phase1: reuse.getReusableTreasureBattlePhase(1),
      phase4: reuse.getReusableTreasureBattlePhase(4),
      opponentDistribution: profile.opponentDistribution,
      chanceUpDistribution: profile.chanceUpDistribution
    };
  });

  expect(result.policy.reuseMode).toBe('DIRECT_IMPORT_NO_DUPLICATION');
  expect(result.policy.presentationStructureStatus).toBe('REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION');
  expect(result.policy.exactBattleEntryTimingStatus).toBe('UNRESOLVED');
  expect(result.policy.autoDriveBattleFromPreviousFourGameProfile).toBe(false);
  expect(result.totalGames).toBe(4);
  expect(result.opponents.map((opponent) => opponent.key)).toEqual([
    'ZENIGATA','ZENIGATA_ROBO','LUPIN_GANG_ROBO','MASS_PRODUCED','FUJIKO'
  ]);
  expect(result.phase1.key).toBe('FIRST_ATTACK');
  expect(result.phase4.key).toBe('STAND_UP');
  expect(result.opponentDistribution).toBeNull();
  expect(result.chanceUpDistribution).toBeNull();
});
