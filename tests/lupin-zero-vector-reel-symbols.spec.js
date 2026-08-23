import { test, expect } from '@playwright/test';

test('vector reel symbol presentation stays presentation-only', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const before = app.core.snapshot();
    const policy = app.reelSymbolPresentationPolicy;
    app.renderVectorReelSymbol(0, '7');
    app.renderVectorReelSymbol(1, 'BAR');
    app.renderVectorReelSymbol(2, 'ルパン');
    const after = app.core.snapshot();
    return { policy, before, after };
  });

  expect(result.policy).toEqual({
    evidenceStatus: 'PRESENTATION_ONLY',
    imageAssetsRequired: false,
    exactArtClaimed: false,
    exactStripClaimed: false,
    middleRowOnly: true,
    affectsGameLogic: false
  });
  expect(result.after).toEqual(result.before);
});

test('three-row reel policy still refuses to claim unresolved adjacent strip symbols', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const policy = await page.evaluate(async () => {
    const view = await import('/test_lupin_zero/src/phaser-view.js');
    return view.REEL_PRESENTATION_POLICY;
  });
  expect(policy.rows).toBe(3);
  expect(policy.middleRowUsesResolvedStopResult).toBe(true);
  expect(policy.adjacentStoppedRowsClaimRealStrip).toBe(false);
  expect(policy.exactPhysicalStripStillUnresolved).toBe(true);
  expect(policy.affectsGameLogic).toBe(false);
});
