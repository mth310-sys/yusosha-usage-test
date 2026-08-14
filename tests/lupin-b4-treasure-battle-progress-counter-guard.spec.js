import { test, expect } from '@playwright/test';

test('Treasure Battle progression rejects corrupted game counters', async ({ page }) => {
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

    const makeBattle = (gameCount) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'BATTLE_ACTIVE';
      gt.battleGameCount = gameCount;
      gt.battlePhase = 'ENTRY';
      gt.battleResult = 'HIDDEN';
      gt.battleHiddenOutcome = 'WIN';
      gt.lastEvent = 'BEFORE';
      return gt;
    };

    const runInvalid = (gameCount) => {
      const gt = makeBattle(gameCount);
      const before = capture(gt);
      const out = gt.completeBattleGame();
      return { before, after: capture(gt), out };
    };

    const valid = [];
    for (const gameCount of [0, 1, 2, 3]) {
      const gt = makeBattle(gameCount);
      const before = capture(gt);
      const out = gt.completeBattleGame();
      valid.push({ gameCount, before, after: capture(gt), out });
    }

    return {
      negative: runInvalid(-1),
      decimal: runInvalid(2.5),
      text: runInvalid('2'),
      infinity: runInvalid(Infinity),
      atLimit: runInvalid(4),
      aboveLimit: runInvalid(5),
      valid
    };
  });

  for (const invalid of [result.negative, result.decimal, result.text, result.infinity, result.atLimit, result.aboveLimit]) {
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  for (const item of result.valid.slice(0, 3)) {
    expect(item.before.state).toBe('BATTLE_ACTIVE');
    expect(item.after.state).toBe('BATTLE_ACTIVE');
    expect(item.after.battleGameCount).toBe(item.gameCount + 1);
  }

  const fourth = result.valid[3];
  expect(fourth.before.state).toBe('BATTLE_ACTIVE');
  expect(fourth.before.battleGameCount).toBe(3);
  expect(fourth.after.battleGameCount).toBe(4);
  expect(fourth.after.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(fourth.after.battleResult).toBe('WIN');
});
