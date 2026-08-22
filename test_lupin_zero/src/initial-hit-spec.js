export const INITIAL_HIT_SPEC = Object.freeze({
  outcomes: Object.freeze({
    LUPIN_BONUS: 'LUPIN_BONUS',
    GOLDEN_TIME: 'GOLDEN_TIME'
  }),
  selectionBySetting: Object.freeze({
    1: Object.freeze({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 }),
    2: Object.freeze({ lupinBonusPercent: 98.4, goldenTimePercent: 1.6 }),
    3: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 }),
    4: Object.freeze({ lupinBonusPercent: 96.9, goldenTimePercent: 3.1 }),
    5: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 }),
    6: Object.freeze({ lupinBonusPercent: 95.3, goldenTimePercent: 4.7 })
  }),
  selectionTiming: Object.freeze({
    point: 'PREVIOUS_LUPIN_BONUS_OR_ART_END',
    note: 'Published analysis states the next initial-hit destination is selected when the previous LUPIN BONUS or ART ends.'
  }),
  bypasses: Object.freeze({
    artCertainTriggersIgnoreStoredSelection: true,
    examples: Object.freeze(['LONG_FREEZE'])
  }),
  nextHitArtGuarantees: Object.freeze([
    Object.freeze({
      trigger: 'SEVEN_ATTACK_FAILED',
      effect: 'NEXT_INITIAL_HIT_GOLDEN_TIME_GUARANTEED'
    }),
    Object.freeze({
      trigger: 'SEVEN_SYMBOL_REACH_DEVELOPMENT_FAILED',
      effect: 'NEXT_INITIAL_HIT_GOLDEN_TIME_GUARANTEED'
    })
  ]),
  presentationCaveat: Object.freeze({
    directArtMayPassThroughLupinBonusPreparation: true,
    note: 'Published analysis warns that direct ART can appear to pass through LUPIN BONUS preparation, so visual classification alone can be ambiguous.'
  }),
  evidence: Object.freeze({
    selectionBySetting: 'MULTI_SOURCE_MATCH',
    selectionTiming: 'PUBLISHED_ANALYSIS',
    artCertainTriggerBypass: 'PUBLISHED_ANALYSIS',
    sevenAttackFailureNextArt: 'MULTI_SOURCE_MATCH',
    sevenReachFailureNextArt: 'MULTI_SOURCE_MATCH',
    presentationCaveat: 'PUBLISHED_ANALYSIS'
  }),
  policy: Object.freeze({
    inferOtherInitialHitDestinations: false,
    inferHiddenPromotionRates: false,
    inferVisualClassificationFromPreparationFlow: false
  })
});

export function getInitialHitDistribution(setting = 1) {
  if (!Number.isInteger(setting) || setting < 1 || setting > 6) return null;
  return INITIAL_HIT_SPEC.selectionBySetting[setting] ?? null;
}

export function isNextInitialHitArtGuaranteed(trigger) {
  return INITIAL_HIT_SPEC.nextHitArtGuarantees.some((entry) => entry.trigger === trigger);
}
