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
import { getNormalRoleSettlement } from './normal-role-settlement.js';
import { getMbFollowupGameSettlement } from './mb-followup.js';
import { selectWantedWindow, WANTED_RESET_CONTEXT } from './normal-progression.js';
import { resolveInitialRaiunPoints, resolveRaiunPointAcquisition } from './raiun-counter-resolver.js';
import { resolveRaiunHighGame } from './raiun-high-resolver.js';
import { resolveRaiunModeGame } from './raiun-mode-resolver.js';
import { createGoldenTimeSetProfile, resolveGoldenTimeContinuation } from './golden-time-resolver.js';
import { GameMode } from './game-flow-spec.js';
import { SeededRandomSource } from './random-source.js';

const MACHINE_SETTING = 1;
const core = new MachineCore({ credit: 50, maxBet: 3 });
const researchReels = new ResearchReelEngine();
const chanceEyeOccurrenceRandom = new SeededRandomSource(0x20160800);
const chanceEyeRandom = new SeededRandomSource(0x20160801);
const chanceZoneRandom = new SeededRandomSource(0x20160802);
const physicalRoleRandom = new SeededRandomSource(0x20160803);
const wantedWindowRandom = new SeededRandomSource(0x20160804);
const raiunInitialRandom = new SeededRandomSource(0x20160805);
const raiunPointRandom = new SeededRandomSource(0x20160806);
const raiunHighRandom = new SeededRandomSource(0x20160807);
const raiunModeRandom = new SeededRandomSource(0x20160808);
const goldenTimeContinuationRandom = new SeededRandomSource(0x20160809);
const physicalRoleSession = new PhysicalRoleSession({ randomSource: physicalRoleRandom, setting: MACHINE_SETTING });
const machineRoot = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');
const mechanism = new PrismMechanismController(document.querySelector('#prismMechanism'));
let pendingChanceEyeOccurrence = null;
let pendingPhysicalRole = null;
let spinStartedInRaiunHigh = false;

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

function scene() { return game.scene.getScene('LupinView'); }

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
  ui.state.textContent = snapshot.mbFollowupGamesRemaining > 0
    ? `MB ${snapshot.mbFollowupGamesRemaining}G`
    : snapshot.modeResult === 'PENDING_GOLDEN_TIME'
      ? 'GOLDEN TIME'
      : snapshot.mode === GameMode.GOLDEN_TIME
        ? snapshot.modeResult === 'PENDING_GT_CONTINUATION'
          ? `GT BATTLE ${Math.round(snapshot.goldenTimeTreasure / 10000)}万T`
          : `GT ${snapshot.modeGamesRemaining ?? 0}G / ${Math.round(snapshot.goldenTimeTreasure / 10000)}万T`
        : snapshot.mode === GameMode.NORMAL
          ? snapshot.raiunHighGamesRemaining > 0
            ? `雷雲高確 ${snapshot.raiunHighGamesRemaining}G`
            : snapshot.state
          : snapshot.modeResult
            ? `${snapshot.mode} SUCCESS`
            : `${snapshot.mode} ${snapshot.modeGamesRemaining ?? '?'}G`;
  ui.phaseBadge.textContent = snapshot.mbFollowupGamesRemaining > 0
    ? `MB ${snapshot.mbFollowupGamesRemaining}G`
    : snapshot.modeResult === 'PENDING_GOLDEN_TIME'
      ? 'GOLDEN TIME'
      : snapshot.mode === GameMode.GOLDEN_TIME
        ? `GT SET ${snapshot.goldenTimeSetNumber}`
        : snapshot.mode === GameMode.NORMAL
          ? snapshot.raiunHighGamesRemaining > 0
            ? `雷雲高確 ${snapshot.raiunHighRank}`
            : 'SYSTEM'
          : snapshot.mode;

  const busy = [MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state);
  const pendingModeResult = Boolean(snapshot.modeResult);
  ui.betBtn.disabled = busy || pendingModeResult || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.maxBetBtn.disabled = busy || pendingModeResult || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.startBtn.disabled = snapshot.state !== MachineState.READY || snapshot.bet !== 3 || pendingModeResult;
  ui.stopBtns.forEach((button, i) => { button.disabled = !busy || snapshot.stopped[i]; });
}

function configureNextWanted(context) {
  const selection = selectWantedWindow(wantedWindowRandom, MACHINE_SETTING, context);
  return core.configureWantedWindow(selection) ? selection : null;
}

function initializeRaiunCounter() {
  const initial = resolveInitialRaiunPoints(raiunInitialRandom);
  return core.setRaiunPoints(initial.points, initial.evidenceStatus) ? initial : null;
}

function resetRaiunCounterAfterHigh() {
  const initial = resolveInitialRaiunPoints(raiunInitialRandom);
  return core.resetRaiunCounter(initial.points, initial.evidenceStatus) ? initial : null;
}

function advanceRaiunCounterForNormalGame() {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.NORMAL || snapshot.raiunHighGamesRemaining > 0 || !Number.isInteger(snapshot.raiunPoints) || snapshot.raiunPoints >= 100) return null;
  const acquisition = resolveRaiunPointAcquisition(raiunPointRandom);
  if (acquisition.hit) core.addRaiunPoints(acquisition.points, acquisition.evidenceStatus);
  return acquisition;
}

function resolveCurrentRaiunHighGame() {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.NORMAL || snapshot.raiunHighGamesRemaining <= 0) return null;
  const resolution = resolveRaiunHighGame(raiunHighRandom, snapshot.raiunHighRank);
  core.resolveRaiunHighGame(resolution);
  return resolution;
}

function settleCurrentRaiunModeGame() {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.RAIUN_MODE || snapshot.modeGamesRemaining <= 0 || snapshot.modeResult) return null;
  const resolution = resolveRaiunModeGame(raiunModeRandom);
  core.settleRaiunModeGame(resolution);
  return resolution;
}

function enterGoldenTime() {
  const profile = createGoldenTimeSetProfile();
  return core.enterGoldenTime(profile) ? profile : null;
}

function settleCurrentGoldenTimeGame() {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.modeGamesRemaining <= 0 || snapshot.modeResult) return null;
  const profile = createGoldenTimeSetProfile();
  core.settleGoldenTimeGame(profile.payoutCoinsPerGame, profile.initialTreasureEvidenceStatus);
  return profile;
}

function resolveCurrentGoldenTimeBattle() {
  const snapshot = core.snapshot();
  if (snapshot.mode !== GameMode.GOLDEN_TIME || snapshot.modeResult !== 'PENDING_GT_CONTINUATION') return null;
  const resolution = resolveGoldenTimeContinuation(goldenTimeContinuationRandom, snapshot.goldenTimeTreasure);
  const profile = createGoldenTimeSetProfile();
  core.resolveGoldenTimeContinuation(resolution, profile);
  return resolution;
}

function enterChanceZone(destination) {
  if (![CHANCE_EYE_DESTINATION.FUJIKO_ZONE, CHANCE_EYE_DESTINATION.ODOROBO_ZONE].includes(destination)) return null;
  const duration = resolveChanceZoneDuration(chanceZoneRandom, MACHINE_SETTING, destination);
  const entered = core.enterMode(destination, duration.games, duration.evidenceStatus);
  return entered ? duration : null;
}

function playChanceEye(kind, context = CHANCE_EYE_CONTEXT.NORMAL) {
  const spec = getChanceEyePresentation(kind, context);
  const key = kind.toLowerCase() === 'weak' ? 'weak' : kind.toLowerCase() === 'middle' ? 'middle' : 'strong';
  const outcome = resolveChanceEyeOutcome(chanceEyeRandom, key, context);
  const chanceZone = outcome.hit ? enterChanceZone(outcome.destination) : null;
  presentation.runCue(spec.presentationCue, { ...spec, outcome, chanceZone });
  if (chanceZone) ui.message.textContent = outcome.destination === CHANCE_EYE_DESTINATION.FUJIKO_ZONE ? '不二子ゾーン' : '大泥棒ゾーン';
  else ui.message.textContent = spec.label;
  render();
  return Object.freeze({ spec, outcome, chanceZone });
}

function resolvePendingChanceEye(completedMode) {
  const pending = pendingChanceEyeOccurrence;
  pendingChanceEyeOccurrence = null;
  if (!pending?.occurred) return null;
  const context = completedMode === GameMode.WANTED_CHANCE ? CHANCE_EYE_CONTEXT.WANTED_CHANCE : CHANCE_EYE_CONTEXT.NORMAL;
  return playChanceEye(pending.kind, context);
}

function settlePendingPhysicalRole() {
  const production = pendingPhysicalRole?.production ?? null;
  if (!production) return null;
  const settlement = getNormalRoleSettlement(production, 3);
  core.settleNormalRole(settlement);
  return settlement;
}

core.addEventListener('change', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.snapshot.bet === 3 ? 'MAX BET — START' : 'BET受付';
});

core.addEventListener('normal-role-settled', (event) => {
  render(event.detail.snapshot);
  if (event.detail.role === 'REPLAY') ui.message.textContent = 'REPLAY';
  else if (event.detail.role === 'MB') ui.message.textContent = 'MB';
  else if (event.detail.creditDelta > 0) ui.message.textContent = `${event.detail.creditDelta} PAY`;
});

core.addEventListener('mb-followup-game-settled', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.remaining > 0 ? '10 PAY — MB' : '10 PAY — MB END';
});

core.addEventListener('raiun-points-added', (event) => { render(event.detail.snapshot); });

core.addEventListener('raiun-high-enter', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `雷雲高確 ${event.detail.games}G`;
});

core.addEventListener('raiun-high-game-resolved', (event) => {
  render(event.detail.snapshot);
  if (event.detail.hit) ui.message.textContent = '雷雲モード';
  else if (event.detail.remaining > 0) ui.message.textContent = `雷雲高確 ${event.detail.remaining}G`;
});

core.addEventListener('raiun-high-exhausted', () => {
  resetRaiunCounterAfterHigh();
  render();
  ui.message.textContent = '雷雲高確 END';
});

core.addEventListener('raiun-mode-game-settled', (event) => {
  render(event.detail.snapshot);
  if (!event.detail.artHit && event.detail.remaining > 0) ui.message.textContent = `雷雲モード ${event.detail.remaining}G`;
});

core.addEventListener('raiun-mode-art-success', (event) => {
  ui.message.textContent = event.detail.successPresentation === 'LCD_7_ALIGNED' ? '7揃い — GOLDEN TIME' : 'GOLDEN TIME';
  enterGoldenTime();
  render();
});

core.addEventListener('golden-time-game-settled', (event) => {
  render(event.detail.snapshot);
  if (event.detail.remaining > 0) ui.message.textContent = `GOLDEN TIME ${event.detail.remaining}G`;
});

core.addEventListener('golden-time-battle-ready', () => {
  ui.message.textContent = '継続バトル';
  resolveCurrentGoldenTimeBattle();
  render();
});

core.addEventListener('golden-time-continued', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = `GOLDEN TIME 継続 — SET ${event.detail.setNumber}`;
});

core.addEventListener('golden-time-ended', () => {
  core.setRaiunHighRank('LOW', 'PUBLISHED_MACHINE_GUIDE');
  initializeRaiunCounter();
  configureNextWanted(WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET);
  render();
  ui.message.textContent = 'GOLDEN TIME END';
});

core.addEventListener('mode-enter', (event) => {
  render(event.detail.snapshot);
  if (event.detail.mode === GameMode.WANTED_CHANCE) ui.message.textContent = 'WANTED CHANCE';
  else if (event.detail.mode === GameMode.RAIUN_MODE) ui.message.textContent = '雷雲モード';
  else if (event.detail.mode === GameMode.GOLDEN_TIME) ui.message.textContent = `GOLDEN TIME — ${Math.round((event.detail.treasure ?? 0) / 10000)}万T`;
  else if (event.detail.mode === CHANCE_EYE_DESTINATION.FUJIKO_ZONE) ui.message.textContent = '不二子ゾーン';
  else if (event.detail.mode === CHANCE_EYE_DESTINATION.ODOROBO_ZONE) ui.message.textContent = '大泥棒ゾーン';
  else ui.message.textContent = event.detail.mode;
});

core.addEventListener('mode-game-advanced', (event) => { render(event.detail.snapshot); });

core.addEventListener('mode-window-exhausted', (event) => {
  if (event.detail.mode === GameMode.WANTED_CHANCE) {
    core.exitWantedChance();
    configureNextWanted(WANTED_RESET_CONTEXT.AFTER_WANTED);
    ui.message.textContent = 'WANTED CHANCE END';
  } else if (event.detail.mode === GameMode.RAIUN_MODE) {
    core.exitRaiunMode();
    resetRaiunCounterAfterHigh();
    ui.message.textContent = '雷雲モード END';
  } else {
    ui.message.textContent = `${event.detail.mode} 終了`;
  }
  render();
});

core.addEventListener('chance-zone-success', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = 'チャンスゾーン成功';
});

core.addEventListener('spin-start', (event) => {
  const snapshot = event.detail.snapshot;
  const mbFollowupActive = snapshot.mbFollowupGamesRemaining > 0;
  spinStartedInRaiunHigh = snapshot.mode === GameMode.NORMAL && snapshot.raiunHighGamesRemaining > 0;
  const normalLikeMode = [GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(snapshot.mode);
  const chanceEyeContext = snapshot.mode === GameMode.WANTED_CHANCE ? CHANCE_EYE_CONTEXT.WANTED_CHANCE : CHANCE_EYE_CONTEXT.NORMAL;

  pendingChanceEyeOccurrence = normalLikeMode && !mbFollowupActive && !spinStartedInRaiunHigh
    ? resolveChanceEyeOccurrence(chanceEyeOccurrenceRandom, chanceEyeContext)
    : null;
  pendingPhysicalRole = normalLikeMode && !mbFollowupActive
    ? physicalRoleSession.start(event.detail.spinId)
    : null;

  researchReels.start(event.detail.spinId);
  render(snapshot);
  ui.message.textContent = mbFollowupActive
    ? 'MB'
    : spinStartedInRaiunHigh
      ? '雷雲高確'
      : snapshot.mode === GameMode.WANTED_CHANCE
        ? 'WANTED CHANCE'
        : snapshot.mode === GameMode.RAIUN_MODE
          ? '雷雲モード'
          : snapshot.mode === GameMode.GOLDEN_TIME
            ? 'GOLDEN TIME'
            : 'SPIN';
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
  const completedMbFollowup = event.detail.snapshot.mbFollowupGamesRemaining > 0;
  scene().endSpin();

  if (completedMbFollowup) {
    core.settleMbFollowupGame(getMbFollowupGameSettlement());
  } else if (completedMode === GameMode.GOLDEN_TIME) {
    settleCurrentGoldenTimeGame();
  } else if (completedMode === GameMode.RAIUN_MODE) {
    settleCurrentRaiunModeGame();
  } else if ([GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(completedMode)) {
    const settlement = settlePendingPhysicalRole();

    if (spinStartedInRaiunHigh && completedMode === GameMode.NORMAL) {
      resolveCurrentRaiunHighGame();
    } else {
      if (completedMode === GameMode.NORMAL) advanceRaiunCounterForNormalGame();
      const chanceEye = resolvePendingChanceEye(completedMode);
      const modeAfterChanceEye = core.snapshot().mode;
      const highAfterCounter = core.snapshot().raiunHighGamesRemaining > 0;

      if (completedMode === GameMode.NORMAL && modeAfterChanceEye === GameMode.NORMAL && !highAfterCounter) core.advanceNormalProgression();
      else if (completedMode === GameMode.WANTED_CHANCE && modeAfterChanceEye === GameMode.WANTED_CHANCE) core.advanceModeGame();

      if (!chanceEye && !settlement?.accepted) ui.message.textContent = '1ゲーム完了';
    }
  } else if (event.detail.snapshot.modeGamesRemaining > 0) {
    core.advanceModeGame();
  }

  pendingPhysicalRole = null;
  pendingChanceEyeOccurrence = null;
  spinStartedInRaiunHigh = false;
  render();
});

ui.betBtn.addEventListener('click', () => core.betOne());
ui.maxBetBtn.addEventListener('click', () => core.maxBetNow());
ui.startBtn.addEventListener('click', () => core.start());
ui.stopBtns.forEach((button) => { button.addEventListener('click', () => core.stop(Number(button.dataset.reel))); });

configureNextWanted(WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET);
initializeRaiunCounter();
render();
window.__LUPIN_ZERO__ = {
  core,
  game,
  researchReels,
  mechanism,
  presentation,
  playChanceEye,
  resolveChanceZoneOddAlignment: () => core.resolveChanceZoneOddAlignment(),
  setRaiunPoints: (points, evidenceStatus) => core.setRaiunPoints(points, evidenceStatus),
  enterGoldenTime,
  chanceEyeOccurrenceRandom,
  chanceEyeRandom,
  chanceZoneRandom,
  physicalRoleRandom,
  wantedWindowRandom,
  raiunInitialRandom,
  raiunPointRandom,
  raiunHighRandom,
  raiunModeRandom,
  goldenTimeContinuationRandom,
  physicalRoleSession,
  machineSetting: MACHINE_SETTING
};
