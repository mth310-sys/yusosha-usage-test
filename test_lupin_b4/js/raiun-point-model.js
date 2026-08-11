// Step 5B: calibrated Raiun point accumulation model.
// Published aggregate values do not reconcile exactly if used as a naive single-stage process:
// average initial 22.6pt + ~1/7.0-1/7.1 add frequency + 3.3pt/add implies ~165G to 100pt,
// while published guidance is about 190G. Keep RAW values separate and use an effective calibrated
// event rate for gameplay so the 100pt arrival time is near the published 190G target.

export const RAIUN_POINT_MODEL = Object.freeze({
  source:'CALIBRATED_FROM_PUBLISHED_AGGREGATES',
  raw:{
    averageInitialPoints:22.6,
    publishedAddRateRange:'1/7.0-1/7.1',
    averagePointsPerAdd:3.3,
    publishedAverageGamesTo100:190
  },
  calibrated:{
    effectiveAddDenominator:8.10,
    initialDistribution:{22:40,23:60},
    addDistribution:{1:10,2:20,3:20,4:30,5:20}
  }
});

function drawWeighted(table, rng) {
  const entries = Object.entries(table);
  const total = entries.reduce((sum,[,w])=>sum+w,0);
  let value = rng.next()*total;
  for (const [key,weight] of entries) {
    value -= weight;
    if (value < 0) return Number(key);
  }
  return Number(entries[entries.length-1][0]);
}

export function drawInitialRaiunPoints(rng) {
  return drawWeighted(RAIUN_POINT_MODEL.calibrated.initialDistribution, rng);
}

export function rollRaiunPointAdd(rng) {
  return rng.next() < 1 / RAIUN_POINT_MODEL.calibrated.effectiveAddDenominator;
}

export function drawRaiunPointAdd(rng) {
  return drawWeighted(RAIUN_POINT_MODEL.calibrated.addDistribution, rng);
}
