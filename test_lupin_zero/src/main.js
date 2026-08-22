import { MachineCore, MachineState } from './machine-core.js';
import { LupinView } from './phaser-view.js';
import { ResearchReelEngine } from './research-reel-engine.js';
import { PrismMechanismController } from './mechanism-controller.js';
import { PresentationOrchestrator } from './presentation-orchestrator.js';
import { getChanceEyePresentation } from './chance-eye-presentation-map.js';
import { resolveChanceEyeOutcome, CHANCE_EYE_CONTEXT, CHANCE_EYE_DESTINATION } from './chance-eye-outcome-resolver.js';
import { resolveChanceEyeOccurrence } from './chance-eye-occurrence-resolver.js';
import { resolveChanceZoneDuration } from './chance-zone-duration-resolver.js';
import { PhysicalRoleSession } from './physical-role-session.js';
import { SeededRandomSource } from './random-source.js';

const MACHINE_SETTING = 1;
const core = new MachineCore({ credit: 50, maxBet: 3 });
const researchReels = new ResearchReelEngine();
const chanceEyeOccurrenceRandom = new SeededRandomSource(0x20160800);
const chanceEyeRandom = new SeededRandomSource(0x20160801);
const chanceZoneRandom = new SeededRandomSource(0x20160802);
const physicalRoleRandom = new SeededRandomSource(0x20160803);
const physicalRoleSession = new PhysicalRoleSession({ randomSource: physicalRoleRandom, setting: MACHINE_SETTING });
const machineRoot = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');
const mechanism = new PrismMechanismController(document.querySelector('#prismMechanism'));
let pendingChanceEyeOccurrence = null;
let pendingPhysicalRole = null;

const ui = {
  credit: document.querySelector('#creditValue'),
  bet: document.querySelector('#betValue'),
  state: document.querySelector('#stateValue'),
  message: document.querySelector('#message'),
  phaseBadge: document.querySelector('#phaseBadge'),
  betBtn: document.querySelector('#betBtn'),
  maxBetBtn: document.querySelector('#maxBetBtn'),
  startBtn: document.querySelector('#startBtn'),
  stopBtns: [...document.querySelectorAll('.stop')]
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 340,
  height: 260,
  backgroundColor: '#05070d',
  transparent: false,
  antialias: true,
  pixelArt: false,
  roundPixels: false,
  scene: [LupinView],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, powerPreference: 'high-performance' }
});

function scene() {
  return game.scene.getScene('LupinView');
}

const presentation = new PresentationOrchestrator({
  machineRoot,
  mechanism,
  lcdCue(cue, detail) {
    lcdShell.dataset.cue = String(cue).toLowerCase();
    if (String(cue).startsWith('CHANCE_EYE_')) scene().showChanceEye(cue, detail);
    if (cue === 'RESEARCH_RESET') scene().clearChanceEye();
  }
});

function render(snapshot = core.snapshot()) {
  ui.credit.textContent = snapshot.credit;
  ui.bet.textContent = snapshot.bet;
  ui.state.textContent = snapshot.mode === 'NORMAL'
    ? snapshot.state
    : snapshot.modeResult
      ? `${snapshot.mode} SUCCESS`
      : `${snapshot.mode} ${snapshot.modeGamesRemaining ?? '?'}G`;
  ui.phaseBadge.textContent = snapshot.mode === 'NORMAL' ? 'SYSTEM' : snapshot.mode;

  const busy = [MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state);
  const pendingModeResult = Boolean(snapshot.modeResult);
  ui.betBtn.disabled = busy || pendingModeResult || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.maxBetBtn.disabled = busy || pendingModeResult || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.startBtn.disabled = snapshot.state !== MachineState.READY || pendingModeResult;
  ui.stopBtns.forEach((button, i) => {
    button.disabled = !busy || snapshot.stopped[i];
  });
}

function enterChanceZone(destination) {
  if (![CHANCE_EYE_DESTINATION.FUJIKO_ZONE, CHANCE_EYE_DESTINATION.ODOROBO_ZONE].includes(destination)) return null;
  const duration = resolveChanceZoneDuration(chanceZoneRandom, MACHINE_SETTING, destination);
  const entered = core.enterMode(destination, duration.games, duration.evidenceStatus);
  return entered ? duration : null;
}

function playChanceEye(kind, mode = CHANCE_EYE_CONTEXT.NORMAL) {
  const spec = getChanceEyePresentation(kind, mode);
  const key = kind.toLowerCase() === 'weak' ? 'weak' : kind.toLowerCase() === 'middle' ? 'middle' : 'strong';
  const outcome = resolveChanceEyeOutcome(chanceEyeRandom, key, mode);
  const chanceZone = outcome.hit ? enterChanceZone(outcome.destination) : null;
  presentation.runCue(spec.presentationCue, { ...spec, outcome, chanceZone });

  if (chanceZone) {
    ui.message.textContent = outcome.destination === CHANCE_EYE_DESTINATION.FUJIKO_ZONE
      ? '不二子ゾーン'
      : '大泥棒ゾーン';
  } else {
    ui.message.textContent = spec.label;
  }
  render();
  return Object.freeze({ spec, outcome, chanceZone });
}

function resolvePendingChanceEye() {
  const pending = pendingChanceEyeOccurrence;
  pendingChanceEyeOccurrence = null;
  if (!pending?.occurred) return null;
  if (core.snapshot().mode !== 'NORMAL') return null;
  return playChanceEye(pending.kind, CHANCE_EYE_CONTEXT.NORMAL);
}

core.addEventListener('change', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.snapshot.bet === 3 ? 'MAX BET — START' : 'BET受付';
});

core.addEventListener('mode-enter', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.mode === CHANCE_EYE_DESTINATION.FUJIKO_ZONE
    ? '不二子ゾーン'
    : event.detail.mode === CHANCE_EYE_DESTINATION.ODOROBO_ZONE
      ? '大泥棒ゾーン'
      : event.detail.mode;
});

core.addEventListener('mode-game-advanced', (event) => {
  render(event.detail.snapshot);
});

core.addEventListener('mode-window-exhausted', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `${event.detail.mode} 終了`;
});

core.addEventListener('chance-zone-success', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = 'チャンスゾーン成功';
});

core.addEventListener('spin-start', (event) => {
  const snapshot = event.detail.snapshot;
  pendingChanceEyeOccurrence = snapshot.mode === 'NORMAL'
    ? resolveChanceEyeOccurrence(chanceEyeOccurrenceRandom, CHANCE_EYE_CONTEXT.NORMAL)
    : null;
  pendingPhysicalRole = snapshot.mode === 'NORMAL'
    ? physicalRoleSession.start(event.detail.spinId)
    : null;
  researchReels.start(event.detail.spinId);
  render(snapshot);
  ui.message.textContent = 'SPIN';
  scene().startSpin();
});

core.addEventListener('reel-stop', (event) => {
  const fallbackStop = researchReels.stop(event.detail.reelIndex);
  const physicalSymbol = pendingPhysicalRole?.stopPlan?.middleLineSymbols?.[event.detail.reelIndex] ?? null;
  scene().setReelRunning(event.detail.reelIndex, false, physicalSymbol ?? fallbackStop?.symbol ?? null);
  render(event.detail.snapshot);
});

core.addEventListener('spin-end', (event) => {
  const completedMode = event.detail.snapshot.mode;
  if (event.detail.snapshot.modeGamesRemaining > 0) core.advanceModeGame();
  scene().endSpin();

  if (completedMode === 'NORMAL') {
    const chanceEye = resolvePendingChanceEye();
    if (!chanceEye) ui.message.textContent = '1ゲーム完了';
  }
  pendingPhysicalRole = null;
  render();
});

ui.betBtn.addEventListener('click', () => core.betOne());
ui.maxBetBtn.addEventListener('click', () => core.maxBetNow());
ui.startBtn.addEventListener('click', () => core.start());
ui.stopBtns.forEach((button) => {
  button.addEventListener('click', () => core.stop(Number(button.dataset.reel)));
});

render();
window.__LUPIN_ZERO__ = {
  core,
  game,
  researchReels,
  mechanism,
  presentation,
  playChanceEye,
  resolveChanceZoneOddAlignment: () => core.resolveChanceZoneOddAlignment(),
  chanceEyeOccurrenceRandom,
  chanceEyeRandom,
  chanceZoneRandom,
  physicalRoleRandom,
  physicalRoleSession,
  machineSetting: MACHINE_SETTING
};
