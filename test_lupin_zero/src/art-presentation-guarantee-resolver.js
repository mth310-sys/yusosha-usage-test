export const ART_PRESENTATION_GUARANTEE_SPEC = Object.freeze({
  GOLD_T_SYMBOL: Object.freeze({
    label: '金T図柄',
    minimumTreasure: 300000,
    alternatives: Object.freeze(['MINIMUM_TREASURE_300000']),
    automaticSelectionRate: null,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }),
  GOLD: Object.freeze({
    label: '金',
    alternatives: Object.freeze(['MINIMUM_TREASURE_500000', 'ABSOLUTE_BREAKTHROUGH_OR_BETTER', 'MINIMUM_GAME_AWARD_50']),
    automaticSelectionRate: null,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }),
  TIGER_OR_RAINBOW: Object.freeze({
    label: '虎柄/レインボー',
    alternatives: Object.freeze(['MINIMUM_TREASURE_1000000', 'ABSOLUTE_BREAKTHROUGH_OR_BETTER']),
    automaticSelectionRate: null,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }),
  ATTACK_VISION: Object.freeze({
    label: 'アタックビジョン',
    alternatives: Object.freeze(['MINIMUM_TREASURE_1000000', 'GT_CONTINUATION_GUARANTEED']),
    automaticSelectionRate: null,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  })
});

export function getArtPresentationGuarantee(key) {
  return ART_PRESENTATION_GUARANTEE_SPEC[key] ?? null;
}

export function resolveGoldTSymbolMinimum(currentTreasure) {
  if (!Number.isInteger(currentTreasure) || currentTreasure < 0) throw new RangeError('currentTreasure must be a non-negative integer');
  const spec = ART_PRESENTATION_GUARANTEE_SPEC.GOLD_T_SYMBOL;
  const treasureTo = Math.max(currentTreasure, spec.minimumTreasure);
  return Object.freeze({
    key: 'GOLD_T_SYMBOL',
    treasureFrom: currentTreasure,
    treasureTo,
    added: treasureTo - currentTreasure,
    minimumTreasure: spec.minimumTreasure,
    evidenceStatus: spec.evidenceStatus
  });
}

export const ART_PRESENTATION_GUARANTEE_POLICY = Object.freeze({
  goldTSymbolMinimumTreasureImplemented: true,
  goldAlternativeBranchSelectionImplemented: false,
  tigerRainbowAlternativeBranchSelectionImplemented: false,
  attackVisionAlternativeBranchSelectionImplemented: false,
  unresolvedAlternativeSelectionRatesInvented: false
});
