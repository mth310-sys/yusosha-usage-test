// Step 5D: calibrated Raiun point accumulation model.
// Published aggregate values do not reconcile exactly if used as a naive single-stage process:
// average initial 22.6pt + ~1/7.0-1/7.1 add frequency + 3.3pt/add implies a shorter arrival time,
// while published guidance is about 190G. RAW values remain untouched.
//
// A cycle simulation that includes discrete point increments and the final 100pt boundary showed
// 1/8.10 converged around 193-194G. The isolated gameplay calibration is therefore fixed at 1/7.96,
// which converges near the published ~190G target while preserving mean initial 22.6pt and 3.3pt/add.

export const RAIUN_POINT_MODEL = Object.freeze({
  source:'CALIBRATED_FROM_PUBLISHED_AGGREGATES',
  calibrationStatus:'LOCKED_STEP5D',
  raw:{
    averageInitialPoints:22.6,
    publishedAddRateRange:'1/7.0-1/7.1',
    averagePointsPerAdd:3.3,
    publishedAverageGamesTo100:190
  },
  calibrated:{
    effectiveAddDenominator:7.96,
    initialDistribution:{22:40,23:60},
    addDistribution:{1:10,2:20,3:20,4:30,5:20},
    targetAverageGamesTo100:190,
    expectedSimulationRange:'about 189.5-190.5G / 100k cycles'
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
