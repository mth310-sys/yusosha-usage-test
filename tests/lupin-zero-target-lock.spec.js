import { test, expect } from '@playwright/test';

test('Lupin ZERO target identity is locked to the 2016 Olympia B4 machine', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { LUPIN_ZERO_TARGET, isTargetIdentity } = await import('/test_lupin_zero/src/target-lock.js');
    return {
      target: LUPIN_ZERO_TARGET,
      acceptsExact: isTargetIdentity({
        manufacturer: 'OLYMPIA',
        title: 'パチスロ ルパン三世～消されたルパン～',
        model: 'ルパン三世消されたルパン/B4',
        releaseYear: 2016
      }),
      acceptsSenko: isTargetIdentity({
        manufacturer: 'OLYMPIA',
        title: '閃光のルパン',
        model: 'OTHER',
        releaseYear: 2022
      })
    };
  });

  expect(result.target.identityKey).toBe('OLYMPIA_2016_LUPIN_KESARETA_B4');
  expect(result.target.excludedMachineNames).toContain('閃光のルパン');
  expect(result.target.sourceGate.requireTargetIdentityBeforeAdoption).toBe(true);
  expect(result.target.sourceGate.rejectCrossMachineProbabilityImport).toBe(true);
  expect(result.target.sourceGate.rejectCrossMachinePresentationImport).toBe(true);
  expect(result.target.sourceGate.rejectCrossMachineMechanismImport).toBe(true);
  expect(result.acceptsExact).toBe(true);
  expect(result.acceptsSenko).toBe(false);
});
