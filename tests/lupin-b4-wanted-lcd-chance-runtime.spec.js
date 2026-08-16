import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED CHANCE naturally generates verified LCD chance holds', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/wanted-lcd-chance-runtime-patch.js?v=step6ak-wanted-lcd1');
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');

    const makeNormal = () => new NormalSystem({ next: () => 0.999999 }, 1);

    const win = makeNormal();
    const winSeq = [
      0.0, 0.0, 0.0, // weak-blue appears, wins, destination LB_OR_GT
      0.999999,0.999999,0.999999,0.999999,0.999999,0.999999,0.999999,
      0.999999 // replacement refill after consumption
    ];
    win.rng = { next: () => winSeq.shift() ?? 0.999999 };
    win.startWantedChance();
    const winBefore = win.holdQueue.snapshot();
    const winAfter = win.completeGame();

    const miss = makeNormal();
    const missSeq = [
      0.0, 0.999999, // weak-blue appears, misses
      0.999999,0.999999,0.999999,0.999999,0.999999,0.999999,0.999999,
      0.999999 // replacement refill after consumption
    ];
    miss.rng = { next: () => missSeq.shift() ?? 0.999999 };
    miss.startWantedChance();
    const missBefore = miss.holdQueue.snapshot();
    const missAfter = miss.completeGame();

    return {
      win: {
        firstHold:winBefore[0],
        pendingReward:winAfter.pendingReward,
        lastConsumedHold:winAfter.lastConsumedHold,
        wantedChanceResult:winAfter.wantedChanceResult,
        remaining:winAfter.wantedChanceRemaining,
        queue:winAfter.holdQueue
      },
      miss: {
        firstHold:missBefore[0],
        pendingReward:missAfter.pendingReward,
        lastConsumedHold:missAfter.lastConsumedHold,
        wantedChanceResult:missAfter.wantedChanceResult,
        frozen:missAfter.wantedChanceFrozen,
        remaining:missAfter.wantedChanceRemaining,
        queue:missAfter.holdQueue
      }
    };
  });

  expect(result.win.firstHold.type).toBe('CHANCE_BLUE');
  expect(result.win.firstHold.reservedEvent).toBe('LB_OR_GT');
  expect(result.win.firstHold.lcdChance).toMatchObject({
    key:'WEAK_BLUE', mode:'WANTED_CHANCE', won:true, destination:'LB_OR_GT', denominator:13.9, expectationPct:5.1
  });
  expect(result.win.lastConsumedHold.reservedEvent).toBe('LB_OR_GT');
  expect(result.win.pendingReward).toMatchObject({type:'LB_OR_GT'});
  expect(result.win.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.win.remaining).toBe(10);
  expect(result.win.queue).toHaveLength(8);

  expect(result.miss.firstHold.type).toBe('CHANCE_BLUE');
  expect(result.miss.firstHold.reservedEvent).toBeNull();
  expect(result.miss.firstHold.lcdChance).toMatchObject({
    key:'WEAK_BLUE', mode:'WANTED_CHANCE', won:false, destination:null, denominator:13.9, expectationPct:5.1
  });
  expect(result.miss.lastConsumedHold.type).toBe('CHANCE_BLUE');
  expect(result.miss.pendingReward).toBeNull();
  expect(result.miss.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.miss.frozen).toBe(true);
  expect(result.miss.remaining).toBe(10);
  expect(result.miss.queue).toHaveLength(8);
});
