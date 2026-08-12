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
  await expect(page.locator('#artReturnState')).toContainText('RESULT       NOT RUN');
  await expect(page.locator('#artReturnState')).toContainText('NO INTERPOLATION');
});

test('Step 6Z scenario 1 NORMAL to LB passes real transition audit', async ({ page }) => {
  await boot(page);
  await page.locator('#normalLbScenarioRun').click();
  await expect(page.locator('#normalLbScenarioState')).toContainText('AUDIT       OK');
  await expect(page.locator('#normalLbScenarioState')).toContainText('DESTINATION LUPIN_BONUS');
});

test('Step 6Z scenario 2 NORMAL to GT passes real transition audit', async ({ page }) => {
  await boot(page);
  await page.locator('#normalGtScenarioRun').click();
  await expect(page.locator('#normalGtScenarioState')).toContainText('AUDIT       OK');
  await expect(page.locator('#normalGtScenarioState')).toContainText('DESTINATION GOLDEN_TIME');
});

test('Step 6Z scenario 3 LB win to GT passes real boundary audit', async ({ page }) => {
  await boot(page);
  await page.locator('#lbWinGtScenarioSetup').click();
  await expect(page.locator('#lbWinGtScenarioState')).toContainText('PLAY 1 GAME');
  await playOneGame(page);
  await expect(page.locator('#lbWinGtScenarioState')).toContainText('AUDIT       OK');
});

test('Step 6Z scenario 4 LB fail to Revenge passes real boundary audit', async ({ page }) => {
  await boot(page);
  await page.locator('#lbFailRevengeScenarioSetup').click();
  await expect(page.locator('#lbFailRevengeScenarioState')).toContainText('PLAY 1 GAME');
  await playOneGame(page);
  await expect(page.locator('#lbFailRevengeScenarioState')).toContainText('AUDIT       OK');
});

test('Step 6Z scenario 5 GT loss to Revenge passes real boundary audit', async ({ page }) => {
  await boot(page);
  await page.locator('#gtLossRevengeScenarioSetup').click();
  await expect(page.locator('#gtLossRevengeScenarioState')).toContainText('PLAY 1 GAME');
  await playOneGame(page);
  await expect(page.locator('#gtLossRevengeScenarioState')).toContainText('AUDIT       OK');
});

test('Step 6Z scenario 6 GT return hit reaches LB notice boundary', async ({ page }) => {
  await boot(page);
  await page.locator('#gtReturnHitScenarioSetup').click();
  await expect(page.locator('#gtReturnHitScenarioState')).toContainText('PLAY 1 GAME');
  await playOneGame(page);
  await expect(page.locator('#gtReturnHitScenarioState')).toContainText('AUDIT       OK');
  await expect(page.locator('#gtReturnHitScenarioState')).toContainText('PENDING NOTICE');
});

test('Step 6Z scenario 7 Revenge fail returns to NORMAL with audit OK', async ({ page }) => {
  await boot(page);
  await page.locator('#revengeFailNormalScenarioSetup').click();
  await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('PLAY 1 GAME');
  await playOneGame(page);
  await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('AUDIT       OK');
  await expect(page.locator('#revengeFailNormalScenarioState')).toContainText('NORMAL MODE NORMAL');
});
