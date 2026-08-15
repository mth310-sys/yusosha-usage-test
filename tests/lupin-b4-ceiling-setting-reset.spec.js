import { test, expect } from '@playwright/test';

test('Lupin B4 setting change resets and redraws the game-count ceiling only on a successful change', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/ceiling-runtime-patch.js?v=step6ab-ceiling1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const changed = new GameCore({ setting:1, seed:0x6b001 });
    changed.ceiling.counter=437;
    changed.ceiling.targetGame=999;
    changed.ceiling.reached=false;
    changed.ceiling.resolution='COUNTING';
    const changedOk=changed.setSetting(6);
    const afterChanged=changed.snapshot().ceiling;

    const blocked = new GameCore({ setting:1, seed:0x6b002 });
    blocked.ceiling.counter=437;
    blocked.ceiling.targetGame=999;
    blocked.ceiling.reached=false;
    blocked.ceiling.resolution='COUNTING';
    blocked.bet();
    const blockedOk=blocked.setSetting(6);
    const afterBlocked=blocked.snapshot().ceiling;

    return {
      changed:{ok:changedOk,setting:changed.setting,ceiling:afterChanged},
      blocked:{ok:blockedOk,setting:blocked.setting,ceiling:afterBlocked}
    };
  });

  expect(result.changed.ok).toBe(true);
  expect(result.changed.setting).toBe(6);
  expect(result.changed.ceiling.counter).toBe(0);
  expect([499,999]).toContain(result.changed.ceiling.targetGame);
  expect(result.changed.ceiling.drawSource).toBe('SETTING_CHANGE_DEBUG_REDRAW');
  expect(result.changed.ceiling.reached).toBe(false);
  expect(result.changed.ceiling.resolution).toBe('COUNTING');

  expect(result.blocked.ok).toBe(false);
  expect(result.blocked.setting).toBe(1);
  expect(result.blocked.ceiling.counter).toBe(437);
  expect(result.blocked.ceiling.targetGame).toBe(999);
  expect(result.blocked.ceiling.reached).toBe(false);
  expect(result.blocked.ceiling.resolution).toBe('COUNTING');
});
