// Step 5E: verified Raiun aggregate values + isolated calibrated ART model.
// Published analysis confirms 20G duration and about 23% ART expectation, but not the per-game 7-alignment rate.
// The calibrated per-game rate below is mathematically derived so 20 independent games reproduce 23% cumulative ART expectation.

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
    shinLegendGateDenominator:88.9
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
