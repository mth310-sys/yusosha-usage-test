// Step 5F: verified Raiun aggregate values + isolated calibrated ART model + verified Shin Raiun LEGEND GATE rate.
// Normal Raiun: published 20G / about 23% ART expectation, per-game rate remains derived/calibrated.
// Shin Raiun: published LEGEND GATE occurrence is 1/88.9; its ordinary per-game ART rate remains unverified.

export const RAIUN_PROFILE = Object.freeze({
  counter:{
    targetPoints:100,
    averageInitialPoints:22.6,
    pointAddRateRange:'1/7.0-1/7.1',
    averagePointsOnAdd:3.3,
    averageGamesTo100Published:'source-dependent; detailed model separated',
    detailedInitialDistribution:'UNVERIFIED',
    detailedAddDistribution:'UNVERIFIED'
  },
  high:{
    totalGames:7,
    LOW:{denominator:30.5, expectation:20.0},
    HIGH:{denominator:13.3, expectation:40.0},
    levelDistribution:'UNVERIFIED'
  },
  mode:{
    normalGames:20,
    artExpectation:23.0,
    artModelSource:'CALIBRATED_FROM_20G_CUMULATIVE_EXPECTATION',
    calibratedPerGameProbability:1-Math.pow(1-0.23,1/20),
    calibratedPerGameDenominator:1/(1-Math.pow(1-0.23,1/20)),
    shinUpgradeRate:0.8,
    shinContinuesUntilArt:true,
    shinPerGameArtRate:'UNVERIFIED',
    shinLegendGateDenominator:88.9,
    shinLegendGateSource:'VERIFIED_PUBLISHED_RATE'
  }
});

export function getRaiunHighProfile(level='LOW') {
  return RAIUN_PROFILE.high[level] ?? RAIUN_PROFILE.high.LOW;
}

export function rollRaiunHighEntry(level, rng) {
  const row = getRaiunHighProfile(level);
  return rng.next() < 1 / row.denominator;
}

export function rollShinRaiunUpgrade(rng) {
  return rng.next() < RAIUN_PROFILE.mode.shinUpgradeRate / 100;
}

export function rollRaiunArtCalibrated(rng) {
  return rng.next() < RAIUN_PROFILE.mode.calibratedPerGameProbability;
}

export function rollShinRaiunLegendGate(rng) {
  return rng.next() < 1 / RAIUN_PROFILE.mode.shinLegendGateDenominator;
}
