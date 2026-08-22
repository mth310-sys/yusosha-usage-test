import { VERIFIED_SPEC } from './verified-spec.js';

export const CHANCE_EYE_OCCURRENCE = Object.freeze({
  NONE: 'NONE',
  WEAK: 'WEAK',
  MIDDLE: 'MIDDLE',
  STRONG: 'STRONG'
});

const PROFILE = Object.freeze([
  Object.freeze({ kind: CHANCE_EYE_OCCURRENCE.STRONG, key: 'strong' }),
  Object.freeze({ kind: CHANCE_EYE_OCCURRENCE.MIDDLE, key: 'middle' }),
  Object.freeze({ kind: CHANCE_EYE_OCCURRENCE.WEAK, key: 'weak' })
]);

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function getChanceEyeOccurrenceWeights(mode = 'normal') {
  if (!['normal', 'wantedChance'].includes(mode)) throw new Error(`Unknown chance-eye mode: ${mode}`);
  return Object.freeze(PROFILE.map(({ kind, key }) => {
    const spec = VERIFIED_SPEC.liquidReel.chanceEyes[key];
    const denominator = mode === 'normal' ? spec.normalDenominator : spec.wantedChanceDenominator;
    return Object.freeze({ kind, key, denominator, probability: 1 / denominator });
  }));
}

export function getChanceEyeOccurrenceMass(mode = 'normal') {
  return getChanceEyeOccurrenceWeights(mode).reduce((sum, item) => sum + item.probability, 0);
}

export function resolveChanceEyeOccurrence(randomSource, mode = 'normal') {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  let cursor = 0;

  for (const item of getChanceEyeOccurrenceWeights(mode)) {
    cursor += item.probability;
    if (draw < cursor) {
      return Object.freeze({
        occurred: true,
        kind: item.kind,
        key: item.key,
        denominator: item.denominator,
        probability: item.probability,
        draw,
        mode,
        evidenceStatus: VERIFIED_SPEC.evidence.liquidReelChanceEyeRates
      });
    }
  }

  return Object.freeze({
    occurred: false,
    kind: CHANCE_EYE_OCCURRENCE.NONE,
    key: null,
    denominator: null,
    probability: 1 - cursor,
    draw,
    mode,
    evidenceStatus: VERIFIED_SPEC.evidence.liquidReelChanceEyeRates
  });
}

export const CHANCE_EYE_OCCURRENCE_POLICY = Object.freeze({
  categoriesAreMutuallyExclusiveOnLiquidDisplay: true,
  occurrenceRatesUsedDirectly: true,
  coupledToBasePhysicalRoleLottery: false,
  baseRoleRelationshipStatus: 'UNRESOLVED',
  automaticNormalOccurrenceImplemented: true,
  automaticWantedEntryImplemented: false,
  note: 'Liquid chance-eye occurrence is sampled as its own display channel. It is not subtracted from or coupled to the unresolved physical/base-role residual.'
});
