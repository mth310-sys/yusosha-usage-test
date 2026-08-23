import { ReuseEvidenceStatus } from './reuse-registry.js';

export const GT_STAGE_RESIDENCE_REFERENCE = Object.freeze({
  sourceContext: 'PUBLISHED_ART_STAGE_RESIDENCE_RATIO',
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  bySetting: Object.freeze({
    1: Object.freeze({ JAPAN: 38.9, SWITZERLAND: 40.1, CARIBBEAN: 14.8, UNDERGROUND_CITY: 6.1 }),
    2: Object.freeze({ JAPAN: 39.6, SWITZERLAND: 40.0, CARIBBEAN: 14.3, UNDERGROUND_CITY: 6.0 }),
    3: Object.freeze({ JAPAN: 38.7, SWITZERLAND: 40.2, CARIBBEAN: 15.0, UNDERGROUND_CITY: 6.2 }),
    4: Object.freeze({ JAPAN: 37.8, SWITZERLAND: 39.9, CARIBBEAN: 15.6, UNDERGROUND_CITY: 6.7 }),
    5: Object.freeze({ JAPAN: 34.4, SWITZERLAND: 39.9, CARIBBEAN: 16.7, UNDERGROUND_CITY: 7.1 }),
    6: Object.freeze({ JAPAN: 36.1, SWITZERLAND: 39.9, CARIBBEAN: 16.8, UNDERGROUND_CITY: 7.1 })
  }),
  purpose: 'VALIDATION_REFERENCE_ONLY',
  affectsRuntimeSelection: false,
  note: 'Published residence ratios are retained as an external validation target for the already implemented A-D scenario model. They are not used as a second-stage weighted lottery.'
});

export function getGtStageResidenceReference(setting = 1) {
  return GT_STAGE_RESIDENCE_REFERENCE.bySetting[setting] ?? null;
}
