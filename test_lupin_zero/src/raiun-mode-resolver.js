import { ReuseEvidenceStatus } from './reuse-registry.js';
import { RAIUN_MODE_SPEC } from './raiun-mode-spec.js';

const GAMES = RAIUN_MODE_SPEC.raiunMode.games;
const TOTAL_ART_RATE = RAIUN_MODE_SPEC.raiunMode.artExpectationPercent / 100;
const ART_HIT_PROBABILITY_PER_GAME = 1 - Math.pow(1 - TOTAL_ART_RATE, 1 / GAMES);
const ART_HIT_DENOMINATOR_PER_GAME = 1 / ART_HIT_PROBABILITY_PER_GAME;
const BET_COINS = 3;
const PAYOUT_COINS = BET_COINS + RAIUN_MODE_SPEC.raiunMode.netIncreasePerGame;

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveRaiunModeGame(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const artHit = draw < ART_HIT_PROBABILITY_PER_GAME;
  return Object.freeze({
    artHit,
    draw,
    payoutCoins: PAYOUT_COINS,
    betCoins: BET_COINS,
    netCoins: PAYOUT_COINS - BET_COINS,
    successPresentation: artHit ? RAIUN_MODE_SPEC.raiunMode.artSuccessPresentation : null,
    destination: artHit ? 'GOLDEN_TIME' : null,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    destinationEvidenceStatus: artHit ? 'MULTI_SOURCE_MATCH' : null,
    inference: 'Published Raiun Mode is 20G with ~23% ART expectation and ~+2.0 coins/G. Production uses a constant per-game ART hazard calibrated so 20 independent games equal exactly 23%, and a 5-coin settlement against the existing 3-coin bet so net gain is exactly +2 coins/G.',
    replaceable: true
  });
}

export const RAIUN_MODE_PRODUCTION_POLICY = Object.freeze({
  games: GAMES,
  publishedArtExpectationPercent: RAIUN_MODE_SPEC.raiunMode.artExpectationPercent,
  inferredArtHitProbabilityPerGame: ART_HIT_PROBABILITY_PER_GAME,
  inferredArtHitDenominatorPerGame: ART_HIT_DENOMINATOR_PER_GAME,
  publishedNetIncreaseCoinsPerGame: RAIUN_MODE_SPEC.raiunMode.netIncreasePerGame,
  productionBetCoinsPerGame: BET_COINS,
  productionPayoutCoinsPerGame: PAYOUT_COINS,
  artSuccessPresentation: RAIUN_MODE_SPEC.raiunMode.artSuccessPresentation,
  artDestination: 'GOLDEN_TIME',
  evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  exactPerRoleArtLotteryKnown: false,
  exactCoinAwardDistributionKnown: false,
  mayPromoteToVerifiedAutomatically: false,
  replaceable: true
});
