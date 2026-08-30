import { test, expect } from '@playwright/test';

test('BODY cabinet runs Lupin ZERO system through physical controls', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/test_lupin_body/');
  await expect(page.locator('#game canvas')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#maxBetBtn')).toBeEnabled();

  await page.locator('#maxBetBtn').click();
  await expect(page.locator('#betValue')).toHaveText('3');
  await expect(page.locator('#startBtn')).toBeEnabled();

  await page.locator('#startBtn').click();
  await expect(page.locator('.stop').first()).toBeEnabled();
  await page.locator('.stop').nth(0).click();
  await page.locator('.stop').nth(1).click();
  await page.locator('.stop').nth(2).click();

  await expect(page.locator('#stateValue')).not.toHaveText('SPINNING', { timeout: 10000 });
  expect(pageErrors).toEqual([]);
});
