import { MachineCore, MachineState } from './machine-core.js';
import { LupinView } from './phaser-view.js';
import { ResearchReelEngine } from './research-reel-engine.js';
import { PrismMechanismController } from './mechanism-controller.js';
import { PresentationOrchestrator, PRESENTATION_CUES } from './presentation-orchestrator.js';
import { getChanceEyePresentation } from './chance-eye-presentation-map.js';
import { resolveChanceEyeOutcome, CHANCE_EYE_CONTEXT, CHANCE_EYE_DESTINATION } from './chance-eye-outcome-resolver.js';
import { resolveChanceZoneDuration } from './chance-zone-duration-resolver.js';
import { SeededRandomSource } from './random-source.js';

const RESEARCH_SETTING = 1;
const core = new MachineCore({ credit: 50, maxBet: 3 });
const researchReels = new ResearchReelEngine();
const chanceEyeRandom = new SeededRandomSource(0x20160801);
const chanceZoneRandom = new SeededRandomSource(0x20160802);
const machineRoot = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');
const mechanism = new PrismMechanismController(document.querySelector('#prismMechanism'));

const ui = {
  credit: document.querySelector('#creditValue'),
  bet: document.querySelector('#betValue'),
  state: document.querySelector('#stateValue'),
  message: document.querySelector('#message'),
  phaseBadge: document.querySelector('#phaseBadge'),
  betBtn: document.querySelector('#betBtn'),
  maxBetBtn: document.querySelector('#maxBetBtn'),
  startBtn: document.querySelector('#startBtn'),
  stopBtns: [...document.querySelectorAll('.stop')],
  chanceEyeBtns: [...document.querySelectorAll('[data-chance-eye]')]
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
let researchRevealActive = false;

function render(snapshot = core.snapshot()) {
  ui.credit.textContent = snapshot.credit;
  ui.bet.textContent = snapshot.bet;
  ui.state.textContent = snapshot.mode === 'NORMAL'
    ? snapshot.state
    : `${snapshot.mode} ${snapshot.modeGamesRemaining ?? '?'}G`;
  const busy = [MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state);
  ui.betBtn.disabled = busy || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.maxBetBtn.disabled = busy || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.startBtn.disabled = snapshot.state !== MachineState.READY;
  ui.stopBtns.forEach((button, i) => {
    button.disabled = !busy || snapshot.stopped[i];
  });
}

function renderResearchPresentation() {
  const snapshot = presentation.snapshot();
  const visible = snapshot.mechanism.circularElementVisible;
  ui.phaseBadge.textContent = visible ? 'PRESENTATION REVEAL' : 'RESEARCH CORE';
  ui.phaseBadge.setAttribute('aria-pressed', String(visible));
  ui.message.textContent = visible
    ? '研究用連動キュー — LED / 役物 / LCD 同期'
    : '研究用連動キュー解除 — 自動発動条件は未接続';
}

function enterChanceZone(destination) {
  if (![CHANCE_EYE_DESTINATION.FUJIKO_ZONE, CHANCE_EYE_DESTINATION.ODOROBO_ZONE].includes(destination)) return null;
  const duration = resolveChanceZoneDuration(chanceZoneRandom, RESEARCH_SETTING, destination);
  const entered = core.enterMode(destination, duration.games, duration.evidenceStatus);
  return entered ? duration : null;
}

function playChanceEye(kind, mode = CHANCE_EYE_CONTEXT.NORMAL) {
  const spec = getChanceEyePresentation(kind, mode);
  const key = kind.toLowerCase() === 'weak' ? 'weak' : kind.toLowerCase() === 'middle' ? 'middle' : 'strong';
  const outcome = resolveChanceEyeOutcome(chanceEyeRandom, key, mode);
  const chanceZone = outcome.hit ? enterChanceZone(outcome.destination) : null;
  presentation.runCue(spec.presentationCue, { ...spec, outcome, chanceZone });
  ui.message.textContent = chanceZone
    ? `${spec.label} HIT → ${outcome.destination} ${chanceZone.games}G / 設定${RESEARCH_SETTING}`
    : outcome.hit
      ? `${spec.label} HIT ${outcome.totalHitPercent}% → ${outcome.destination}`
      : `${spec.label} MISS / hit ${outcome.totalHitPercent}%`;
  render();
  return Object.freeze({ spec, outcome, chanceZone });
}

core.addEventListener('change', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.snapshot.bet === 3 ? 'MAX BET — START可能' : 'BET受付中';
});

core.addEventListener('mode-enter', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `${event.detail.mode} 突入 — ${event.detail.games}G`;
});

core.addEventListener('mode-game-advanced', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `${event.detail.mode} — 残り${event.detail.remaining}G`;
});

core.addEventListener('mode-window-exhausted', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `${event.detail.mode} 規定G消化 — 終了後遷移は未接続`;
});

core.addEventListener('spin-start', (event) => {
  researchReels.start(event.detail.spinId);
  render(event.detail.snapshot);
  ui.message.textContent = 'SPIN — STOPボタンで停止';
  scene().startSpin();
});

core.addEventListener('reel-stop', (event) => {
  const stop = researchReels.stop(event.detail.reelIndex);
  scene().setReelRunning(event.detail.reelIndex, false, stop?.symbol ?? null);
  render(event.detail.snapshot);
});

core.addEventListener('spin-end', (event) => {
  if (event.detail.snapshot.modeGamesRemaining > 0) core.advanceModeGame();
  render();
  scene().endSpin();
  if (core.snapshot().mode === 'NORMAL') {
    ui.message.textContent = '研究用1ゲーム完了 — 実機固有抽選は段階接続中';
  }
});

ui.betBtn.addEventListener('click', () => core.betOne());
ui.maxBetBtn.addEventListener('click', () => core.maxBetNow());
ui.startBtn.addEventListener('click', () => core.start());
ui.stopBtns.forEach((button) => {
  button.addEventListener('click', () => core.stop(Number(button.dataset.reel)));
});
ui.chanceEyeBtns.forEach((button) => {
  button.addEventListener('click', () => playChanceEye(button.dataset.chanceEye));
});
ui.phaseBadge.addEventListener('click', () => {
  researchRevealActive = !researchRevealActive;
  presentation.runCue(researchRevealActive
    ? PRESENTATION_CUES.RESEARCH_REVEAL
    : PRESENTATION_CUES.RESEARCH_RESET);
  renderResearchPresentation();
});

render();
renderResearchPresentation();
window.__LUPIN_ZERO__ = {
  core,
  game,
  researchReels,
  mechanism,
  presentation,
  playChanceEye,
  chanceEyeRandom,
  chanceZoneRandom,
  researchSetting: RESEARCH_SETTING
};
