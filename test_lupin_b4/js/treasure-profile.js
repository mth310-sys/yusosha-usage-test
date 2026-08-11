// Step 6F: verified Treasure -> continuation expectation table.
// Values are published analysis table points. No interpolation is used.
export const TREASURE_PROFILE = Object.freeze({
  maxPoints:1000000,
  guaranteedAt:1000000,
  continuationPct:Object.freeze({
    100000:69.7,150000:70.5,200000:71.3,250000:72.0,300000:72.8,
    350000:73.6,400000:74.4,450000:75.6,500000:76.3,550000:77.5,
    600000:78.7,650000:79.8,700000:81.0,750000:82.2,800000:85.9,
    850000:89.7,900000:93.4,950000:97.2,1000000:100.0
  }),
  source:'VERIFIED_TREASURE_CONTINUATION_TABLE',
  interpolation:'DISABLED'
});

export function getTreasureContinuationPct(points){
  return TREASURE_PROFILE.continuationPct[Number(points)] ?? null;
}

export function rollTreasureContinuation(points,rng){
  const pct=getTreasureContinuationPct(points);
  if(pct==null)return null;
  if(pct>=100)return true;
  return rng.next() < pct/100;
}
