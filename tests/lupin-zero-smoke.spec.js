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

test('VerifiedSpec keeps published base role denominators exact and reel strips unresolved', async ({ page }) => {
  await bootZero(page);

  const result = await page.evaluate(async () => {
    const spec = await import('/test_lupin_zero/src/verified-spec.js');
    return {
      replay: spec.getNormalRoleDenominator('REPLAY', 1),
      threeCoin: spec.getNormalRoleDenominator('THREE_COIN', 6),
      mb: spec.getNormalRoleDenominator('MB', 3),
      nineCoin: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('NINE_COIN', setting)),
      tenCoin: [1,2,3,4,5,6].map((setting) => spec.getNormalRoleDenominator('TEN_COIN', setting)),
      invalid: spec.getNormalRoleDenominator('UNKNOWN', 1),
      evidence: spec.VERIFIED_SPEC.evidence,
      policy: spec.VERIFIED_SPEC.policy,
      mbSpec: spec.VERIFIED_SPEC.mb
    };
  });

  expect(result.replay).toBe(7.30);
  expect(result.threeCoin).toBe(99.99);
  expect(result.mb).toBe(27.31);
  expect(result.nineCoin).toEqual([25.28,25.46,25.62,25.78,25.94,26.11]);
  expect(result.tenCoin).toEqual([26.27,25.18,24.28,23.45,22.67,21.94]);
  expect(result.invalid).toBeNull();
  expect(result.evidence.fullPhysicalReelStrips).toBe('UNRESOLVED');
  expect(result.policy.fullPhysicalReelStrips).toBe('DO_NOT_INVENT');
  expect(result.policy.unlistedProbabilities).toBe('DO_NOT_INTERPOLATE');
  expect(result.mbSpec).toEqual({
    stopLine: 'MIDDLE',
    stopSymbols: ['次元', '五エ門', 'ルパン'],
    followupGames: 2,
    payoutEachGame: 10
  });
});
