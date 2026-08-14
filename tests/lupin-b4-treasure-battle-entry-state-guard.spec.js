import { test, expect } from '@playwright/test';

test('Treasure Battle entry only starts from ACTIVE_SET', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state:gt.state,
      guaranteedStocks:gt.guaranteedStocks,
      stockExpiredOnBattle:gt.stockExpiredOnBattle,
      lastStockEvent:gt.lastStockEvent,
      treasurePoints:gt.treasurePoints,
      battleContinuationPct:gt.battleContinuationPct,
      battleResult:gt.battleResult,
      battleSource:gt.battleSource,
      battleGameCount:gt.battleGameCount,
      battlePhase:gt.battlePhase,
      battleHiddenOutcome:gt.battleHiddenOutcome,
      lastEvent:gt.lastEvent
    });

    const prepareTreasure = (gt) => {
      gt.treasurePoints = 1000000;
      gt.battleContinuationPct = 100;
      gt.guaranteedStocks = 0;
      return gt;
    };

    const idle = prepareTreasure(new GoldenTimeSystem(new RNG(1), 1));
    const idleBefore = capture(idle);
    const idleOut = idle.startTreasureBattle();

    const rush = prepareTreasure(new GoldenTimeSystem(new RNG(1), 1));
    rush.start({ guaranteedStocks:0, source:'TREASURE_BATTLE_STATE_GUARD_TEST' });
    prepareTreasure(rush);
    const rushBefore = capture(rush);
    const rushOut = rush.startTreasureBattle();

    const active = prepareTreasure(new GoldenTimeSystem(new RNG(1), 1));
    active.state = 'ACTIVE_SET';
    const activeOut = active.startTreasureBattle();
    const activeAfter = capture(active);

    const battleBefore = capture(active);
    const battleOut = active.startTreasureBattle();
    const battleAfter = capture(active);

    return {
      idle:{ out:idleOut, before:idleBefore, after:capture(idle) },
      rush:{ out:rushOut, before:rushBefore, after:capture(rush) },
      active:{ out:activeOut, after:activeAfter },
      battle:{ out:battleOut, before:battleBefore, after:battleAfter }
    };
  });

  expect(result.idle.out).toBeNull();
  expect(result.idle.after).toEqual(result.idle.before);
  expect(result.idle.after.state).toBe('IDLE');

  expect(result.rush.out).toBeNull();
  expect(result.rush.after).toEqual(result.rush.before);
  expect(result.rush.after.state).toBe('LUPIN_RUSH_ACTIVE');

  expect(result.active.out.state).toBe('BATTLE_ACTIVE');
  expect(result.active.after.state).toBe('BATTLE_ACTIVE');
  expect(result.active.after.battleResult).toBe('HIDDEN');
  expect(result.active.after.lastStockEvent).toBe('BATTLE_ENTRY_NO_STOCK');

  expect(result.battle.out).toBeNull();
  expect(result.battle.after).toEqual(result.battle.before);
  expect(result.battle.after.state).toBe('BATTLE_ACTIVE');
});
