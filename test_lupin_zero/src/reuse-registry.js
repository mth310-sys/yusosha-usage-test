import { LUPIN_ZERO_TARGET } from './target-lock.js';

export const ReuseEvidenceStatus = Object.freeze({
  VERIFIED: 'VERIFIED',
  MULTI_SOURCE_MATCH: 'MULTI_SOURCE_MATCH',
  PUBLISHED_ANALYSIS: 'PUBLISHED_ANALYSIS',
  PRESENTATION_ONLY: 'PRESENTATION_ONLY',
  UNVERIFIED: 'UNVERIFIED',
  UNRESOLVED: 'UNRESOLVED',
  CONFLICT: 'CONFLICT'
});

const PRODUCTION_SAFE = new Set([
  ReuseEvidenceStatus.VERIFIED,
  ReuseEvidenceStatus.MULTI_SOURCE_MATCH,
  ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
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
    adaptationCost = 'LOW'
  } = candidate;

  const targetPass = generic || targetIdentityKey === LUPIN_ZERO_TARGET.identityKey;
  const evidencePass = productionBehavior ? PRODUCTION_SAFE.has(evidenceStatus) : true;
  const responsibilityPass = responsibility !== 'MIXED_RULES_AND_RENDERING';
  const zeroYenPass = zeroYen === true;
  const qualityPass = adaptationCost !== 'HIGHER_THAN_REWRITE';

  const reusable = targetPass && evidencePass && responsibilityPass && zeroYenPass && qualityPass;

  return Object.freeze({
    sourcePath,
    reusable,
    gates: Object.freeze({
      target: targetPass,
      evidence: evidencePass,
      responsibility: responsibilityPass,
      zeroYen: zeroYenPass,
      quality: qualityPass
    }),
    mode: reusable
      ? (responsibility === 'PRESENTATION' || evidenceStatus === ReuseEvidenceStatus.PRESENTATION_ONLY ? 'ADAPT_PRESENTATION' : 'ADAPT_OR_PORT')
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
