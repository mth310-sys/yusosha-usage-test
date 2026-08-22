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

  const exposed = await page.evaluate(() => Boolean(
    window.__LUPIN_ZERO__?.core &&
    window.__LUPIN_ZERO__?.game &&
    window.__LUPIN_ZERO__?.researchReels
  ));
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

  const profile = await page.evaluate(() => window.__LUPIN_ZERO__.researchReels.snapshot().profile);
  expect(profile).toEqual({
    mode: 'RESEARCH_ONLY',
    source: 'PLACEHOLDER',
    realMachineStrip: 'UNVERIFIED',
    probabilityModel: 'DISCONNECTED'
  });
});

test('LUPIN ZERO research reel stops are deterministic without claiming real strips', async ({ page }) => {
  await bootZero(page);

  const result = await page.evaluate(async () => {
    const { ResearchReelEngine } = await import('/test_lupin_zero/src/research-reel-engine.js');
    const first = new ResearchReelEngine();
    const second = new ResearchReelEngine();
    first.start(7);
    second.start(7);
    return {
      first: [first.stop(0), first.stop(1), first.stop(2)],
      second: [second.stop(0), second.stop(1), second.stop(2)]
    };
  });

  expect(result.first).toEqual(result.second);
  expect(result.first.every((stop) => stop.source === 'PLACEHOLDER')).toBe(true);
});
