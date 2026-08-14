import { test, expect } from '@playwright/test';

test('IKUKAN progression rejects corrupt or inconsistent counters', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      gameInSet: gt.gameInSet,
      remainingGames: gt.remainingGames,
      stage: gt.stage,
      ikukanGameCount: gt.ikukanGameCount,
      ikukanRemainingGames: gt.ikukanRemainingGames,
      ikukanGuaranteedMinimumAccrued: gt.ikukanGuaranteedMinimumAccrued,
      stageTreasureHitEvents: gt.stageTreasureHitEvents,
      lastStageTreasureHitGame: gt.lastStageTreasureHitGame,
      lastEvent: gt.lastEvent
    });

    const make = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'ACTIVE_SET';
      gt.gameInSet = 5;
      gt.remainingGames = 25;
      gt.stage = 'IKUKAN';
      gt.internalStage = 'IKUKAN';
      gt.internalStageIndex = 8;
      gt.ikukanGameCount = 2;
      gt.ikukanRemainingGames = 8;
      gt.ikukanGuaranteedMinimumAccrued = 100000;
      gt.stageTreasureHitEvents = 2;
      gt.lastStageTreasureHitGame = 5;
      gt.lastEvent = 'BEFORE';
      gt.rng = { next: () => 0.999999 };
      return gt;
    };

    const corrupt = [
      { field: 'ikukanGameCount', value: '2' },
      { field: 'ikukanGameCount', value: 2.5 },
      { field: 'ikukanGameCount', value: -1 },
      { field: 'ikukanGameCount', value: Infinity },
      { field: 'ikukanRemainingGames', value: '8' },
      { field: 'ikukanRemainingGames', value: 8.5 },
      { field: 'ikukanRemainingGames', value: -1 },
      { field: 'ikukanRemainingGames', value: Infinity },
      { field: 'ikukanRemainingGames', value: 0 },
      { field: 'ikukanRemainingGames', value: 7 },
      { field: 'ikukanRemainingGames', value: 9 },
      { field: 'ikukanGameCount', value: 10 },
      { field: 'ikukanGuaranteedMinimumAccrued', value: '100000' },
      { field: 'ikukanGuaranteedMinimumAccrued', value: 100000.5 },
      { field: 'ikukanGuaranteedMinimumAccrued', value: -1 },
      { field: 'ikukanGuaranteedMinimumAccrued', value: Infinity },
      { field: 'ikukanGuaranteedMinimumAccrued', value: 50000 },
      { field: 'ikukanGuaranteedMinimumAccrued', value: 150000 }
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

    return { invalid, valid: { before: validBefore, after: capture(valid), out: validOut } };
  });

  for (const item of result.invalid) {
    expect(item.out).toBeNull();
    expect(item.after).toEqual(item.before);
  }

  expect(result.valid.after.state).toBe('ACTIVE_SET');
  expect(result.valid.after.gameInSet).toBe(6);
  expect(result.valid.after.remainingGames).toBe(24);
  expect(result.valid.after.ikukanGameCount).toBe(3);
  expect(result.valid.after.ikukanRemainingGames).toBe(7);
  expect(result.valid.after.ikukanGuaranteedMinimumAccrued).toBe(150000);
  expect(result.valid.after.stageTreasureHitEvents).toBe(3);
  expect(result.valid.after.lastStageTreasureHitGame).toBe(6);
  expect(result.valid.after.lastEvent).toBe('IKUKAN_TREASURE_MINIMUM_50000_ACCRUED_SEPARATELY');
});
