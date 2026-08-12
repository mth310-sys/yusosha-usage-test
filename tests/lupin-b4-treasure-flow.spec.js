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

test('Integrated 1M Treasure flow reaches GOLD CHANCE, EXTRA, post-EXTRA LUPIN RUSH and applies carryover after Rush result', async ({page})=>{
  await boot(page);
  const result=await page.evaluate(async()=>{
    const {GoldenTimeSystem}=await import('/test_lupin_b4/js/golden-time.js');
    const {installTreasureThresholdCarryoverHooks}=await import('/test_lupin_b4/js/treasure-threshold.js');
    const {installSharedGoldChanceFlow}=await import('/test_lupin_b4/js/gold-chance-shared-flow.js');
    const rng={next:()=>0.999999};
    const gt=new GoldenTimeSystem(rng,1);
    installTreasureThresholdCarryoverHooks(gt);
    installSharedGoldChanceFlow(gt);
    gt.start({source:'BROWSER_INTEGRATION'});
    gt.state='ACTIVE_SET';gt.setNo=1;gt.remainingGames=2;gt.treasurePoints=900000;
    const threshold=gt.applySharedTreasureAward(300000,{source:'BROWSER_INTEGRATION'});
    const afterThreshold=gt.snapshot();
    const goldChance=gt.setGoldChanceAddedGamesForTest(15);
    const extraStart=gt.startExtraBonus();
    let extraEnd=null;
    for(let i=0;i<17;i+=1)extraEnd=gt.completeExtraGame();
    const afterRush=gt.applyLupinRushAverageForTest('TYPE_A');
    return {threshold,afterThreshold,goldChance,extraStart,extraEnd,afterRush};
  });
  expect(result.threshold.reachedOneMillion).toBe(true);
  expect(result.threshold.carryoverPoints).toBe(200000);
  expect(result.afterThreshold.state).toBe('GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION');
  expect(result.goldChance.state).toBe('EXTRA_BONUS_READY');
  expect(result.goldChance.extraTargetGames).toBe(17);
  expect(result.extraStart.state).toBe('EXTRA_BONUS_ACTIVE');
  expect(result.extraEnd.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(result.extraEnd.battleSource).toBe('VERIFIED_POST_EXTRA_TO_LUPIN_RUSH');
  expect(result.extraEnd.treasureThreshold.pendingCarryoverPoints).toBe(200000);
  expect(result.extraEnd.sharedGoldChanceFlow.phase).toBe('POST_EXTRA_LUPIN_RUSH');
  expect(result.afterRush.state).toBe('ACTIVE_SET');
  expect(result.afterRush.treasureThreshold.pendingCarryoverPoints).toBe(0);
  expect(result.afterRush.treasureThreshold.lastAppliedCarryoverPoints).toBe(200000);
  expect(result.afterRush.sharedGoldChanceFlow.phase).toBe('NEXT_SET_ACTIVE');
  expect(result.afterRush.sharedGoldChanceFlow.carryoverAfterRush).toBe(0);
  expect(result.afterRush.treasurePoints).toBeGreaterThanOrEqual(200000);
});
