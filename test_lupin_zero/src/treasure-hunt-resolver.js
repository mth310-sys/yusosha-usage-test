import { ReuseEvidenceStatus } from './reuse-registry.js';

export const TREASURE_HUNT_SPEC = Object.freeze({
  successOutcome: 'TREASURE_OR_TREASURE_RUSH',
  artGameCountFrozenDuringPresentation: true,
  scenarios: Object.freeze([
    Object.freeze({ key: 'BRIDGE_JUMP', label: '橋を飛び越えろ', evidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY }),
    Object.freeze({ key: 'CUT_THROUGH_WARSHIP', label: '軍艦を斬り裂け', evidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY }),
    Object.freeze({ key: 'SHOOT_DOWN_COMBAT_HELICOPTER', label: '戦闘ヘリを撃墜せよ', evidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY }),
    Object.freeze({ key: 'IMMORTAL_BOND', label: '不滅の絆', evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS })
  ]),
  immortalBond: Object.freeze({ expectation: 'OVER_90_PERCENT', treasureRushOnSuccess: true, artStockCanOccur: true }),
  guaranteedHolds: Object.freeze({
    FLAME_LUPIN: Object.freeze({ label: '炎ルパン', successGuaranteed: true, minimumTreasure: 200000 }),
    FUJIKO: Object.freeze({ label: '不二子', successGuaranteed: true, minimumTreasure: 300000 }),
    TAMACHAN: Object.freeze({ label: '玉ちゃん', successGuaranteed: true, minimumTreasure: 1000000 })
  }),
  unresolved: Object.freeze({
    naturalEntryRate: true,
    normalHoldSuccessRate: true,
    treasureVsRushDestinationSplit: true,
    successTreasureDistribution: true,
    scenarioSelectionDistribution: true,
    specialHoldNaturalOccurrenceRates: true
  }),
  presentationPolicy: Object.freeze({
    scenarioSelectionAffectsOutcome: false,
    productionPresentationCycleAllowed: true,
    cycleEvidenceStatus: ReuseEvidenceStatus.PRESENTATION_ONLY,
    reason: 'Scenario selection distribution is unresolved, so ZERO may cycle known presentations only as a non-probabilistic visual layer.'
  }),
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

export function getTreasureHuntGuaranteedHold(type) {
  return TREASURE_HUNT_SPEC.guaranteedHolds[type] ?? null;
}

export function getTreasureHuntScenario(key) {
  return TREASURE_HUNT_SPEC.scenarios.find((row) => row.key === key) ?? null;
}

export function getTreasureHuntPresentationByIndex(index = 0) {
  const rows = TREASURE_HUNT_SPEC.scenarios;
  const normalized = ((Number(index) || 0) % rows.length + rows.length) % rows.length;
  return Object.freeze({ ...rows[normalized], index: normalized, affectsOutcome: false });
}

export function resolveGuaranteedTreasureHunt(type) {
  const hold = getTreasureHuntGuaranteedHold(type);
  if (!hold) return null;
  return Object.freeze({
    type,
    label: hold.label,
    success: true,
    minimumTreasure: hold.minimumTreasure,
    treasureRushGuaranteed: false,
    evidenceStatus: TREASURE_HUNT_SPEC.evidenceStatus
  });
}

export function resolveImmortalBondSuccess() {
  return Object.freeze({
    success: true,
    treasureRushGuaranteed: true,
    artStockPossible: true,
    artStockRateResolved: false,
    evidenceStatus: TREASURE_HUNT_SPEC.evidenceStatus
  });
}
