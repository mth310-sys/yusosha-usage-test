import { GameMode } from './game-flow-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

export const CHANCE_ZONE_DETAIL_SPEC = Object.freeze({
  stages: Object.freeze(['A', 'B', 'C', 'D']),
  stageSelectionBySetting: Object.freeze({
    1: Object.freeze([71.88, 23.44, 3.13, 1.56]),
    2: Object.freeze([79.69, 15.63, 3.13, 1.56]),
    3: Object.freeze([69.92, 25.39, 3.13, 1.56]),
    4: Object.freeze([64.45, 29.30, 3.13, 3.13]),
    5: Object.freeze([53.52, 37.11, 6.25, 3.13]),
    6: Object.freeze([51.56, 39.06, 6.25, 3.13])
  }),
  successExpectationBySetting: Object.freeze({
    [GameMode.ODOROBO_ZONE]: Object.freeze({ 1:39.9, 2:39.6, 3:40.2, 4:42.6, 5:42.5, 6:43.2 }),
    [GameMode.FUJIKO_ZONE]: Object.freeze({ 1:58.8, 2:58.9, 3:59.2, 4:62.7, 5:62.1, 6:63.2 })
  }),
  successPresentation: 'ODD_LCD_SYMBOL_ALIGNED',
  destination: 'LUPIN_BONUS_OR_GOLDEN_TIME',
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  stageSpecificSuccessRatesKnown: false,
  perGameSuccessLotteryKnown: false
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

function validateSetting(setting) {
  if (!Number.isInteger(setting) || setting < 1 || setting > 6) throw new RangeError('setting must be 1..6');
}

function pickWeighted(randomSource, values, weights) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat() * 100;
  let cursor = 0;
  for (let i = 0; i < values.length; i += 1) {
    cursor += weights[i];
    if (draw < cursor) return Object.freeze({ value: values[i], draw });
  }
  return Object.freeze({ value: values.at(-1), draw });
}

export function resolveChanceZoneStage(randomSource, setting = 1) {
  validateSetting(setting);
  const selected = pickWeighted(randomSource, CHANCE_ZONE_DETAIL_SPEC.stages, CHANCE_ZONE_DETAIL_SPEC.stageSelectionBySetting[setting]);
  return Object.freeze({
    stage: selected.value,
    draw: selected.draw,
    setting,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    affectsOutcome: false
  });
}

export function getChanceZoneSuccessExpectation(mode, setting = 1) {
  validateSetting(setting);
  return CHANCE_ZONE_DETAIL_SPEC.successExpectationBySetting[mode]?.[setting] ?? null;
}

export function resolveChanceZoneOutcome(randomSource, mode, setting = 1) {
  requireRandomSource(randomSource);
  const expectationPercent = getChanceZoneSuccessExpectation(mode, setting);
  if (expectationPercent == null) throw new RangeError('Unsupported chance-zone mode');
  const draw = randomSource.nextFloat();
  return Object.freeze({
    hit: draw < expectationPercent / 100,
    draw,
    mode,
    setting,
    expectationPercent,
    successPresentation: CHANCE_ZONE_DETAIL_SPEC.successPresentation,
    destination: CHANCE_ZONE_DETAIL_SPEC.destination,
    evidenceStatus: 'CALIBRATED_TO_PUBLISHED_TOTAL_CZ_EXPECTATION',
    exactPerGameLotteryStatus: 'UNRESOLVED',
    exactStageSpecificSuccessRateStatus: 'UNRESOLVED'
  });
}

export const CHANCE_ZONE_DETAIL_POLICY = Object.freeze({
  publishedStageSelectionUsedDirectly: true,
  publishedTotalExpectationUsedForSingleHiddenOutcome: true,
  inventPerGameHitRates: false,
  inventStageSpecificHitRates: false,
  revealAtWindowEnd: 'PRODUCTION_PRESENTATION_MODEL',
  replaceableWhenExactLotteryIsRecovered: true
});
