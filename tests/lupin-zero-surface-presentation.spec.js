import { test, expect } from '@playwright/test';

test('mode-linked cabinet presentation stays presentation-only', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const policy = await page.evaluate(() => window.__LUPIN_ZERO__.modeSurfacePresentationPolicy);
  expect(policy.evidenceStatus).toBe('PRESENTATION_ONLY');
  expect(policy.affectsGameLogic).toBe(false);
  expect(policy.physicalTriggerVerified).toBe(false);
});

test('surface presentation scales from normal to GT and special modes', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { GameMode } = await import('/test_lupin_zero/src/game-flow-spec.js');
    const app = window.__LUPIN_ZERO__;
    const cases = [
      { mode: GameMode.NORMAL, raiunHighGamesRemaining: 0 },
      { mode: GameMode.WANTED_CHANCE },
      { mode: GameMode.RAIUN_MODE },
      { mode: GameMode.FUJIKO_ZONE },
      { mode: GameMode.LUPIN_BONUS },
      { mode: GameMode.GOLDEN_TIME },
      { mode: GameMode.TREASURE_RUSH },
      { mode: GameMode.EXTRA_BONUS }
    ];
    return cases.map((state) => app.applyModeSurfacePresentation({ ...app.core.snapshot(), ...state }));
  });

  expect(result.map((x) => x.level)).toEqual(['low','medium','medium','high','high','high','max','max']);
  expect(result[0].prism).toBe(false);
  expect(result[5].prism).toBe(true);
  expect(result[6].prism).toBe(true);
  expect(result[7].prism).toBe(true);
});
