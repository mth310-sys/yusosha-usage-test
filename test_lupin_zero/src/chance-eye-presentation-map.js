import { VERIFIED_SPEC } from './verified-spec.js';

export const CHANCE_EYE_KIND = Object.freeze({
  WEAK: 'WEAK',
  MIDDLE: 'MIDDLE',
  STRONG: 'STRONG'
});

const KEY_BY_KIND = Object.freeze({
  WEAK: 'weak',
  MIDDLE: 'middle',
  STRONG: 'strong'
});

const CUE_BY_KIND = Object.freeze({
  WEAK: 'CHANCE_EYE_BLUE',
  MIDDLE: 'CHANCE_EYE_RED',
  STRONG: 'CHANCE_EYE_GOLD'
});

export function getChanceEyePresentation(kind, mode = 'normal') {
  const key = KEY_BY_KIND[kind];
  if (!key) throw new Error(`Unknown chance-eye kind: ${kind}`);
  if (!['normal', 'wantedChance'].includes(mode)) throw new Error(`Unknown chance-eye mode: ${mode}`);

  const spec = VERIFIED_SPEC.liquidReel.chanceEyes[key];
  const denominator = mode === 'normal' ? spec.normalDenominator : spec.wantedChanceDenominator;

  return Object.freeze({
    kind,
    label: spec.label,
    visualRule: spec.visualRule,
    denominator,
    mode,
    presentationCue: CUE_BY_KIND[kind],
    evidenceStatus: VERIFIED_SPEC.evidence.liquidReelChanceEyeRules,
    rateEvidenceStatus: VERIFIED_SPEC.evidence.liquidReelChanceEyeRates,
    exactArtworkVerified: false,
    automaticPhysicalLedCueVerified: false,
    automaticMechanismCueVerified: false
  });
}

export const CHANCE_EYE_PRESENTATION_POLICY = Object.freeze({
  exactArtworkImplemented: false,
  lcdSemanticCueImplemented: true,
  automaticPhysicalLedCueImplemented: false,
  automaticMechanismCueImplemented: false,
  note: 'The liquid-reel color/7 semantics and published rates are used. Unverified cabinet LED/mechanism reactions are not inferred.'
});
