// Step 6Z: Treasure-loss LUPIN BONUS return lottery after ART end.
// HAZUSE and 1geki agree on the 15/25/35/.../95万 ladder, but differ at the
// lowest row and on whether intermediate even 10万 steps share the preceding rate.
// Legacy filename/export names are kept to avoid broad refactoring.
export const ART_RETURN_PROFILE = Object.freeze({
  reward: 'LUPIN_BONUS_RETURN',
  notification: 'REVENGE_CHANCE_LIKELY_OR_NORMAL_STAGE',
  rates: Object.freeze({
    100000: 2.3,
    150000: 0.8,
    200000: 0.8,
    250000: 1.2,
    300000: 1.2,
    350000: 1.6,
    400000: 1.6,
    450000: 2.0,
    500000: 2.0,
    550000: 2.3,
    600000: 2.3,
    650000: 4.7,
    700000: 4.7,
    750000: 12.5,
    800000: 12.5,
    850000: 25.0,
    900000: 25.0,
    950000: 50.0
  }),
  crossSourceConfirmed: Object.freeze({
    150000:0.8,
    250000:1.2,
    350000:1.6,
    450000:2.0,
    550000:2.3,
    650000:4.7,
    750000:12.5,
    850000:25.0,
    950000:50.0
  }),
  sourceNotes: Object.freeze({
    HAZUSE: '10万=2.3%; 15/20万=0.8%; then paired 5万 steps through 95万',
    ICHIGEKI: '5万=2.3%; then 15/25/35/.../95万 rows; average return 5.6%',
    conflictPolicy: 'DO_NOT_INFER_5_OR_EVEN_STEP_ROWS_ACROSS_SOURCES'
  }),
  source: 'HAZUSE_EXACT_TABLE_WITH_1GEKI_CROSS_CHECK_METADATA',
  timing: 'AFTER_TREASURE_BATTLE_LOSS_BEFORE_RETURN_NOTIFICATION',
  unsupportedPolicy: 'NO_INTERPOLATION_FOR_UNLISTED_TREASURE_VALUE'
});

export function getArtReturnPct(treasurePoints) {
  const key = Number(treasurePoints);
  const value = ART_RETURN_PROFILE.rates[key];
  return Number.isFinite(value) ? value : null;
}

export function getArtReturnConfidence(treasurePoints) {
  const key = Number(treasurePoints);
  if (Number.isFinite(ART_RETURN_PROFILE.crossSourceConfirmed[key])) return 'CROSS_SOURCE_CONFIRMED';
  if (Number.isFinite(ART_RETURN_PROFILE.rates[key])) return 'HAZUSE_ONLY_ROW';
  return 'UNRESOLVED';
}

export function rollArtReturn(treasurePoints, rng) {
  const pct = getArtReturnPct(treasurePoints);
  const confidence = getArtReturnConfidence(treasurePoints);
  if (pct == null) return { resolved:false, hit:false, pct:null, treasurePoints:Number(treasurePoints), reward:ART_RETURN_PROFILE.reward, confidence };
  const hit = rng.next() < pct / 100;
  return { resolved:true, hit, pct, treasurePoints:Number(treasurePoints), reward:ART_RETURN_PROFILE.reward, confidence, source:ART_RETURN_PROFILE.source };
}
