import { test, expect } from '@playwright/test';

async function boot(page){
  const errors=[];
  page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack??''}));
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');
  if(errors.length)console.error('PAGE_ERRORS',JSON.stringify(errors,null,2));
  expect(errors).toEqual([]);
  await expect(page.locator('#machineScenarioGuidePanel')).toBeVisible();
  return errors;
}

async function playOneGame(page){
  await expect(page.locator('#betButton')).toBeEnabled();
  await page.locator('#betButton').click();
  await expect(page.locator('#leverButton')).toBeEnabled();
  await page.locator('#leverButton').click();
  for(const index of ['0','1','2']){
    const stop=page.locator(`[data-stop="${index}"]`);
    await expect(stop).toBeEnabled();
    await stop.click();
  }
  await expect(page.locator('#phase')).toHaveText('WAIT_BET');
}

test('Lupin B4 boots without page errors and exposes Step 6Z', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#step6zCompletionPanel')).toBeVisible();
  await expect(page.locator('#machineScenarioGuideState')).toContainText('NORMAL → LB');
  await expect(page.locator('#machineScenarioGuideState')).toContainText('REVENGE FAIL → NORMAL');
});

test('Unverified values stay guarded instead of silently becoming automatic behavior', async ({ page }) => {
  await boot(page);
  await expect(page.locator('#sevenAttackState')).toContainText('ENTRY RATE      UNVERIFIED / AUTO ENTRY DISABLED');
  await expect(page.locator('#lcdChanceState')).toContainText('VISUAL STEP-UP DISTRIBUTION: UNVERIFIED');
  await expect(page.locator('#revengePolicy')).toContainText('UNVERIFIED');
});

test('Unsupported Treasure return rows remain unresolved with no interpolation', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{
    const profile=await import('/test_lupin_b4/js/art-return-profile.js');
    return {pct:profile.getArtReturnPct(50000),confidence:profile.getArtReturnConfidence(50000),policy:profile.ART_RETURN_PROFILE.unsupportedPolicy};
  });
  expect(result).toEqual({pct:null,confidence:'UNRESOLVED',policy:'NO_INTERPOLATION_FOR_UNLISTED_TREASURE_VALUE'});
});

test('Verified WANTED target draws stay inside their published 32G bands and 480G hard max', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{
    const profile=await import('/test_lupin_b4/js/wanted-profile.js');
    const makeRng=(values)=>({i:0,next(){return values[this.i++%values.length];}});
    const initialLow=profile.drawWantedInitialTarget(makeRng([0,0]));
    const initialHigh=profile.drawWantedInitialTarget(makeRng([0.999999,0.999999]));
    const postBySetting={};
    for(let setting=1;setting<=6;setting+=1){postBySetting[setting]={low:profile.drawWantedPostWcTarget(setting,makeRng([0,0])),high:profile.drawWantedPostWcTarget(setting,makeRng([0.999999,0.999999]))};}
    return {initialLow,initialHigh,postBySetting,profile:profile.WANTED_CHANCE_PROFILE};
  });
  const inside=(target)=>target.game>=target.zone.min&&target.game<=target.zone.max&&target.game<=480;
  expect(inside(result.initialLow)).toBe(true);expect(inside(result.initialHigh)).toBe(true);
  expect(result.initialLow.game).toBe(1);expect(result.initialHigh.game).toBe(480);
  for(const pair of Object.values(result.postBySetting)){expect(inside(pair.low)).toBe(true);expect(inside(pair.high)).toBe(true);}
  expect(result.profile.baseGames).toBe(10);expect(result.profile.holdCapacity).toBe(8);expect(result.profile.hardMaxGame).toBe(480);expect(result.profile.inBandDistribution).toBe('UNIFORM');
});

test('Verified CZ length/scenario tables keep boundary draws deterministic for settings 1-6', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{
    const profile=await import('/test_lupin_b4/js/cz-profile.js');const rng=(value)=>({next:()=>value});const rows={};
    for(let setting=1;setting<=6;setting+=1){rows[setting]={lengthLow:profile.drawCzLength(setting,rng(0)),lengthHigh:profile.drawCzLength(setting,rng(0.999999)),scenarioLow:profile.drawCzScenario(setting,rng(0)),scenarioHigh:profile.drawCzScenario(setting,rng(0.999999)),lengthTable:profile.CZ_LENGTH_TABLE[setting],scenarioTable:profile.CZ_SCENARIO_TABLE[setting]};}
    return rows;
  });
  for(const row of Object.values(result)){expect(row.lengthLow).toBe(10);expect(row.lengthHigh).toBe(20);expect(row.scenarioLow).toBe('A');expect(row.scenarioHigh).toBe('D');expect(row.lengthTable[10]+row.lengthTable[20]).toBeCloseTo(100,5);expect(Object.values(row.scenarioTable).reduce((sum,value)=>sum+value,0)).toBeCloseTo(100,1);}
});

test('SEVEN ZONE entry remains an ART guarantee without inventing a per-game success rate', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{const {NormalSystem}=await import('/test_lupin_b4/js/normal.js');const normal=new NormalSystem({next:()=>0.5},1);normal.startSevenZone('BROWSER_VERIFIED_TEST');return normal.snapshot();});
  expect(result.mode).toBe('SEVEN_ZONE');expect(result.cz.state).toBe('ART_GUARANTEED');expect(result.cz.result).toBe('SUCCESS');expect(result.cz.successModel).toBe('GUARANTEED_ON_ENTRY');expect(result.pendingReward.type).toBe('GOLDEN_TIME');expect(result.pendingReward.guarantee).toBe('ART_CONFIRMED');
});

test('RIZE published confidence table stays exact while unverified duration and upgrades remain absent', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{const p=await import('/test_lupin_b4/js/rize-profile.js');return {entry:p.RIZE_PROFILE.entryRate,expectation:p.RIZE_PROFILE.overallExpectation,blue:p.getRizeConfidence('RIZE','BLUE'),purple:p.getRizeConfidence('RIZE','PURPLE'),rainbow:p.getRizeConfidence('RIZE','RAINBOW'),shinBlue:p.getRizeConfidence('SHIN_RIZE','BLUE'),unknown:p.getRizeConfidence('RIZE','UNKNOWN'),duration:p.RIZE_PROFILE.duration,upgrade:p.RIZE_PROFILE.upgradeModel};});
  expect(result.entry).toBe(2980.1);expect(result.expectation).toBe(44.66);expect(result.blue).toBe(35.58);expect(result.purple).toBe(76.01);expect(result.rainbow).toBe(100);expect(result.shinBlue).toBe(69.20);expect(result.unknown).toBeNull();expect(result.duration).toBeUndefined();expect(result.upgrade).toBeUndefined();
});

test('Raiun verified aggregate boundaries preserve 7G high, 20G mode, 0.8% Shin upgrade and 1/88.9 Legend Gate', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{const p=await import('/test_lupin_b4/js/raiun-profile.js');return {profile:p.RAIUN_PROFILE,lowHit:p.rollRaiunHighEntry('LOW',{next:()=>0}),lowMiss:p.rollRaiunHighEntry('LOW',{next:()=>0.999999}),shinHit:p.rollShinRaiunUpgrade({next:()=>0}),shinMiss:p.rollShinRaiunUpgrade({next:()=>0.999999}),legendHit:p.rollShinRaiunLegendGate({next:()=>0}),legendMiss:p.rollShinRaiunLegendGate({next:()=>0.999999})};});
  expect(result.profile.high.totalGames).toBe(7);expect(result.profile.high.LOW.denominator).toBe(30.5);expect(result.profile.high.HIGH.denominator).toBe(13.3);expect(result.profile.mode.normalGames).toBe(20);expect(result.profile.mode.artExpectation).toBe(23);expect(result.profile.mode.shinUpgradeRate).toBe(0.8);expect(result.profile.mode.shinContinuesUntilArt).toBe(true);expect(result.profile.mode.shinPerGameArtRate).toBe('UNVERIFIED');expect(result.profile.mode.shinLegendGateDenominator).toBe(88.9);expect(result.lowHit).toBe(true);expect(result.lowMiss).toBe(false);expect(result.shinHit).toBe(true);expect(result.shinMiss).toBe(false);expect(result.legendHit).toBe(true);expect(result.legendMiss).toBe(false);
});

test('LEGEND GATE keeps verified minimum GT stock benefits and leaves duration/medal acquisition unverified', async ({ page }) => {
  await boot(page);
  const result=await page.evaluate(async()=>{const p=await import('/test_lupin_b4/js/legend-gate-profile.js');return {profile:p.LEGEND_GATE_PROFILE,one:p.getLegendGateBenefit(1),two:p.getLegendGateBenefit(2),three:p.getLegendGateBenefit(3),unsupported:p.getLegendGateBenefit(4)};});
  expect(result.profile.type).toBe('ART_STOCK_SPECIAL_ZONE');expect(result.profile.trigger).toBe('LONG_FREEZE');expect(result.profile.entryDenominator.SHIN_RAIUN).toBe(88.9);expect(result.profile.entryDenominator.SETTING_1_4).toBe(27127);expect(result.profile.entryDenominator.SETTING_5).toBe(14840.9);expect(result.profile.entryDenominator.SETTING_6).toBe(12100.7);expect(result.one.minGtStocks).toBe(2);expect(result.two.minGtStocks).toBe(5);expect(result.three.minGtStocks).toBe(6);expect(result.unsupported).toBeNull();expect(result.profile.duration).toBe('UNVERIFIED');expect(result.profile.medalAcquisitionModel).toBe('UNVERIFIED');
});

test('Step 6Z scenario 1 NORMAL to LB passes real transition audit', async ({ page }) => {await boot(page);await page.locator('#normalLbScenarioRun').click();await expect(page.locator('#normalLbScenarioState')).toContainText('AUDIT       OK');await expect(page.locator('#normalLbScenarioState')).toContainText('DESTINATION LUPIN_BONUS');});
test('Step 6Z scenario 2 NORMAL to GT passes real transition audit', async ({ page }) => {await boot(page);await page.locator('#normalGtScenarioRun').click();await expect(page.locator('#normalGtScenarioState')).toContainText('AUDIT       OK');await expect(page.locator('#normalGtScenarioState')).toContainText('DESTINATION GOLDEN_TIME');});
test('Step 6Z scenario 3 LB win to GT passes real boundary audit', async ({ page }) => {await boot(page);await page.locator('#lbWinGtScenarioSetup').click();await expect(page.locator('#lbWinGtScenarioState')).toContainText('PLAY 1 GAME');await playOneGame(page);await expect(page.locator('#lbWinGtScenarioState')).toContainText('AUDIT       OK');});
test('Step 6Z scenario 4 LB fail to Revenge passes real boundary audit', async ({ page }) => {await boot(page);await page.locator('#lbFailRevengeScenarioSetup').click();await expect(page.locator('#lbFailRevengeScenarioState')).toContainText('PLAY 1 GAME');await playOneGame(page);await expect(page.locator('#lbFailRevengeScenarioState')).toContainText('AUDIT       OK');});
test('Step 6Z scenario 5 GT loss to Revenge passes real boundary audit', async ({ page }) => {await boot(page);await page.locator('#gtLossRevengeScenarioSetup').click();await expect(page.locator('#gtLossRevengeScenarioState')).toContainText('PLAY 1 GAME');await playOneGame(page);await expect(page.locator('#gtLossRevengeScenarioState')).toContainText('AUDIT       OK');});
test('Step 6Z scenario 6 GT return hit reaches LB notice boundary', async ({ page }) => {await boot(page);await page.locator('#gtReturnHitScenarioSetup').click();await expect(page.locator('#gtReturnHitScenarioState')).toContainText('PLAY 1 GAME');await playOneGame(page);await expect(page.locator('#gtReturnHitScenarioState')).toContainText('AUDIT       OK');await expect(page.locator('#gtReturnHitScenarioState')).toContainText('PENDING NOTICE');});
test('Step 6Z scenario 7 Revenge fail returns to NORMAL with audit OK', async ({ page }) => {await boot(page);await page.locator('#revengeFailNormalScenarioSetup').click();await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('PLAY 1 GAME');await playOneGame(page);await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('AUDIT       OK');await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('NORMAL MODE NORMAL');});
