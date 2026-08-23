import { GT_SYSTEM_SPEC } from './gt-system-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

const STAGES = GT_SYSTEM_SPEC.stageScenario.internalStages;
const SCENARIO_RATES = GT_SYSTEM_SPEC.stageScenario.selectionBySetting;
const INITIAL_RATES = GT_SYSTEM_SPEC.stageScenario.initialStageByScenario;
const UPGRADE_RATES = GT_SYSTEM_SPEC.stageScenario.upgradeStepByScenario;

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

function pickWeighted(randomSource, entries) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat() * 100;
  let cursor = 0;
  for (const [value, weight] of entries) {
    cursor += Number(weight);
    if (draw < cursor) return Object.freeze({ value, draw });
  }
  return Object.freeze({ value: entries.at(-1)?.[0] ?? null, draw });
}

export function resolveGoldenTimeScenario(randomSource, setting = 1) {
  const table = SCENARIO_RATES[setting];
  if (!table) throw new RangeError('Unsupported setting');
  const selected = pickWeighted(randomSource, Object.entries(table));
  return Object.freeze({ scenario: selected.value, draw: selected.draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function resolveGoldenTimeInitialStage(randomSource, scenario) {
  const weights = INITIAL_RATES[scenario];
  if (!weights) throw new RangeError('Unsupported scenario');
  const selected = pickWeighted(randomSource, STAGES.map((stage, index) => [stage, weights[index]]));
  return Object.freeze({ stage: selected.value, stageIndex: STAGES.indexOf(selected.value), draw: selected.draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function resolveGoldenTimeStageUpgrade(randomSource, scenario, currentStageIndex) {
  const table = UPGRADE_RATES[scenario];
  if (!table) throw new RangeError('Unsupported scenario');
  if (!Number.isInteger(currentStageIndex) || currentStageIndex < 0 || currentStageIndex >= STAGES.length) throw new RangeError('Unsupported stage index');
  const selected = pickWeighted(randomSource, [['ONE_STEP', table.oneStep], ['TWO_STEPS', table.twoSteps]]);
  const steps = selected.value === 'TWO_STEPS' ? 2 : 1;
  const nextStageIndex = Math.min(STAGES.length - 1, currentStageIndex + steps);
  return Object.freeze({ fromStageIndex: currentStageIndex, toStageIndex: nextStageIndex, stage: STAGES[nextStageIndex], steps, draw: selected.draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function getGoldenTimeTreasureDenominatorForStage(stage) {
  const key = String(stage ?? '').split('_')[0];
  if (key === 'JAPAN') return GT_SYSTEM_SPEC.stages.japan.treasureHitDenominator;
  if (key === 'SWITZERLAND') return GT_SYSTEM_SPEC.stages.switzerland.treasureHitDenominator;
  if (key === 'CARIBBEAN') return GT_SYSTEM_SPEC.stages.caribbean.treasureHitDenominator;
  if (key === 'UNDERGROUND') return GT_SYSTEM_SPEC.stages.undergroundCity.treasureHitDenominator;
  return null;
}

export const GOLDEN_TIME_STAGE_POLICY = Object.freeze({
  scenarioSelection: 'PUBLISHED_ANALYSIS',
  initialStageSelection: 'PUBLISHED_ANALYSIS',
  upgradeEveryGames: GT_SYSTEM_SPEC.stageScenario.upgradeEveryGames,
  upgradeStepSelection: 'PUBLISHED_ANALYSIS',
  visibleStageLagImplemented: false,
  noSyntheticStageRates: true
});
