import { test, expect } from '@playwright/test';

test('one-in helper rejects invalid denominators instead of turning them into guaranteed hits', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/extra-bonus-profile.js');
    const zeroRng = { next: () => 0 };
    const highRng = { next: () => 0.999999 };
    return {
      zero: profile.rollOneIn(0, zeroRng),
      negative: profile.rollOneIn(-1, zeroRng),
      nanText: profile.rollOneIn('UNKNOWN', zeroRng),
      infinity: profile.rollOneIn(Infinity, zeroRng),
      verifiedHit: profile.rollOneIn(202.6, zeroRng),
      verifiedMiss: profile.rollOneIn(202.6, highRng)
    };
  });

  expect(result.zero).toBeNull();
  expect(result.negative).toBeNull();
  expect(result.nanText).toBeNull();
  expect(result.infinity).toBeNull();
  expect(result.verifiedHit).toBe(true);
  expect(result.verifiedMiss).toBe(false);
});
