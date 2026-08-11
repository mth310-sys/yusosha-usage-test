import { GameCore } from './game-core.js?v=step3e';
import { GameLogger } from './logger.js?v=step3e';
import { renderState, startReelAnimation, stopReelAnimation } from './ui.js?v=step3e';
import { runFastSimulation, formatSimulationReport } from './simulator.js?v=step3e';

const core = new GameCore({ setting:1 });
const logger = new GameLogger();

const betButton = document.getElementById('betButton');
const leverButton = document.getElementById('leverButton');
const stopButtons = [...document.querySelectorAll('[data-stop]')];
const settingSelect = document.getElementById('settingSelect');
const wantedSeek = document.getElementById('wantedSeek');
const simButton = document.getElementById('simButton');
const simLog = document.getElementById('simLog');

betButton.addEventListener('click', () => {
  core.bet();
  renderState(core, logger);
});

leverButton.addEventListener('click', () => {
  const started = core.lever();
  if (started) startReelAnimation();
  renderState(core, logger);
});

stopButtons.forEach(button => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.stop);
    const outcome = core.stopReel(index);
    if (!outcome) return;
    stopReelAnimation(index, outcome.symbol);
    if (outcome.complete) logger.push(outcome.result);
    renderState(core, logger);
  });
});

settingSelect.addEventListener('change', () => {
  core.setSetting(settingSelect.value);
  renderState(core, logger);
});

wantedSeek.addEventListener('click', () => {
  core.seekWantedForTest();
  renderState(core, logger);
});

simButton.addEventListener('click', () => {
  simButton.disabled = true;
  simLog.textContent = 'RUNNING...';
  requestAnimationFrame(() => {
    const report = runFastSimulation({
      setting:Number(settingSelect.value),
      games:100000,
      seed:0x13572468
    });
    simLog.textContent = formatSimulationReport(report);
    simButton.disabled = false;
  });
});

renderState(core, logger);
