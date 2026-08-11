// Step 6Z correction: verified return lottery after ART loss, based on final treasure amount.
// Cross-check: published analysis identifies this as a LUPIN BONUS return lottery,
// commonly notified through Revenge Chance, not a direct GOLDEN TIME restart.
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
  source: 'VERIFIED_PUBLISHED_LUPIN_BONUS_RETURN_BY_TREASURE_TABLE',
  timing: 'AFTER_TREASURE_BATTLE_LOSS_BEFORE_RETURN_NOTIFICATION',
  unsupportedPolicy: 'NO_INTERPOLATION_FOR_UNLISTED_TREASURE_VALUE'
});

export function getArtReturnPct(treasurePoints) {
  const key = Number(treasurePoints);
  const value = ART_RETURN_PROFILE.rates[key];
  return Number.isFinite(value) ? value : null;
}

export function rollArtReturn(treasurePoints, rng) {
  const pct = getArtReturnPct(treasurePoints);
  if (pct == null) return { resolved:false, hit:false, pct:null, treasurePoints:Number(treasurePoints), reward:ART_RETURN_PROFILE.reward };
  const hit = rng.next() < pct / 100;
  return { resolved:true, hit, pct, treasurePoints:Number(treasurePoints), reward:ART_RETURN_PROFILE.reward, source:ART_RETURN_PROFILE.source };
}
