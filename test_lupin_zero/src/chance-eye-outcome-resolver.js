import { VERIFIED_SPEC } from './verified-spec.js';

export const CHANCE_EYE_CONTEXT = Object.freeze({
  NORMAL: 'normal',
  WANTED_CHANCE: 'wantedChance'
});

export const CHANCE_EYE_DESTINATION = Object.freeze({
  MISS: 'MISS',
  BONUS_OR_ART_UNRESOLVED: 'BONUS_OR_ART_UNRESOLVED',
  FUJIKO_ZONE: 'FUJIKO_ZONE',
  ODOROBO_ZONE: 'ODOROBO_ZONE'
});

const DESTINATION_KEYS = Object.freeze([
  ['bonusOrArt', CHANCE_EYE_DESTINATION.BONUS_OR_ART_UNRESOLVED],
  ['fujikoZone', CHANCE_EYE_DESTINATION.FUJIKO_ZONE],
  ['odoroboZone', CHANCE_EYE_DESTINATION.ODOROBO_ZONE]
]);

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

function getProfile(kind, context) {
  const profile = VERIFIED_SPEC.liquidReel.outcomeLottery?.[context]?.[kind];
  if (!profile) throw new Error(`Unknown chance-eye profile: ${context}/${kind}`);
  return profile;
}

export function resolveChanceEyeOutcome(randomSource, kind, context = CHANCE_EYE_CONTEXT.NORMAL) {
  requireRandomSource(randomSource);
  const profile = getProfile(kind, context);
  const hitDraw = randomSource.nextFloat();
  const hit = hitDraw < profile.totalHitPercent / 100;

  if (!hit) {
    return Object.freeze({
      kind,
      context,
      hit: false,
      destination: CHANCE_EYE_DESTINATION.MISS,
      hitDraw,
      destinationDraw: null,
      totalHitPercent: profile.totalHitPercent,
      evidenceStatus: VERIFIED_SPEC.evidence.liquidReelOutcomeLottery
    });
  }

  const destinationDraw = randomSource.nextFloat();
  const weights = DESTINATION_KEYS.map(([key, destination]) => ({
    destination,
    weight: profile.onHit[key]
  }));
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  let cursor = 0;
  let destination = weights.at(-1).destination;

  for (const item of weights) {
    cursor += item.weight / totalWeight;
    if (destinationDraw < cursor) {
      destination = item.destination;
      break;
    }
  }

  return Object.freeze({
    kind,
    context,
    hit: true,
    destination,
    hitDraw,
    destinationDraw,
    totalHitPercent: profile.totalHitPercent,
    publishedOnHitPercent: Object.freeze({ ...profile.onHit }),
    normalizedOnlyForRounding: true,
    evidenceStatus: VERIFIED_SPEC.evidence.liquidReelOutcomeLottery,
    bonusVsArtSplitStatus: destination === CHANCE_EYE_DESTINATION.BONUS_OR_ART_UNRESOLVED
      ? 'UNRESOLVED'
      : null
  });
}

export const CHANCE_EYE_OUTCOME_POLICY = Object.freeze({
  publishedHitRatesUsedDirectly: true,
  publishedOnHitWeightsUsedDirectly: true,
  roundingNormalizationAllowed: true,
  bonusVsArtSplitImplemented: false,
  note: 'Published on-hit percentages are normalized only to absorb source-table rounding. BONUS vs ART is not invented.'
});
