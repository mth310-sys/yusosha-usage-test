import { test, expect } from '@playwright/test';

test('player surface is presented as one machine, not a research panel', async ({ page }) => {
  await page.goto('/test_lupin_zero/');

  await expect(page).toHaveTitle('パチスロ ルパン三世～消されたルパン～');
  await expect(page.locator('[data-chance-eye]')).toHaveCount(0);
  await expect(page.locator('#czOddBtn')).toHaveCount(0);
  await expect(page.locator('#phaseBadge')).toHaveText('SYSTEM');
  await expect(page.getByText('Research Build')).toHaveCount(0);
  await expect(page.getByText('RESEARCH CORE')).toHaveCount(0);
});
