import { test, expect } from '@playwright/test';

test('VerifiedSpec locks WC cycle distributions and CZ duration setting differences', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { VERIFIED_SPEC } = await import('/test_lupin_zero/src/verified-spec.js');
    return {
      wanted: VERIFIED_SPEC.modeProfiles.wantedChance,
      duration: VERIFIED_SPEC.chanceZones.durationBySetting,
      evidence: VERIFIED_SPEC.evidence
    };
  });

  expect(result.wanted.cycleRanges).toEqual([
    '1-32','33-64','65-96','97-128','129-160','161-192','193-224','225-256','257-288','289-320','321-352','353-384','385-416','417-448','449-480'
  ]);
  expect(result.wanted.afterWantedBySetting[1]).toEqual([0.4,15.2,4.7,4.7,14.1,4.7,4.7,4.7,4.7,13.3,4.7,0,4.7,19.5,0]);
  expect(result.wanted.afterWantedBySetting[4]).toEqual([0.4,17.2,5.9,4.3,17.2,5.5,5.5,4.7,4.7,12.1,5.1,0.8,3.9,12.1,0.8]);
  expect(result.wanted.afterWantedBySetting[6]).toEqual([0.4,23.8,7.8,4.7,20.7,5.9,5.9,4.3,4.3,9.4,3.1,0.8,3.1,5.1,0.8]);
  expect(result.wanted.afterBonusArtOrReset).toEqual([6.3,6.3,3.9,25,39.1,2,2,2,2,2,2,2,2,2,2]);

  expect(result.duration[1]).toEqual({ tenGames:62.5, twentyGames:37.5 });
  expect(result.duration[3]).toEqual({ tenGames:60.9, twentyGames:39.1 });
  expect(result.duration[4]).toEqual({ tenGames:50, twentyGames:50 });
  expect(result.duration[6]).toEqual({ tenGames:47.7, twentyGames:52.3 });

  expect(result.evidence.wantedChanceCycleDistribution).toBe('MULTI_SOURCE_MATCH');
  expect(result.evidence.chanceZoneDurationBySetting).toBe('MULTI_SOURCE_MATCH');
});
