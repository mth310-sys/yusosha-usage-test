import { test, expect } from '@playwright/test';

async function bootZero(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#phaseBadge')).toHaveText('RESEARCH CORE');
  await expect(page.locator('#creditValue')).toHaveText('50');
  await expect(page.locator('#betValue')).toHaveText('0');
  await expect(page.locator('#stateValue')).toHaveText('IDLE');
  expect(errors).toEqual([]);
}

test('LUPIN ZERO boots and exposes the research core', async ({ page }) => {
  await bootZero(page);

  const exposed = await page.evaluate(() => Boolean(window.__LUPIN_ZERO__?.core && window.__LUPIN_ZERO__?.game));
  expect(exposed).toBe(true);
});

test('LUPIN ZERO completes one deterministic control-flow game', async ({ page }) => {
  await bootZero(page);

  await expect(page.locator('#maxBetBtn')).toBeEnabled();
  await page.locator('#maxBetBtn').click();
  await expect(page.locator('#creditValue')).toHaveText('47');
  await expect(page.locator('#betValue')).toHaveText('3');
  await expect(page.locator('#stateValue')).toHaveText('READY');

  await expect(page.locator('#startBtn')).toBeEnabled();
  await page.locator('#startBtn').click();
  await expect(page.locator('#stateValue')).toHaveText('SPINNING');

  for (const reel of ['0', '1', '2']) {
    const stop = page.locator(`.stop[data-reel="${reel}"]`);
    await expect(stop).toBeEnabled();
    await stop.click();
  }

  await expect(page.locator('#stateValue')).toHaveText('IDLE');
  await expect(page.locator('#betValue')).toHaveText('0');
  await expect(page.locator('#creditValue')).toHaveText('47');
  await expect(page.locator('#message')).toContainText('研究用1ゲーム完了');
});

test('LUPIN ZERO keeps real-machine probability logic disconnected', async ({ page }) => {
  await bootZero(page);

  await page.locator('#maxBetBtn').click();
  await page.locator('#startBtn').click();

  const status = await page.evaluate(() => window.__LUPIN_ZERO__.core.snapshot());
  expect(status.state).toBe('SPINNING');
  expect(status.spinId).toBe(1);
  expect(status.stopped).toEqual([false, false, false]);
});
