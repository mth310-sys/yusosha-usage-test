import { test, expect } from '@playwright/test';

async function stopAll(page) {
  const stops = page.locator('.f9-stop.stop');
  await expect(stops.first()).toBeEnabled({ timeout: 10000 });
  await stops.nth(0).click();
  await stops.nth(1).click();
  await stops.nth(2).click();
  await expect(page.locator('#stateValue')).not.toHaveText('SPINNING', { timeout: 10000 });
  await expect(page.locator('#stateValue')).not.toHaveText('STOPPING', { timeout: 10000 });
}

async function startNextGame(page) {
  const start = page.locator('#startBtn');
  if (!(await start.isEnabled())) {
    await expect(page.locator('#maxBetBtn')).toBeEnabled({ timeout: 10000 });
    await page.locator('#maxBetBtn').click();
    await expect(page.locator('#betValue')).toHaveText('3');
  }
  await expect(start).toBeEnabled({ timeout: 10000 });
  await start.click();
}

test('BODY cabinet runs repeated Lupin ZERO play through physical controls', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/test_lupin_body/');

  await expect(page.locator('#game canvas')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#creditValue')).toHaveText('50');
  await expect(page.locator('#betValue')).toHaveText('0');
  await expect(page.locator('#maxBetBtn')).toBeVisible();
  await expect(page.locator('#startBtn')).toBeVisible();
  await expect(page.locator('.f9-stop.stop')).toHaveCount(3);

  await expect(page.locator('#maxBetBtn')).toBeEnabled();
  await page.locator('#maxBetBtn').click();
  await expect(page.locator('#creditValue')).toHaveText('47');
  await expect(page.locator('#betValue')).toHaveText('3');
  await expect(page.locator('#startBtn')).toBeEnabled();

  await page.locator('#startBtn').click();
  await stopAll(page);

  const firstGameState = await page.locator('#stateValue').textContent();
  const firstGameMessage = await page.locator('#message').textContent();
  expect(firstGameState?.trim()).not.toBe('');
  expect(firstGameMessage?.trim()).not.toBe('');

  await startNextGame(page);
  await stopAll(page);

  await expect(page.locator('#message')).not.toHaveText('');
  expect(pageErrors).toEqual([]);
});
