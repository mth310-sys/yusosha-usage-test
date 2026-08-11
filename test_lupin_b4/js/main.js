import { createGameCore } from './game-core.js';
import { bindUI } from './ui.js';

const core = createGameCore();
bindUI(core);
