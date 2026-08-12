import { test, expect } from '@playwright/test';

async function boot(page){
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
}

test('Treasure 1M threshold caps display and preserves exact carryover', async ({page})=>{
  await boot(page);
  const result=await page.evaluate(async()=>{
    const t=await import('/test_lupin_b4/js/treasure-threshold.js');
    const gt={treasurePoints:900000,remainingGames:12,state:'ACTIVE_SET',lastEvent:null};
    const applied=t.applyTreasureAwardToGoldChanceThreshold(gt,300000,{eventPrefix:'BROWSER_TEST'});
    return {applied,gt,boundaries:t.validateTreasureCarryoverBoundaryCases()};
  });
  expect(result.applied.rawTotal).toBe(1200000);
  expect(result.applied.displayedTreasurePoints).toBe(1000000);
  expect(result.applied.carryoverPoints).toBe(200000);
  expect(result.applied.reachedOneMillion).toBe(true);
  expect(result.gt.treasurePoints).toBe(1000000);
  expect(result.gt.state).toBe('GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION');
  expect(result.gt.goldChanceBaseRemainingGames).toBe(12);
  expect(result.boundaries.pass).toBe(true);
});

test('Treasure multi-million carryover projection keeps every full EXTRA chain and remainder', async ({page})=>{
  await boot(page);
  const result=await page.evaluate(async()=>{
    const {projectTreasureCarryover}=await import('/test_lupin_b4/js/treasure-threshold.js');
    return projectTreasureCarryover(2300000);
  });
  expect(result.fullMillionChunks).toBe(2);
  expect(result.requiredExtraChains).toBe(2);
  expect(result.remainderPoints).toBe(300000);
  expect(result.terminatesWithTreasure).toBe(300000);
});

test('GOLD CHANCE EXTRA total is remaining ART plus verified minimum 15G and unknown distribution stays disabled', async ({page})=>{
  await boot(page);
  const result=await page.evaluate(async()=>{
    const p=await import('/test_lupin_b4/js/extra-bonus-profile.js');
    return {
      final:p.projectGoldChanceExtraGames(0,15),
      one:p.projectGoldChanceExtraGames(1,15),
      mid:p.projectGoldChanceExtraGames(10,15),
      invalid:p.projectGoldChanceExtraGames(10,14),
      profile:p.GOLD_CHANCE_PROFILE
    };
  });
  expect(result.final.totalExtraGames).toBe(15);
  expect(result.one.totalExtraGames).toBe(16);
  expect(result.mid.totalExtraGames).toBe(25);
  expect(result.invalid).toBeNull();
  expect(result.profile.triggerTreasurePoints).toBe(1000000);
  expect(result.profile.minimumAddedGamesSupported).toBe(15);
  expect(result.profile.addedGameDistribution).toBeNull();
  expect(result.profile.autoRollEnabled).toBe(false);
});

test('GOLD RUSH verified floors stay fixed without synthesizing unresolved multi-stock distributions', async ({page})=>{
  await boot(page);
  const result=await page.evaluate(async()=>{
    const p=await import('/test_lupin_b4/js/extra-bonus-profile.js');
    return {
      profile:p.GOLD_RUSH_PROFILE,
      absolute:p.getGoldRushBreakthroughMinimumStocks('ABSOLUTE_BREAKTHROUGH'),
      limit:p.getGoldRushBreakthroughMinimumStocks('LIMIT_BREAKTHROUGH'),
      unknown:p.getGoldRushBreakthroughMinimumStocks('UNKNOWN')
    };
  });
  expect(result.profile.initialGames).toBe(1);
  expect(result.profile.nextGameContinuationPct).toBe(52.6);
  expect(result.profile.redAlignmentMinimumStocks).toBe(1);
  expect(result.absolute).toBe(1);
  expect(result.limit).toBe(2);
  expect(result.unknown).toBeNull();
  expect(result.profile.breakthroughSelectionDistribution).toBeNull();
  expect(result.profile.multiStockDistribution).toBeNull();
});
