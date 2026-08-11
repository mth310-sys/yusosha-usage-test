import { GameCore } from './game-core.js';
import { GameLogger } from './logger.js';
import { renderState } from './ui.js';
import { runFastSimulation, formatSimulationReport } from './simulator.js';

const core = new GameCore({ setting:1 });
const logger = new GameLogger();

const betButton = document.getElementById('betButton');
const leverButton = document.getElementById('leverButton');
const settingSelect = document.getElementById('settingSelect');
const simButton = document.getElementById('simButton');
const simLog = document.getElementById('simLog');

betButton.addEventListener('click', () => {
  core.bet();
  renderState(core, logger);
});

leverButton.addEventListener('click', () => {
  const result = core.lever();
  if (result) logger.push(result);
  renderState(core, logger);
});

settingSelect.addEventListener('change', () => {
  core.setSetting(settingSelect.value);
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
