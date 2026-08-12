import { test, expect } from '@playwright/test';

test('Lupin B4 boots without page errors and exposes Step 6Z', async ({ page }) => {
  const errors=[];
  page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack??''}));
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');
  if(errors.length)console.error('PAGE_ERRORS',JSON.stringify(errors,null,2));
  expect(errors).toEqual([]);
  await expect(page.locator('#machineScenarioGuidePanel')).toBeVisible();
  await expect(page.locator('#step6zCompletionPanel')).toBeVisible();
  await expect(page.locator('#machineScenarioGuideState')).toContainText('NORMAL → LB');
  await expect(page.locator('#machineScenarioGuideState')).toContainText('REVENGE FAIL → NORMAL');
});
