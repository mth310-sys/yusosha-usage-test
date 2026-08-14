import { test, expect } from '@playwright/test';

test('LUPIN RUSH progression rejects corrupt or inconsistent counters', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      rushGameCount: gt.rushGameCount,
      rushRemainingGames: gt.rushRemainingGames,
      rushResultSource: gt.rushResultSource,
      lastEvent: gt.lastEvent
    });

    const make = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'LUPIN_RUSH_ACTIVE';
      gt.rushGameCount = 1;
      gt.rushRemainingGames = 3;
      gt.rushResultSource = 'PENDING_UNVERIFIED_SELECTION_DISTRIBUTION';
      gt.lastEvent = 'BEFORE';
      return gt;
    };

    const corrupt = [
      { field: 'rushGameCount', value: '1' },
      { field: 'rushGameCount', value: 1.5 },
      { field: 'rushGameCount', value: -1 },
      { field: 'rushGameCount', value: Infinity },
      { field: 'rushRemainingGames', value: '3' },
      { field: 'rushRemainingGames', value: 3.5 },
      { field: 'rushRemainingGames', value: -1 },
      { field: 'rushRemainingGames', value: Infinity },
      { field: 'rushRemainingGames', value: 0 },
      { field: 'rushRemainingGames', value: 2 },
      { field: 'rushGameCount', value: 4 }
    ];

    const invalid = corrupt.map(({ field, value }) => {
      const gt = make();
      gt[field] = value;
      const before = capture(gt);
      const out = gt.completeGame();
      return { field, value: String(value), before, after: capture(gt), out };
    });

    const valid = make();
    const validBefore = capture(valid);
    const validOut = valid.completeGame();

    const finalGame = make();
    finalGame.rushGameCount = 3;
    finalGame.rushRemainingGames = 1;
    const finalBefore = capture(finalGame);
    const finalOut = finalGame.completeGame();

    return {
      invalid,
      valid: { before: validBefore, after: capture(valid), out: validOut },
      finalGame: { before: finalBefore, after: capture(finalGame), out: finalOut }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBeNull();
    expect(item.after).toEqual(item.before);
  }

  expect(result.valid.after.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(result.valid.after.rushGameCount).toBe(2);
  expect(result.valid.after.rushRemainingGames).toBe(2);
  expect(result.valid.after.lastEvent).toBe('LUPIN_RUSH_GAME');

  expect(result.finalGame.after.state).toBe('RUSH_RESULT_PENDING');
  expect(result.finalGame.after.rushGameCount).toBe(4);
  expect(result.finalGame.after.rushRemainingGames).toBe(0);
  expect(result.finalGame.after.lastEvent).toBe('LUPIN_RUSH_4G_END_SELECTION_DISTRIBUTION_PENDING');
});
