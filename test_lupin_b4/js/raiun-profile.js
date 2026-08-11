// Step 5A: verified Raiun counter/high-probability/mode values.
// Published analysis confirms these aggregate values, but not the detailed point distributions
// or the per-game 7-alignment rate inside the 20G Raiun Mode.

export const RAIUN_PROFILE = Object.freeze({
  counter:{
    targetPoints:100,
    averageInitialPoints:22.6,
    pointAddRateRange:'1/7.0-1/7.1',
    averagePointsOnAdd:3.3,
    averageGamesTo100Published:'about 190G',
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
    shinUpgradeRate:0.8,
    perGameSevenRate:'UNVERIFIED',
    shinContinuesUntilArt:true,
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
