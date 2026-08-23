import { getLegendGateMinimumStocks, LEGEND_GATE_SPEC } from './legend-gate-spec.js';

export const LEGEND_GATE_STORY_STEPS = Object.freeze([
  Object.freeze({ step: 1, character: '次元', medal: 'SEVEN_SAPPHIRE', label: 'セブンサファイア' }),
  Object.freeze({ step: 2, character: '五ェ門', medal: 'SEVEN_EMERALD', label: 'セブンエメラルド' }),
  Object.freeze({ step: 3, character: 'ルパン', medal: 'SEVEN_RUBY', label: 'セブンルビー' })
]);

export const LEGEND_GATE_MEDAL_MODEL = Object.freeze({
  perStorySuccessPercent: 50,
  zeroMedalFallback: 'FORCE_ONE_OF_THREE',
  evidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
  rationale: Object.freeze([
    'PUBLISHED_THREE_CONSECUTIVE_STORIES_ONE_MEDAL_PER_SUCCESS',
    'COMMUNITY_REPORTS_SUPPORT_APPROX_50_PERCENT_PER_STORY',
    'PUBLISHED_LEGEND_GATE_EXPECTATION_IS_AVERAGE_10_PLUS_GT_SETS',
    'ZERO_MEDAL_PRODUCTION_RESULT_IS_NOT_USED'
  ]),
  replaceWhenExactDistributionKnown: true
});

function nextFloat(randomSource) {
  if (typeof randomSource?.nextFloat === 'function') return randomSource.nextFloat();
  if (typeof randomSource?.next === 'function') return randomSource.next();
  throw new TypeError('randomSource.nextFloat() or next() is required');
}

export function resolveLegendGateMedals(randomSource) {
  const attempts = LEGEND_GATE_STORY_STEPS.map((story) => Object.freeze({
    ...story,
    success: nextFloat(randomSource) < (LEGEND_GATE_MEDAL_MODEL.perStorySuccessPercent / 100),
    evidenceStatus: LEGEND_GATE_MEDAL_MODEL.evidenceStatus
  }));

  let normalized = attempts;
  if (!attempts.some((attempt) => attempt.success)) {
    const forcedIndex = Math.min(2, Math.floor(nextFloat(randomSource) * 3));
    normalized = attempts.map((attempt, index) => Object.freeze({
      ...attempt,
      success: index === forcedIndex,
      zeroMedalFallbackApplied: index === forcedIndex
    }));
  }

  const medals = normalized.filter((attempt) => attempt.success);
  const medalCount = medals.length;
  const minimumStocks = getLegendGateMinimumStocks(medalCount);
  const specialMovieGames = medalCount === 3
    ? (LEGEND_GATE_SPEC.sevenMedal.specialMovieGamesOnAllThree ?? 70)
    : 0;

  return Object.freeze({
    attempts: Object.freeze(normalized),
    medals: Object.freeze(medals.map((item) => item.medal)),
    medalCount,
    minimumStocks,
    specialMovieGames,
    evidenceStatus: LEGEND_GATE_MEDAL_MODEL.evidenceStatus,
    exactDistributionKnown: false
  });
}
