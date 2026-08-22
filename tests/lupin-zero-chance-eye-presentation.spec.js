import { test, expect } from '@playwright/test';

test('verified liquid chance-eye semantics render without inventing physical reactions', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => Boolean(window.__LUPIN_ZERO__?.game?.scene?.getScene('LupinView')?.chanceEyeText));

  const mapping = await page.evaluate(async () => {
    const { getChanceEyePresentation } = await import('/test_lupin_zero/src/chance-eye-presentation-map.js');
    return {
      blue: getChanceEyePresentation('WEAK', 'normal'),
      red: getChanceEyePresentation('MIDDLE', 'normal'),
      gold: getChanceEyePresentation('STRONG', 'normal')
    };
  });

  expect(mapping.blue.label).toBe('青チャンス目');
  expect(mapping.blue.denominator).toBe(53.6);
  expect(mapping.red.label).toBe('赤チャンス目');
  expect(mapping.red.denominator).toBe(149.2);
  expect(mapping.gold.label).toBe('金チャンス目');
  expect(mapping.gold.denominator).toBe(3857);

  await page.locator('[data-chance-eye="WEAK"]').click();
  expect(await page.locator('.lcd-shell').getAttribute('data-cue')).toBe('chance_eye_blue');

  const blueState = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const view = app.game.scene.getScene('LupinView');
    return {
      text: view.chanceEyeText.text,
      visible: view.chanceEyeText.visible,
      mechanism: app.mechanism.snapshot(),
      surface: app.presentation.snapshot().surface
    };
  });

  expect(blueState.text).toBe('BLUE CHANCE EYE');
  expect(blueState.visible).toBe(true);
  expect(blueState.mechanism.state).toBe('CLOSED');
  expect(blueState.surface.leftFrameLed).toBe('IDLE');
  expect(blueState.surface.rightFrameLed).toBe('IDLE');

  await page.locator('[data-chance-eye="MIDDLE"]').click();
  expect(await page.locator('.lcd-shell').getAttribute('data-cue')).toBe('chance_eye_red');

  await page.locator('[data-chance-eye="STRONG"]').click();
  expect(await page.locator('.lcd-shell').getAttribute('data-cue')).toBe('chance_eye_gold');

  const goldState = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const view = app.game.scene.getScene('LupinView');
    return {
      text: view.chanceEyeText.text,
      mechanism: app.mechanism.snapshot(),
      surface: app.presentation.snapshot().surface
    };
  });

  expect(goldState.text).toBe('GOLD 7 CHANCE EYE');
  expect(goldState.mechanism.state).toBe('CLOSED');
  expect(goldState.surface.leftFrameLed).toBe('IDLE');
  expect(goldState.surface.rightFrameLed).toBe('IDLE');
});
