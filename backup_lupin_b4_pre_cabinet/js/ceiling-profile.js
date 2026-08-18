// Verified game-count ceiling profile for LUPIN B4.
// Multiple published analysis sources match the setting-specific 499G / 999G split.
// Plain NORMAL ceiling arrival awards LUPIN BONUS. Special-context benefits are handled separately.
export const CEILING_PROFILE = Object.freeze({
  1:Object.freeze({499:0.8,999:99.2}),
  2:Object.freeze({499:1.6,999:98.4}),
  3:Object.freeze({499:3.1,999:96.9}),
  4:Object.freeze({499:4.7,999:95.3}),
  5:Object.freeze({499:9.4,999:90.6}),
  6:Object.freeze({499:12.5,999:87.5}),
  source:'CROSS_SOURCE_CONFIRMED_499_999_SETTING_TABLE',
  plainNormalBenefit:'LUPIN_BONUS',
  specialContextPolicy:'PENDING_CONTEXT_SPECIFIC_BENEFIT'
});

export function drawCeilingGame(setting,rng){
  const row=CEILING_PROFILE[Number(setting)];
  if(!row||!rng?.next)return null;
  return rng.next()<row[499]/100?499:999;
}
