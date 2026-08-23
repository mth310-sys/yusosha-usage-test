import { ReuseEvidenceStatus } from './reuse-registry.js';

export const BREAKTHROUGH_GUARANTEE_SPEC = Object.freeze({
  ABSOLUTE_BREAKTHROUGH: Object.freeze({
    label: '絶対突破',
    minimumGtStockAward: 1,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  }),
  LIMIT_BREAKTHROUGH: Object.freeze({
    label: '限界突破',
    minimumGtStockAward: 2,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  }),
  exactSelectionRatesKnown: false,
  sourceContext: 'GOLD_RUSH_RED_SYMBOL_ALIGNMENT',
  unresolved: Object.freeze({
    exactSelectionRates: true,
    goldPresentation50GameMeaning: true
  })
});

export function resolveBreakthroughGuarantee(type) {
  const row = BREAKTHROUGH_GUARANTEE_SPEC[type] ?? null;
  if (!row) return null;
  return Object.freeze({
    type,
    label: row.label,
    minimumGtStockAward: row.minimumGtStockAward,
    evidenceStatus: row.evidenceStatus,
    selectionRateResolved: false
  });
}
