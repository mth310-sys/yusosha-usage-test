import { GT_SYSTEM_SPEC } from './gt-system-spec.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

const BASE_STAGES = GT_SYSTEM_SPEC.stageScenario.internalStages;
const PROGRESSION_STAGES = Object.freeze([...BASE_STAGES, 'IKUKAN']);
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
  const selected = pickWeighted(randomSource, BASE_STAGES.map((stage, index) => [stage, weights[index]]));
  return Object.freeze({ stage: selected.value, stageIndex: PROGRESSION_STAGES.indexOf(selected.value), draw: selected.draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function resolveGoldenTimeStageUpgrade(randomSource, scenario, currentStageIndex) {
  const table = UPGRADE_RATES[scenario];
  if (!table) throw new RangeError('Unsupported scenario');
  if (!Number.isInteger(currentStageIndex) || currentStageIndex < 0 || currentStageIndex >= PROGRESSION_STAGES.length) throw new RangeError('Unsupported stage index');
  if (currentStageIndex === PROGRESSION_STAGES.length - 1) {
    return Object.freeze({ fromStageIndex: currentStageIndex, toStageIndex: currentStageIndex, stage: 'IKUKAN', steps: 0, draw: null, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
  }
  const selected = pickWeighted(randomSource, [['ONE_STEP', table.oneStep], ['TWO_STEPS', table.twoSteps]]);
  const steps = selected.value === 'TWO_STEPS' ? 2 : 1;
  const nextStageIndex = Math.min(PROGRESSION_STAGES.length - 1, currentStageIndex + steps);
  return Object.freeze({ fromStageIndex: currentStageIndex, toStageIndex: nextStageIndex, stage: PROGRESSION_STAGES[nextStageIndex], steps, draw: selected.draw, evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS });
}

export function getGoldenTimeTreasureDenominatorForStage(stage) {
  const value = String(stage ?? '');
  const key = value.split('_')[0];
  if (value === 'IKUKAN') return 1.0;
  if (key === 'JAPAN') return GT_SYSTEM_SPEC.stages.japan.treasureHitDenominator;
  if (key === 'SWITZERLAND') return GT_SYSTEM_SPEC.stages.switzerland.treasureHitDenominator;
  if (key === 'CARIBBEAN') return GT_SYSTEM_SPEC.stages.caribbean.treasureHitDenominator;
  if (key === 'UNDERGROUND') return GT_SYSTEM_SPEC.stages.undergroundCity.treasureHitDenominator;
  return null;
}

export function isIkukanStage(stage) {
  return stage === 'IKUKAN';
}

export const GOLDEN_TIME_STAGE_POLICY = Object.freeze({
  scenarioSelection: 'PUBLISHED_ANALYSIS',
  initialStageSelection: 'PUBLISHED_ANALYSIS',
  upgradeEveryGames: GT_SYSTEM_SPEC.stageScenario.upgradeEveryGames,
  upgradeStepSelection: 'PUBLISHED_ANALYSIS',
  ikukanProgressionRankImplemented: true,
  ikukanEarliestNaturalEntryGame: 30,
  ikukanGamesWithinFortyGameSet: 10,
  visibleStageLagImplemented: false,
  noSyntheticStageRates: true
});
