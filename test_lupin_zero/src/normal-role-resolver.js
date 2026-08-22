import { getNormalRoleDenominator, VERIFIED_SPEC } from './verified-spec.js';

const ROLE_ORDER = Object.freeze([
  'PREMIUM',
  'LEGEND',
  'MB',
  'THREE_COIN',
  'REPLAY',
  'NINE_COIN',
  'TEN_COIN'
]);

export const NORMAL_ROLE_RESOLVER_POLICY = Object.freeze({
  evidenceStatus: VERIFIED_SPEC.evidence.normalRoleDenominators,
  premiumLegendEvidenceStatus: VERIFIED_SPEC.evidence.premiumLegendDenominators,
  unknownResidualStatus: 'UNRESOLVED',
  unknownResidualLabel: 'UNRESOLVED_OTHER',
  residualMayBeTreatedAsMiss: false,
  residualMayBeGivenInventedPayout: false,
  note: 'Known published role probabilities are sampled exactly. Remaining probability mass is not guessed.'
});

function validateSetting(setting) {
  if (!Number.isInteger(setting) || setting < 1 || setting > 6) {
    throw new RangeError('setting must be an integer from 1 to 6');
  }
}

export function getKnownNormalRoleWeights(setting = 1) {
  validateSetting(setting);
  return Object.freeze(ROLE_ORDER.map((role) => {
    const denominator = getNormalRoleDenominator(role, setting);
    return Object.freeze({ role, denominator, probability: 1 / denominator });
  }));
}

export function getKnownProbabilityMass(setting = 1) {
  return getKnownNormalRoleWeights(setting).reduce((sum, item) => sum + item.probability, 0);
}

export function getUnresolvedProbabilityMass(setting = 1) {
  return Math.max(0, 1 - getKnownProbabilityMass(setting));
}

export function resolveNormalRole(randomSource, setting = 1) {
  validateSetting(setting);
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }

  const draw = randomSource.nextFloat();
  let cursor = 0;
  for (const item of getKnownNormalRoleWeights(setting)) {
    cursor += item.probability;
    if (draw < cursor) {
      return Object.freeze({
        kind: 'KNOWN_ROLE',
        role: item.role,
        draw,
        setting,
        evidenceStatus: item.role === 'PREMIUM' || item.role === 'LEGEND'
          ? VERIFIED_SPEC.evidence.premiumLegendDenominators
          : VERIFIED_SPEC.evidence.normalRoleDenominators
      });
    }
  }

  return Object.freeze({
    kind: 'UNRESOLVED_OTHER',
    role: null,
    draw,
    setting,
    evidenceStatus: NORMAL_ROLE_RESOLVER_POLICY.unknownResidualStatus
  });
}
