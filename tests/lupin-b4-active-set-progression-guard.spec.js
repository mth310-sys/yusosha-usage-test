import { test, expect } from '@playwright/test';

test('ACTIVE_SET progression rejects corrupt or inconsistent counters', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      gameInSet: gt.gameInSet,
      remainingGames: gt.remainingGames,
      treasurePoints: gt.treasurePoints,
      guaranteedStocks: gt.guaranteedStocks,
      stageTreasureHitEvents: gt.stageTreasureHitEvents,
      pendingTreasureAwardEvents: gt.pendingTreasureAwardEvents,
      lastEvent: gt.lastEvent
    });

    const make = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'ACTIVE_SET';
      gt.gameInSet = 5;
      gt.remainingGames = 25;
      gt.treasurePoints = 0;
      gt.guaranteedStocks = 0;
      gt.stage = null;
      gt.internalStage = null;
      gt.internalStageIndex = null;
      gt.stageTreasureHitEvents = 0;
      gt.pendingTreasureAwardEvents = 0;
      gt.lastEvent = 'BEFORE';
      gt.rng = { next: () => 0.999999 };
      return gt;
    };

    const corrupt = [
      { field: 'gameInSet', value: '5' },
      { field: 'gameInSet', value: 5.5 },
      { field: 'gameInSet', value: -1 },
      { field: 'gameInSet', value: Infinity },
      { field: 'remainingGames', value: '25' },
      { field: 'remainingGames', value: 25.5 },
      { field: 'remainingGames', value: -1 },
      { field: 'remainingGames', value: Infinity },
      { field: 'remainingGames', value: 0 },
      { field: 'remainingGames', value: 24 },
      { field: 'remainingGames', value: 26 },
      { field: 'gameInSet', value: 30 }
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
  expect(result.valid.after.treasurePoints).toBe(result.valid.before.treasurePoints);
  expect(result.valid.after.guaranteedStocks).toBe(result.valid.before.guaranteedStocks);
  expect(result.valid.after.stageTreasureHitEvents).toBe(result.valid.before.stageTreasureHitEvents);
  expect(result.valid.after.pendingTreasureAwardEvents).toBe(result.valid.before.pendingTreasureAwardEvents);
  expect(result.valid.after.lastEvent).toBe('GOLDEN_TIME_GAME');
});
