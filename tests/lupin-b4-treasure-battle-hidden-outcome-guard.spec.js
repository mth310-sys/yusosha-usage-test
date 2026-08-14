import { test, expect } from '@playwright/test';

test('Treasure Battle rejects invalid hidden outcomes and preserves WIN/LOSE behavior', async ({ page }) => {
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
      setNo: gt.setNo,
      rushGameCount: gt.rushGameCount,
      rushRemainingGames: gt.rushRemainingGames
    });

    const makeBattle = (outcome, gameCount = 0) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'BATTLE_ACTIVE';
      gt.battleGameCount = gameCount;
      gt.battlePhase = 'ENTRY';
      gt.battleResult = 'HIDDEN';
      gt.battleHiddenOutcome = outcome;
      gt.lastEvent = 'BEFORE';
      return gt;
    };

    const runInvalid = (outcome, gameCount = 0) => {
      const gt = makeBattle(outcome, gameCount);
      const before = capture(gt);
      const out = gt.completeBattleGame();
      return { before, after: capture(gt), out };
    };

    const win = makeBattle('WIN', 3);
    const winOut = win.completeBattleGame();

    const lose = makeBattle('LOSE', 3);
    const loseOut = lose.completeBattleGame();

    return {
      invalid: [
        runInvalid(null),
        runInvalid('UNKNOWN'),
        runInvalid(''),
        runInvalid(1),
        runInvalid(null, 3),
        runInvalid('UNKNOWN', 3)
      ],
      win: { out: winOut, after: capture(win) },
      lose: { out: loseOut, after: capture(lose) }
    };
  });

  for (const invalid of result.invalid) {
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.win.after.battleGameCount).toBe(4);
  expect(result.win.after.battleResult).toBe('WIN');
  expect(result.win.after.battleHiddenOutcome).toBeNull();
  expect(result.win.after.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(result.win.after.battlePhase).toBe('RESULT_WIN');

  expect(result.lose.after.battleGameCount).toBe(4);
  expect(result.lose.after.battleResult).toBe('LOSE');
  expect(result.lose.after.battleHiddenOutcome).toBeNull();
  expect(result.lose.after.state).toBe('ART_END_PENDING_RETURN');
  expect(result.lose.after.battlePhase).toBe('RESULT_LOSE');
  expect(result.lose.after.result).toBe('END');
});
