import { test, expect } from '@playwright/test';

test('spin presentation runtime stays presentation-only and preserves event order', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const policy = await page.evaluate(() => window.__LUPIN_ZERO__?.spinPresentationPolicy);
  expect(policy).toBeTruthy();
  expect(policy.evidenceStatus).toBe('PRESENTATION_ONLY');
  expect(policy.affectsGameLogic).toBe(false);
  expect(policy.exactPhysicalTimingVerified).toBe(false);
  expect(policy.sequence).toEqual(['SPIN_START','REEL_STOP_1','REEL_STOP_2','REEL_STOP_3','SPIN_END','SETTLEMENT','MODE_PRESENTATION']);
});

test('Phaser view exposes spin feel hooks without changing machine state', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const scene = app.game.scene.getScene('LupinView');
    const before = app.core.snapshot();
    scene.beginSpinFeel();
    scene.stopFeel(0, false);
    scene.showSettlementFeel('3 PAY', 'pay');
    const after = app.core.snapshot();
    return {
      hooks: [typeof scene.beginSpinFeel, typeof scene.stopFeel, typeof scene.showSettlementFeel],
      sameCredit: before.credit === after.credit,
      sameBet: before.bet === after.bet,
      sameMode: before.mode === after.mode,
      sameState: before.state === after.state
    };
  });
  expect(result.hooks).toEqual(['function','function','function']);
  expect(result.sameCredit).toBe(true);
  expect(result.sameBet).toBe(true);
  expect(result.sameMode).toBe(true);
  expect(result.sameState).toBe(true);
});
