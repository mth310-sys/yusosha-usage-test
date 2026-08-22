import { ReuseEvidenceStatus, evaluateReuseCandidate } from './reuse-registry.js';

export const NORMAL_ROLE_PRODUCTION_INFERENCE = Object.freeze({
  status: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  label: 'NO_PAYOUT_OTHER',
  confidence: 'HIGH',
  basis: Object.freeze([
    'Published normal-game role probabilities explicitly account for replay, 3-coin, MB, 9-coin, 10-coin, premium and legend roles.',
    'The remaining probability mass must allow ordinary non-winning games for the machine to operate at the published base game rate.',
    'No positive payout is assigned to the residual; any future identified role can replace part of this bucket without changing published known-role probabilities.'
  ]),
  replaceable: true,
  targetSpecific: true,
  payoutCoins: 0,
  note: 'Production fallback only. This is not promoted to verified real-machine evidence.'
});

const inferenceGate = evaluateReuseCandidate({
  sourcePath: 'test_lupin_zero/src/normal-role-production-adapter.js',
  targetIdentityKey: '2016_OLYMPIA_LUPIN_KESARETA_B4',
  evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  responsibility: 'MACHINE_RULE',
  productionBehavior: true,
  zeroYen: true,
  adaptationCost: 'LOW',
  sourceSpecificToTarget: true,
  inferenceDocumented: true,
  confidence: 'HIGH',
  derivedFromKnownEvidence: true,
  replaceable: true
});

export function adaptNormalRoleForProduction(resolution) {
  if (!resolution || typeof resolution !== 'object') throw new TypeError('role resolution is required');
  if (resolution.kind === 'KNOWN_ROLE') return resolution;
  if (resolution.kind !== 'UNRESOLVED_OTHER') return resolution;
  if (!inferenceGate.reusable) throw new Error('high-confidence residual inference gate rejected');

  return Object.freeze({
    kind: 'INFERRED_ROLE',
    role: NORMAL_ROLE_PRODUCTION_INFERENCE.label,
    sourceKind: resolution.kind,
    draw: resolution.draw,
    setting: resolution.setting,
    payoutCoins: NORMAL_ROLE_PRODUCTION_INFERENCE.payoutCoins,
    evidenceStatus: NORMAL_ROLE_PRODUCTION_INFERENCE.status,
    confidence: NORMAL_ROLE_PRODUCTION_INFERENCE.confidence,
    replaceable: NORMAL_ROLE_PRODUCTION_INFERENCE.replaceable
  });
}

export const NORMAL_ROLE_PRODUCTION_POLICY = Object.freeze({
  knownRolesPreservedExactly: true,
  unresolvedResidualProductionFallback: NORMAL_ROLE_PRODUCTION_INFERENCE.label,
  fallbackEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  fallbackMayBePromotedToVerifiedAutomatically: false,
  futureIdentifiedRolesMayCarveProbabilityFromFallback: true
});
