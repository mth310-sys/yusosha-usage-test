import { GameMode } from './game-flow-spec.js';
import { SeededRandomSource } from './random-source.js';
import {
  resolveGoldenTimeScenario,
  resolveGoldenTimeInitialStage,
  resolveGoldenTimeStageUpgrade,
  getGoldenTimeTreasureDenominatorForStage,
  GOLDEN_TIME_STAGE_POLICY
} from './golden-time-stage-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160813);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
let scenario = null;
let stage = null;
let stageIndex = null;
let setNumber = null;
let gamesInSet = 0;

function stageLabel(value) {
  return String(value ?? '').replace('_A', '').replace('_B', '').replaceAll('_', ' ');
}

function configureSet(snapshot = core.snapshot()) {
  if (snapshot.mode !== GameMode.GOLDEN_TIME) return null;
  const scenarioResolution = resolveGoldenTimeScenario(random, 1);
  const stageResolution = resolveGoldenTimeInitialStage(random, scenarioResolution.scenario);
  scenario = scenarioResolution.scenario;
  stage = stageResolution.stage;
  stageIndex = stageResolution.stageIndex;
  setNumber = snapshot.goldenTimeSetNumber ?? 1;
  gamesInSet = 0;
  core.emit('golden-time-stage-configured', {
    scenario,
    stage,
    stageIndex,
    setNumber,
    denominator: getGoldenTimeTreasureDenominatorForStage(stage),
    evidenceStatus: stageResolution.evidenceStatus
  });
  return snapshotState();
}

function snapshotState() {
  return Object.freeze({
    scenario,
    stage,
    stageIndex,
    setNumber,
    gamesInSet,
    denominator: getGoldenTimeTreasureDenominatorForStage(stage)
  });
}

core.addEventListener('golden-time-game-settled', (event) => {
  const snapshot = event.detail.snapshot;
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.modeResult) return;
  if (setNumber !== (snapshot.goldenTimeSetNumber ?? 1) || stage == null) configureSet(snapshot);
  gamesInSet += 1;
  if (gamesInSet > 0 && gamesInSet % GOLDEN_TIME_STAGE_POLICY.upgradeEveryGames === 0 && stageIndex != null) {
    const upgrade = resolveGoldenTimeStageUpgrade(random, scenario, stageIndex);
    stage = upgrade.stage;
    stageIndex = upgrade.toStageIndex;
    core.emit('golden-time-stage-upgraded', {
      scenario,
      stage,
      stageIndex,
      steps: upgrade.steps,
      gamesInSet,
      denominator: getGoldenTimeTreasureDenominatorForStage(stage),
      evidenceStatus: upgrade.evidenceStatus
    });
    if (message) message.textContent = `GT STAGE — ${stageLabel(stage)}`;
  }
});

core.addEventListener('golden-time-continued', (event) => {
  configureSet(event.detail.snapshot);
});

app.getGoldenTimeStageState = snapshotState;
app.getGoldenTimeTreasureDenominator = () => getGoldenTimeTreasureDenominatorForStage(stage) ?? 10;
app.goldenTimeStagePolicy = GOLDEN_TIME_STAGE_POLICY;

const initial = core.snapshot();
if (initial.mode === GameMode.GOLDEN_TIME) configureSet(initial);
