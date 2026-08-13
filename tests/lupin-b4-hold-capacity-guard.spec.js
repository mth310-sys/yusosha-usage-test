import { test, expect } from '@playwright/test';

test('hold queue rejects invalid capacities without changing verified default capacity', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { HoldQueue } = await import('/test_lupin_b4/js/hold-queue.js');

    const invalid = [0, -1, 1.5, Infinity, 'UNKNOWN'].map(value => {
      const queue = new HoldQueue(value);
      return {
        capacity: queue.capacity,
        fill: queue.fill(),
        inject: queue.injectNext('NORMAL'),
        consume: queue.consumeAndRefill(),
        snapshot: queue.snapshot()
      };
    });

    const normal = new HoldQueue();
    const filled = normal.fill();
    return {
      invalid,
      normalCapacity: normal.capacity,
      normalLength: filled.length,
      normalTypes: filled.map(item => item.type)
    };
  });

  for (const entry of result.invalid) {
    expect(entry.capacity).toBeNull();
    expect(entry.fill).toBeNull();
    expect(entry.inject).toBeNull();
    expect(entry.consume).toBeNull();
    expect(entry.snapshot).toEqual([]);
  }

  expect(result.normalCapacity).toBe(8);
  expect(result.normalLength).toBe(8);
  expect(result.normalTypes.every(type => type === 'NORMAL')).toBe(true);
});
