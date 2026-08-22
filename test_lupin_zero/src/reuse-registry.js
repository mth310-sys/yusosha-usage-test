import { LUPIN_ZERO_TARGET } from './target-lock.js';

export const ReuseEvidenceStatus = Object.freeze({
  VERIFIED: 'VERIFIED',
  MULTI_SOURCE_MATCH: 'MULTI_SOURCE_MATCH',
  PUBLISHED_ANALYSIS: 'PUBLISHED_ANALYSIS',
  PUBLISHED_MACHINE_GUIDE: 'PUBLISHED_MACHINE_GUIDE',
  PROVISIONAL_HIGH_CONFIDENCE: 'PROVISIONAL_HIGH_CONFIDENCE',
  INFERRED_HIGH_CONFIDENCE: 'INFERRED_HIGH_CONFIDENCE',
  PRESENTATION_ONLY: 'PRESENTATION_ONLY',
  UNVERIFIED: 'UNVERIFIED',
  UNRESOLVED: 'UNRESOLVED',
  CONFLICT: 'CONFLICT'
});

const PRODUCTION_SAFE = new Set([
  ReuseEvidenceStatus.VERIFIED,
  ReuseEvidenceStatus.MULTI_SOURCE_MATCH,
  ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  ReuseEvidenceStatus.PUBLISHED_MACHINE_GUIDE,
  ReuseEvidenceStatus.PROVISIONAL_HIGH_CONFIDENCE,
  ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  ReuseEvidenceStatus.PRESENTATION_ONLY
]);

export function evaluateReuseCandidate(candidate = {}) {
  const {
    sourcePath = '',
    targetIdentityKey = null,
    generic = false,
    evidenceStatus = ReuseEvidenceStatus.UNRESOLVED,
    responsibility = 'UNKNOWN',
    productionBehavior = true,
    zeroYen = true,
    adaptationCost = 'LOW',
    exactPublishedValue = false,
    sourceSpecificToTarget = false,
    inferenceDocumented = false,
    confidence = null,
    derivedFromKnownEvidence = false,
    replaceable = false
  } = candidate;

  const targetPass = generic || targetIdentityKey === LUPIN_ZERO_TARGET.identityKey;
  const provisional = evidenceStatus === ReuseEvidenceStatus.PROVISIONAL_HIGH_CONFIDENCE;
  const inferred = evidenceStatus === ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE;
  const provisionalPass = !provisional || (sourceSpecificToTarget === true && exactPublishedValue === true);
  const inferredPass = !inferred || (
    sourceSpecificToTarget === true
    && inferenceDocumented === true
    && confidence === 'HIGH'
    && derivedFromKnownEvidence === true
    && replaceable === true
  );
  const evidencePass = productionBehavior
    ? PRODUCTION_SAFE.has(evidenceStatus) && provisionalPass && inferredPass
    : true;
  const responsibilityPass = responsibility !== 'MIXED_RULES_AND_RENDERING';
  const zeroYenPass = zeroYen === true;
  const qualityPass = adaptationCost !== 'HIGHER_THAN_REWRITE';

  const reusable = targetPass && evidencePass && responsibilityPass && zeroYenPass && qualityPass;

  return Object.freeze({
    sourcePath,
    reusable,
    provisional,
    inferred,
    gates: Object.freeze({
      target: targetPass,
      evidence: evidencePass,
      provisional: provisionalPass,
      inference: inferredPass,
      responsibility: responsibilityPass,
      zeroYen: zeroYenPass,
      quality: qualityPass
    }),
    mode: reusable
      ? (responsibility === 'PRESENTATION' || evidenceStatus === ReuseEvidenceStatus.PRESENTATION_ONLY
        ? 'ADAPT_PRESENTATION'
        : inferred
          ? 'ADAPT_OR_PORT_INFERRED'
          : provisional
            ? 'ADAPT_OR_PORT_PROVISIONAL'
            : 'ADAPT_OR_PORT')
      : 'REJECT_OR_RESEARCH_ONLY'
  });
}

export const HIGH_VALUE_REUSE_SOURCES = Object.freeze([
  Object.freeze({ path: 'test_lupin_b4/', focus: 'verified machine behavior and evidence boundaries' }),
  Object.freeze({ path: 'test_lupin_visual_lab/', focus: 'LED, motion, rotation, controls and logging patterns' }),
  Object.freeze({ path: 'test_lupin_body/', focus: 'cabinet/body experiments' }),
  Object.freeze({ path: 'test_phaser_minimal/', focus: 'minimal Phaser bootstrap patterns' }),
  Object.freeze({ path: 'test_phaser_showcase/', focus: 'Phaser effects/capability experiments' }),
  Object.freeze({ path: 'tests/', focus: 'Playwright regression patterns' })
]);
