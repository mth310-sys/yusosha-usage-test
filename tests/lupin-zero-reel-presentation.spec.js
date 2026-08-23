import { test, expect } from '@playwright/test';

test('three-row reel presentation does not claim unresolved physical strips', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const viewModule = await import('/test_lupin_zero/src/phaser-view.js');
    return viewModule.REEL_PRESENTATION_POLICY;
  });
  expect(result.rows).toBe(3);
  expect(result.middleRowUsesResolvedStopResult).toBe(true);
  expect(result.adjacentStoppedRowsClaimRealStrip).toBe(false);
  expect(result.spinningRowsArePresentationOnly).toBe(true);
  expect(result.exactPhysicalStripStillUnresolved).toBe(true);
  expect(result.affectsGameLogic).toBe(false);
});

test('reel visual API keeps machine state unchanged', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const scene = app.game.scene.getScene('LupinView');
    const before = app.core.snapshot();
    scene.setReelRunning(0, true);
    scene.setReelRunning(0, false, '7');
    scene.stopFeel(0, false);
    const after = app.core.snapshot();
    return { before, after, rowCount: scene.reelRows?.[0]?.length ?? 0 };
  });
  expect(result.rowCount).toBe(3);
  expect(result.after).toEqual(result.before);
});
