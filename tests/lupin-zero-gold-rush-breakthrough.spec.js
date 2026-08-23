import { test, expect } from '@playwright/test';
import { resolveBreakthroughGuarantee, BREAKTHROUGH_GUARANTEE_SPEC } from '../test_lupin_zero/src/breakthrough-guarantee-resolver.js';

test('absolute breakthrough guarantees at least one GT stock', () => {
  const row = resolveBreakthroughGuarantee('ABSOLUTE_BREAKTHROUGH');
  expect(row.minimumGtStockAward).toBe(1);
  expect(row.selectionRateResolved).toBe(false);
});

test('limit breakthrough guarantees at least two GT stocks', () => {
  const row = resolveBreakthroughGuarantee('LIMIT_BREAKTHROUGH');
  expect(row.minimumGtStockAward).toBe(2);
  expect(row.selectionRateResolved).toBe(false);
});

test('breakthrough selection rates remain unresolved', () => {
  expect(BREAKTHROUGH_GUARANTEE_SPEC.exactSelectionRatesKnown).toBe(false);
  expect(BREAKTHROUGH_GUARANTEE_SPEC.unresolved.exactSelectionRates).toBe(true);
});

test('GOLD RUSH runtime exposes explicit one-shot rank setter and keeps normal +1 baseline', async ({ page }) => {
  const source = await page.request.get('/test_lupin_zero/src/gold-rush-runtime.js').then((r) => r.text());
  expect(source).toContain('setNextGoldRushBreakthrough');
  expect(source).toContain('const stockAdded = Math.max(1, breakthrough?.minimumGtStockAward ?? 1)');
  expect(source).toContain("pendingBreakthroughType = null");
  expect(source).not.toContain('nextFloat() <');
});
