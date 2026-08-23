import { test, expect } from '@playwright/test';
import { resolveLegendGateTrigger, createLegendGateEntry } from '../test_lupin_zero/src/legend-gate-resolver.js';
import { getNormalRoleDenominator } from '../test_lupin_zero/src/verified-spec.js';

const role = (name) => Object.freeze({ role: name });

test('published premium and legend role denominators remain the source of freeze triggers', () => {
  expect(getNormalRoleDenominator('PREMIUM', 1)).toBe(65536);
  expect(getNormalRoleDenominator('LEGEND', 1)).toBe(65536);
});

test('only PREMIUM and LEGEND arm long freeze to Legend Gate', () => {
  for (const name of ['PREMIUM', 'LEGEND']) {
    const resolved = resolveLegendGateTrigger(role(name));
    expect(resolved.hit).toBe(true);
    expect(resolved.presentation).toBe('LONG_FREEZE');
    expect(resolved.destination).toBe('GOLDEN_TIME');
    expect(createLegendGateEntry(resolved)?.mode).toBe('LEGEND_GATE');
  }

  for (const name of ['MB', 'REPLAY', 'THREE_COIN', 'NINE_COIN', 'TEN_COIN']) {
    expect(resolveLegendGateTrigger(role(name)).hit).toBe(false);
  }
});

test('runtime entry refuses to invent Seven Medal acquisition or extra stock distribution', () => {
  const entry = createLegendGateEntry(resolveLegendGateTrigger(role('LEGEND')));
  expect(entry.automaticMedalLotteryImplemented).toBe(false);
  expect(entry.automaticStockAwardImplemented).toBe(false);
  expect(entry.unresolved).toContain('MEDAL_ACQUISITION_DISTRIBUTION');
  expect(entry.unresolved).toContain('EXACT_STOCK_DISTRIBUTION_ABOVE_MINIMUM');
});
