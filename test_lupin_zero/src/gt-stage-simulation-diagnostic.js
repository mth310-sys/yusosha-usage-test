import { resolveGoldenTimeScenario, resolveGoldenTimeInitialStage, resolveGoldenTimeStageUpgrade } from './golden-time-stage-resolver.js';
import { SeededRandomSource } from './random-source.js';
import { getGtStageResidenceReference } from './gt-stage-residence-reference.js';

const NORMAL_VISIBLE_STAGES = Object.freeze(['JAPAN','SWITZERLAND','CARIBBEAN','UNDERGROUND_CITY']);

function visibleGroup(stage) {
  const value = String(stage ?? '');
  if (value === 'IKUKAN') return 'IKUKAN';
  if (value.startsWith('JAPAN_')) return 'JAPAN';
  if (value.startsWith('SWITZERLAND_')) return 'SWITZERLAND';
  if (value.startsWith('CARIBBEAN_')) return 'CARIBBEAN';
  if (value.startsWith('UNDERGROUND_CITY_')) return 'UNDERGROUND_CITY';
  return null;
}

export const GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY = Object.freeze({
  purpose: 'VALIDATE_PUBLISHED_A_D_SCENARIO_TABLES_AGAINST_PUBLISHED_VISIBLE_STAGE_RESIDENCE',
  defaultIterations: 20000,
  blocksPerStageResidenceWindow: 3,
  gamesPerBlock: 10,
  stageResidenceWindowGames: 30,
  stageResidenceWindowEvidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
  inferenceBasis: 'The published A-D initial-stage and 10G +1/+2 upgrade tables reproduce the independently published visible-stage residence ratios when evaluated over three 10G normal-stage blocks. Four blocks produce a large systematic mismatch.',
  publishedReferenceIsVisibleStageResidence: true,
  internalABRanksMapDirectlyToSameVisibleStage: true,
  visibleStageLagRequiredByPublishedSources: false,
  autoCalibrateInternalRatesToVisibleReference: false,
  mismatchMustNotBeCorrectedBySyntheticProbabilities: true,
  runtimeGtSetLengthChangedByThisDiagnostic: false
});

export function simulateGtStageResidence(setting = 1, iterations = GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY.defaultIterations, seed = 0x20160830) {
  if (!Number.isInteger(iterations) || iterations <= 0) throw new RangeError('iterations must be a positive integer');
  const random = new SeededRandomSource((seed + Number(setting)) >>> 0);
  const counts = { JAPAN:0, SWITZERLAND:0, CARIBBEAN:0, UNDERGROUND_CITY:0, IKUKAN:0 };
  const blocks = GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY.blocksPerStageResidenceWindow;

  for (let run = 0; run < iterations; run += 1) {
    const scenario = resolveGoldenTimeScenario(random, setting).scenario;
    const initial = resolveGoldenTimeInitialStage(random, scenario);
    let stage = initial.stage;
    let stageIndex = initial.stageIndex;

    for (let block = 0; block < blocks; block += 1) {
      const group = visibleGroup(stage);
      if (group) counts[group] += GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY.gamesPerBlock;
      if (block < blocks - 1) {
        const upgrade = resolveGoldenTimeStageUpgrade(random, scenario, stageIndex);
        stage = upgrade.stage;
        stageIndex = upgrade.toStageIndex;
      }
    }
  }

  const normalGames = NORMAL_VISIBLE_STAGES.reduce((sum, key) => sum + counts[key], 0);
  const simulatedNormalResidencePct = Object.fromEntries(NORMAL_VISIBLE_STAGES.map((key) => [key, normalGames > 0 ? counts[key] / normalGames * 100 : 0]));
  const ikukanPctOfAllGames = counts.IKUKAN / (iterations * blocks * GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY.gamesPerBlock) * 100;
  const published = getGtStageResidenceReference(setting);
  const absoluteErrorPct = Object.fromEntries(NORMAL_VISIBLE_STAGES.map((key) => [key, published ? Math.abs(simulatedNormalResidencePct[key] - published[key]) : null]));
  const maxAbsoluteErrorPct = Math.max(...Object.values(absoluteErrorPct).filter((value) => Number.isFinite(value)));

  return Object.freeze({
    setting,
    iterations,
    counts: Object.freeze({ ...counts }),
    simulatedNormalResidencePct: Object.freeze(simulatedNormalResidencePct),
    ikukanPctOfAllGames,
    publishedReference: published,
    absoluteErrorPct: Object.freeze(absoluteErrorPct),
    maxAbsoluteErrorPct,
    diagnosis: maxAbsoluteErrorPct <= 2
      ? 'PUBLISHED_TABLES_RECONCILED_OVER_30G_STAGE_WINDOW'
      : 'STAGE_WINDOW_OR_MAPPING_REQUIRES_REVIEW',
    policy: GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY
  });
}
