import { test, expect } from '@playwright/test';

test('GT LCD exposes integrated stage, treasure, hold and mode presentation APIs', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(() => {
    const scene = window.__LUPIN_ZERO__.game.scene.getScene('LupinView');
    const before = scene.gtVisible;
    scene.showGoldenTimeHud({ stage: 'CARIBBEAN_A', treasure: 450000, modeLabel: 'LUPIN RUSH', holds: ['NORMAL','FLAME_LUPIN','FUJIKO','TAMACHAN'] });
    const shown = {
      visible: scene.gtVisible,
      stage: scene.gtStage.text,
      treasure: scene.gtTreasure.text,
      mode: scene.gtMode.text,
      holds: scene.gtHolds.map((x) => x.text)
    };
    scene.hideGoldenTimeHud();
    return { before, shown, after: scene.gtVisible, bridge: typeof window.__LUPIN_ZERO__.refreshGoldenTimeLcd };
  });
  expect(result.before).toBe(false);
  expect(result.shown.visible).toBe(true);
  expect(result.shown.stage).toBe('カリブ海');
  expect(result.shown.treasure).toBe('45万T');
  expect(result.shown.mode).toBe('LUPIN RUSH');
  expect(result.shown.holds).toEqual(['◆','炎','F','玉']);
  expect(result.after).toBe(false);
  expect(result.bridge).toBe('function');
});
