import { ReuseEvidenceStatus } from './reuse-registry.js';

export const TREASURE_HUNT_SPEC = Object.freeze({
  successOutcome: 'TREASURE_OR_TREASURE_RUSH',
  artGameCountFrozenDuringPresentation: true,
  scenarios: Object.freeze(['BRIDGE_JUMP', 'CUT_THROUGH_WARSHIP', 'SHOOT_DOWN_COMBAT_HELICOPTER', 'IMMORTAL_BOND']),
  immortalBond: Object.freeze({ expectation: 'OVER_90_PERCENT', treasureRushOnSuccess: true, artStockCanOccur: true }),
  guaranteedHolds: Object.freeze({
    FLAME_LUPIN: Object.freeze({ successGuaranteed: true, minimumTreasure: 200000 }),
    FUJIKO: Object.freeze({ successGuaranteed: true, minimumTreasure: 300000 }),
    TAMACHAN: Object.freeze({ successGuaranteed: true, minimumTreasure: 1000000 })
  }),
  unresolved: Object.freeze({
    naturalEntryRate: true,
    normalHoldSuccessRate: true,
    treasureVsRushDestinationSplit: true,
    successTreasureDistribution: true,
    scenarioSelectionDistribution: true
  }),
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

export function getTreasureHuntGuaranteedHold(type) {
  return TREASURE_HUNT_SPEC.guaranteedHolds[type] ?? null;
}

export function resolveGuaranteedTreasureHunt(type) {
  const hold = getTreasureHuntGuaranteedHold(type);
  if (!hold) return null;
  return Object.freeze({
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
