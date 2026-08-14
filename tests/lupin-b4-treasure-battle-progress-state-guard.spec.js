import { test, expect } from '@playwright/test';

test('Treasure Battle progression only advances from BATTLE_ACTIVE', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      battleGameCount: gt.battleGameCount,
      battlePhase: gt.battlePhase,
      battleResult: gt.battleResult,
      battleHiddenOutcome: gt.battleHiddenOutcome,
      lastEvent: gt.lastEvent,
      result: gt.result,
      setNo: gt.setNo
    });

    const runInvalid = (state) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = state;
      gt.battleGameCount = 0;
      gt.battlePhase = null;
      gt.battleResult = null;
      gt.battleHiddenOutcome = 'WIN';
      gt.lastEvent = 'BEFORE';
      const before = capture(gt);
      const out = gt.completeBattleGame();
      return { before, after: capture(gt), out };
    };

    const active = new GoldenTimeSystem(new RNG(1), 1);
    active.state = 'ACTIVE_SET';
    active.treasurePoints = 1000000;
    active.guaranteedStocks = 0;
    active.startTreasureBattle();
    const beforeActive = capture(active);
    const out1 = active.completeBattleGame();
    const after1 = capture(active);
    const out2 = active.completeBattleGame();
    const after2 = capture(active);

    return {
      idle: runInvalid('IDLE'),
      activeSet: runInvalid('ACTIVE_SET'),
      rush: runInvalid('LUPIN_RUSH_ACTIVE'),
      battle: { before: beforeActive, out1, after1, out2, after2 }
    };
  });

  for (const invalid of [result.idle, result.activeSet, result.rush]) {
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.battle.before.state).toBe('BATTLE_ACTIVE');
  expect(result.battle.before.battleGameCount).toBe(0);

  expect(result.battle.out1.state).toBe('BATTLE_ACTIVE');
  expect(result.battle.after1.state).toBe('BATTLE_ACTIVE');
  expect(result.battle.after1.battleGameCount).toBe(1);
  expect(result.battle.after1.battlePhase).not.toBeNull();

  expect(result.battle.out2.state).toBe('BATTLE_ACTIVE');
  expect(result.battle.after2.state).toBe('BATTLE_ACTIVE');
  expect(result.battle.after2.battleGameCount).toBe(2);
  expect(result.battle.after2.battleGameCount).toBe(result.battle.after1.battleGameCount + 1);
});
