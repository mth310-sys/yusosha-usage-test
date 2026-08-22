import { RAIUN_MODE_SPEC } from './raiun-mode-spec.js';

export const RAIUN_HIGH_RANK = Object.freeze({
  LOW: 'LOW',
  HIGH: 'HIGH'
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveRaiunHighGame(randomSource, rank = RAIUN_HIGH_RANK.LOW) {
  requireRandomSource(randomSource);
  const profile = RAIUN_MODE_SPEC.raiunHigh.states[rank];
  if (!profile) throw new Error(`Unknown Raiun high rank: ${rank}`);

  const draw = randomSource.nextFloat();
  const hit = draw < 1 / profile.raiunModeHitDenominator;
  return Object.freeze({
    rank,
    draw,
    hit,
    hitDenominator: profile.raiunModeHitDenominator,
    sevenGameExpectationPercent: profile.expectationPercent,
    successPresentation: RAIUN_MODE_SPEC.raiunHigh.successPresentation,
    evidenceStatus: RAIUN_MODE_SPEC.evidence.raiunHighExactRates
  });
}

export const RAIUN_HIGH_POLICY = Object.freeze({
  games: RAIUN_MODE_SPEC.raiunHigh.games,
  lowDenominator: RAIUN_MODE_SPEC.raiunHigh.states.LOW.raiunModeHitDenominator,
  highDenominator: RAIUN_MODE_SPEC.raiunHigh.states.HIGH.raiunModeHitDenominator,
  lowExpectationPercent: RAIUN_MODE_SPEC.raiunHigh.states.LOW.expectationPercent,
  highExpectationPercent: RAIUN_MODE_SPEC.raiunHigh.states.HIGH.expectationPercent,
  initialRank: RAIUN_HIGH_RANK.LOW,
  highRankPersistsUntilGoldenTime: true,
  failedLowToHighUpgradeImplemented: false,
  failedLowToHighUpgradeReason: 'Published sources say only that some failed Raiun-high runs upgrade the counter to red; the exact probability is unresolved.',
  exactRatesInvented: false
});
