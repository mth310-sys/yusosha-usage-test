import { test, expect } from '@playwright/test';

test('Lupin B4 SEVEN ZONE stays verified manual/debug hold route and is not an LCD destination', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const { LCD_CHANCE_PROFILE } = await import('/test_lupin_b4/js/lcd-chance-profile.js?v=step6u');
    const { HOLD_CATALOG, DEBUG_HOLD_TYPES } = await import('/test_lupin_b4/js/hold-profile.js?v=step6u');
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');

    const lcdDestinations = {};
    for (const mode of ['NORMAL','WANTED_CHANCE']) {
      lcdDestinations[mode] = {};
      for (const key of ['WEAK_BLUE','MIDDLE_RED','STRONG_7']) {
        lcdDestinations[mode][key] = Object.keys(LCD_CHANCE_PROFILE[mode][key].destinations);
      }
    }

    const rng = { next: () => 0.999999 };
    const normal = new NormalSystem(rng, 1);
    normal.startWantedChance();
    const before = normal.snapshot();
    const injected = normal.holdQueue.injectNext('SEVEN_ZONE','DEBUG_INJECT');
    const afterInject = normal.snapshot();
    const afterConsume = normal.completeGame();

    return {
      lcdDestinations,
      catalog:HOLD_CATALOG.SEVEN_ZONE,
      debugTypes:DEBUG_HOLD_TYPES,
      before,
      injected,
      afterInject,
      afterConsume
    };
  });

  for (const mode of ['NORMAL','WANTED_CHANCE']) {
    for (const key of ['WEAK_BLUE','MIDDLE_RED','STRONG_7']) {
      expect(result.lcdDestinations[mode][key]).toEqual(['LB_OR_GT','FUJIKO_ZONE','DOROBO_ZONE']);
      expect(result.lcdDestinations[mode][key]).not.toContain('SEVEN_ZONE');
    }
  }

  expect(result.catalog).toMatchObject({
    type:'SEVEN_ZONE',
    guarantee:'SEVEN_ZONE',
    reservedEvent:'SEVEN_ZONE',
    source:'VERIFIED'
  });
  expect(result.debugTypes).toContain('SEVEN_ZONE');

  expect(result.before.mode).toBe('WANTED_CHANCE');
  expect(result.injected).toMatchObject({
    type:'SEVEN_ZONE',
    source:'DEBUG_INJECT',
    reservedEvent:'SEVEN_ZONE'
  });
  expect(result.afterInject.holdQueue[0]).toMatchObject({
    type:'SEVEN_ZONE',
    source:'DEBUG_INJECT',
    reservedEvent:'SEVEN_ZONE'
  });

  expect(result.afterConsume.lastConsumedHold).toMatchObject({
    type:'SEVEN_ZONE',
    source:'DEBUG_INJECT',
    reservedEvent:'SEVEN_ZONE'
  });
  expect(result.afterConsume.mode).toBe('SEVEN_ZONE');
  expect(result.afterConsume.wantedState).toBe('SUSPENDED');
  expect(result.afterConsume.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.afterConsume.holdCapacity).toBeNull();
  expect(result.afterConsume.holdQueue).toEqual([]);
  expect(result.afterConsume.transitionSource).toBe('HOLD_SEVEN_ZONE');
  expect(result.afterConsume.lastEvent).toBe('ENTER_SEVEN_ZONE_ART_GUARANTEED');
  expect(result.afterConsume.cz).toMatchObject({
    type:'SEVEN_ZONE',
    state:'ART_GUARANTEED',
    result:'SUCCESS',
    resultSource:'VERIFIED_ZONE_ENTRY_GUARANTEE',
    successModel:'GUARANTEED_ON_ENTRY',
    publishedOverallExpectation:'100%',
    transitionSource:'HOLD_SEVEN_ZONE'
  });
  expect(result.afterConsume.pendingReward).toMatchObject({
    type:'GOLDEN_TIME',
    source:'SEVEN_ZONE_ENTRY',
    guarantee:'ART_CONFIRMED',
    status:'PENDING_GOLDEN_TIME_IMPLEMENTATION'
  });
});
