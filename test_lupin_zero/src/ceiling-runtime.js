import { selectCeilingGame, resolveCeilingArrival } from './ceiling-resolver.js';
import { SeededRandomSource } from './random-source.js';
import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160811);
const setting = app.machineSetting ?? 1;
let ceilingSelection = selectCeilingGame(random, setting);
let gamesSinceReset = 0;
let resolving = false;

function resetCeiling(context) {
  gamesSinceReset = 0;
  ceilingSelection = selectCeilingGame(random, setting);
  core.emit('ceiling-reset', {
    context,
    selectedGame: ceilingSelection?.selectedGame ?? null,
    evidenceStatus: ceilingSelection?.evidenceStatus ?? 'UNRESOLVED'
  });
}

function isCounterGame(mode) {
  return ![
    GameMode.LUPIN_BONUS,
    GameMode.GOLDEN_TIME,
    GameMode.EXTRA_BONUS,
    GameMode.GOLD_RUSH
  ].includes(mode);
}

function handleCeilingArrival(arrival) {
  if (!arrival?.reached || resolving) return false;
  resolving = true;
  core.emit('ceiling-reached', { ...arrival });

  if (arrival.route === 'SHIN_RAIUN_MODE') {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      mode: 'SHIN_RAIUN_MODE',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_GOLDEN_TIME',
      modeResultEvidenceStatus: arrival.evidenceStatus
    });
    core.emit('shin-raiun-mode-enter', {
      source: 'CEILING_DURING_RAIUN_MODE',
      goldenTimeGuaranteed: true,
      evidenceStatus: arrival.evidenceStatus
    });
    if (typeof app.enterGoldenTime === 'function') app.enterGoldenTime();
    resolving = false;
    return true;
  }

  const entered = typeof app.enterLupinBonus === 'function'
    ? app.enterLupinBonus('CEILING')
    : false;
  resolving = false;
  return entered;
}

core.addEventListener('spin-end', (event) => {
  const mode = event.detail.snapshot.mode;
  if (!isCounterGame(mode) || !ceilingSelection) return;
  gamesSinceReset += 1;
  const arrival = resolveCeilingArrival({
    gamesSinceReset,
    selectedGame: ceilingSelection.selectedGame,
    currentMode: mode
  });
  core.emit('ceiling-progress', {
    gamesSinceReset,
    selectedGame: ceilingSelection.selectedGame,
    remaining: Math.max(0, ceilingSelection.selectedGame - gamesSinceReset)
  });
  if (arrival.reached) handleCeilingArrival(arrival);
});

core.addEventListener('lupin-bonus-failed', () => resetCeiling('LUPIN_BONUS_END'));
core.addEventListener('lupin-bonus-success', () => resetCeiling('LUPIN_BONUS_END'));
core.addEventListener('golden-time-ended', () => resetCeiling('GOLDEN_TIME_END'));

app.ceilingRandom = random;
app.getCeilingState = () => Object.freeze({
  gamesSinceReset,
  selectedGame: ceilingSelection?.selectedGame ?? null,
  setting
});
app.resetCeiling = resetCeiling;
