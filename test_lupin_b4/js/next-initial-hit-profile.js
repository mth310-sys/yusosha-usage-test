// Step 6W: next NORMAL initial-hit type is preselected at BONUS / ART end.
// HAZUSE published setting-specific split: BONUS vs ART.
// Guaranteed ART routes (freeze, Seven Zone, etc.) bypass this reservation.
export const NEXT_INITIAL_HIT_PROFILE = Object.freeze({
  1:Object.freeze({ LUPIN_BONUS:98.4, GOLDEN_TIME:1.6 }),
  2:Object.freeze({ LUPIN_BONUS:98.4, GOLDEN_TIME:1.6 }),
  3:Object.freeze({ LUPIN_BONUS:95.3, GOLDEN_TIME:4.7 }),
  4:Object.freeze({ LUPIN_BONUS:96.9, GOLDEN_TIME:3.1 }),
  5:Object.freeze({ LUPIN_BONUS:95.3, GOLDEN_TIME:4.7 }),
  6:Object.freeze({ LUPIN_BONUS:95.3, GOLDEN_TIME:4.7 }),
  source:'VERIFIED_HAZUSE_NEXT_INITIAL_HIT_TABLE',
  selectionTiming:'BONUS_OR_ART_END',
  guaranteedArtOverride:true,
  sevenPatternFailOverride:'NEXT_INITIAL_HIT_ART_CONFIRMED'
});

export function drawNextInitialHit(setting,rng){
  const row=NEXT_INITIAL_HIT_PROFILE[Number(setting)] ?? NEXT_INITIAL_HIT_PROFILE[1];
  const artPct=row.GOLDEN_TIME;
  const type=rng.next()<artPct/100?'GOLDEN_TIME':'LUPIN_BONUS';
  return {type,setting:Number(setting),bonusPct:row.LUPIN_BONUS,artPct,source:NEXT_INITIAL_HIT_PROFILE.source};
}
