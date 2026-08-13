import { test, expect } from '@playwright/test';

test('Raiun HIGH profile rejects unsupported levels instead of silently using LOW', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/raiun-profile.js');
    return {
      unknownProfile: profile.getRaiunHighProfile('UNKNOWN'),
      unknownRoll: profile.rollRaiunHighEntry('UNKNOWN', {next:()=>0}),
      lowProfile: profile.getRaiunHighProfile('LOW'),
      highProfile: profile.getRaiunHighProfile('HIGH'),
      lowHit: profile.rollRaiunHighEntry('LOW', {next:()=>0}),
      lowMiss: profile.rollRaiunHighEntry('LOW', {next:()=>0.999999}),
      highHit: profile.rollRaiunHighEntry('HIGH', {next:()=>0}),
      highMiss: profile.rollRaiunHighEntry('HIGH', {next:()=>0.999999})
    };
  });

  expect(result.unknownProfile).toBeNull();
  expect(result.unknownRoll).toBeNull();
  expect(result.lowProfile.denominator).toBe(30.5);
  expect(result.lowProfile.expectation).toBe(20.0);
  expect(result.highProfile.denominator).toBe(13.3);
  expect(result.highProfile.expectation).toBe(40.0);
  expect(result.lowHit).toBe(true);
  expect(result.lowMiss).toBe(false);
  expect(result.highHit).toBe(true);
  expect(result.highMiss).toBe(false);
});
