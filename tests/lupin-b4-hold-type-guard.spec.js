import { test, expect } from '@playwright/test';

test('unknown hold types stay unresolved instead of silently becoming NORMAL holds', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/hold-profile.js');
    const queueModule = await import('/test_lupin_b4/js/hold-queue.js');
    const queue = new queueModule.HoldQueue(2);
    queue.fill();
    const before = queue.snapshot();
    const injected = queue.injectNext('UNKNOWN_HOLD_TYPE');
    return {
      unknownDefinition: profile.getHoldDefinition('UNKNOWN_HOLD_TYPE'),
      normalDefinition: profile.getHoldDefinition('NORMAL'),
      injected,
      before,
      after: queue.snapshot()
    };
  });

  expect(result.unknownDefinition).toBeNull();
  expect(result.normalDefinition.type).toBe('NORMAL');
  expect(result.normalDefinition.source).toBe('BASE');
  expect(result.injected).toBeNull();
  expect(result.after).toEqual(result.before);
});
