import { test, expect } from '@playwright/test';

test('setting changes reject unsupported values without mutating live state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const core = new GameCore({ setting: 1, seed: 1 });
    const capture = () => ({
      setting: core.setting,
      profileSetting: core.profile?.setting ?? null,
      normalSetting: core.normal.setting,
      goldenTimeSetting: core.goldenTime.setting,
      reservation: core.nextInitialHit ? { ...core.nextInitialHit } : null,
      draws: core.nextInitialHitDraws
    });

    const before0 = capture();
    const out0 = core.setSetting(0);
    const after0 = capture();

    const before7 = capture();
    const out7 = core.setSetting(7);
    const after7 = capture();

    const out2 = core.setSetting(2);
    const after2 = capture();

    return { before0, out0, after0, before7, out7, after7, out2, after2 };
  });

  expect(result.out0).toBe(false);
  expect(result.after0).toEqual(result.before0);

  expect(result.out7).toBe(false);
  expect(result.after7).toEqual(result.before7);

  expect(result.out2).toBe(true);
  expect(result.after2.setting).toBe(2);
  expect(result.after2.normalSetting).toBe(2);
  expect(result.after2.goldenTimeSetting).toBe(2);
  expect(result.after2.reservation?.setting).toBe(2);
  expect(['LUPIN_BONUS', 'GOLDEN_TIME']).toContain(result.after2.reservation?.type);
  expect(result.after2.draws).toBe(result.before0.draws + 1);
});
