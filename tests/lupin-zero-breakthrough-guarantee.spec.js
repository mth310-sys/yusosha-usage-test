import { test, expect } from '@playwright/test';
import { BREAKTHROUGH_GUARANTEE_SPEC, resolveBreakthroughGuarantee } from '../test_lupin_zero/src/breakthrough-guarantee-resolver.js';

test('absolute breakthrough guarantees at least one GT stock', () => {
  const r = resolveBreakthroughGuarantee('ABSOLUTE_BREAKTHROUGH');
  expect(r.minimumGtStockAward).toBe(1);
  expect(r.selectionRateResolved).toBe(false);
});

test('limit breakthrough guarantees at least two GT stocks', () => {
  const r = resolveBreakthroughGuarantee('LIMIT_BREAKTHROUGH');
  expect(r.minimumGtStockAward).toBe(2);
  expect(r.selectionRateResolved).toBe(false);
});

test('published breakthrough rank selection rates remain unresolved', () => {
  expect(BREAKTHROUGH_GUARANTEE_SPEC.exactSelectionRatesKnown).toBe(false);
  expect(BREAKTHROUGH_GUARANTEE_SPEC.unresolved.exactSelectionRates).toBe(true);
  expect(BREAKTHROUGH_GUARANTEE_SPEC.unresolved.goldPresentation50GameMeaning).toBe(true);
});
