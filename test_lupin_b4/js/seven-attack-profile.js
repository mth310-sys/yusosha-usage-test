import './art-return-patch.js?v=step6y';

// Step 6X/6Y: verified Seven Attack / 7-tempa fail override rules.
// Step 6Y also loads the verified ART-return lottery patch before main starts.
// Verified facts:
// - Seven Attack: gold 7 alignment => ART confirmed.
// - Seven Attack success expectation: 67%.
// - Seven Attack failure => next NORMAL initial hit is ART confirmed.
// - 7-symbol tempa continuous-performance failure => next NORMAL initial hit is ART confirmed.
// - Entry/occurrence rate itself is not verified, so no automatic entry lottery is defined here.

export const SEVEN_ATTACK_PROFILE = Object.freeze({
  successPct:67,
  successDestination:'GOLDEN_TIME',
  failOverride:'NEXT_INITIAL_HIT_ART_CONFIRMED',
  sevenTempaContinuousFailOverride:'NEXT_INITIAL_HIT_ART_CONFIRMED',
  entryRate:'UNVERIFIED',
  source:'VERIFIED_HAZUSE_SEVEN_ATTACK'
});

export function rollSevenAttack(rng){
  const success=rng.next()<SEVEN_ATTACK_PROFILE.successPct/100;
  return {
    success,
    result:success?'GOLD_7_ALIGNED':'FAIL',
    destination:success?'GOLDEN_TIME':null,
    nextHitOverride:success?null:'GOLDEN_TIME',
    source:SEVEN_ATTACK_PROFILE.source
  };
}
