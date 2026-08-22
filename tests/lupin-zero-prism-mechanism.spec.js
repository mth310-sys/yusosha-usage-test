import { test, expect } from '@playwright/test';

test('observed prism mechanism reveals circular element only through explicit research control', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const initial = await page.evaluate(() => window.__LUPIN_ZERO__.mechanism.snapshot());
  expect(initial.state).toBe('CLOSED');
  expect(initial.circularElementVisible).toBe(false);
  expect(initial.automaticTriggerImplemented).toBe(false);

  await page.locator('#phaseBadge').click();

  const revealed = await page.evaluate(() => window.__LUPIN_ZERO__.mechanism.snapshot());
  expect(revealed.state).toBe('REVEAL');
  expect(revealed.circularElementVisible).toBe(true);
  await expect(page.locator('#prismMechanism')).toHaveAttribute('data-state', 'reveal');
  await expect(page.locator('#phaseBadge')).toHaveText('MECH REVEAL');

  await page.locator('#phaseBadge').click();
  await expect(page.locator('#prismMechanism')).toHaveAttribute('data-state', 'closed');
});
