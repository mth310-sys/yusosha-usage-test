import { GameMode } from './game-flow-spec.js';
import { resolveLegendGateTrigger, createLegendGateEntry } from './legend-gate-resolver.js';
import { resolveLegendGateMedals, LEGEND_GATE_MEDAL_MODEL } from './legend-gate-medal-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.physicalRoleSession) throw new Error('LUPIN ZERO core and physical role session are required');

const core = app.core;
const originalStop = core.stop.bind(core);
const medalRandom = new SeededRandomSource(0x20160812);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
const betBtn = document.querySelector('#betBtn');
const maxBetBtn = document.querySelector('#maxBetBtn');
const startBtn = document.querySelector('#startBtn');
let armedEntry = null;
let activeResolution = null;
let specialMovieGameStarted = false;
let storySequenceActive = false;

function setStoryLock(locked) {
  storySequenceActive = locked;
  if (betBtn) betBtn.disabled = locked;
  if (maxBetBtn) maxBetBtn.disabled = locked;
  if (startBtn) startBtn.disabled = locked;
}

function currentTrigger() {
  const session = app.physicalRoleSession.snapshot();
  return resolveLegendGateTrigger(session?.production ?? null);
}

function renderLegendGate() {
  const s = core.snapshot();
  if (s.mode !== GameMode.LEGEND_GATE) return;
  if (phaseBadge) phaseBadge.textContent = s.modeGamesRemaining > 0 ? 'SPECIAL MOVIE' : 'LEGEND GATE';
  if (stateValue) {
    stateValue.textContent = s.modeGamesRemaining > 0
      ? `SPECIAL MOVIE ${s.modeGamesRemaining}G / STOCK ${s.goldenTimeStockCount ?? 0}`
      : `LEGEND GATE / MEDAL ${activeResolution?.medalCount ?? 0}`;
  }
}

function armLegendGateBeforeFinalStop(reelIndex) {
  const snapshot = core.snapshot();
  if (![GameMode.NORMAL, GameMode.WANTED_CHANCE].includes(snapshot.mode)) return null;
  if (snapshot.stopped?.[reelIndex]) return null;
  const stoppedAfter = snapshot.stopped.map((stopped, index) => index === reelIndex ? true : stopped);
  if (!stoppedAfter.every(Boolean)) return null;

  const trigger = currentTrigger();
  const entry = createLegendGateEntry(trigger);
  if (!entry) return null;

  armedEntry = Object.freeze({ ...entry, trigger });
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.LEGEND_GATE,
    modeGamesRemaining: 0,
    modeEvidenceStatus: entry.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  return armedEntry;
}

function enterGoldenTimeFromLegendGate() {
  setStoryLock(false);
  core.kernelState = Object.freeze({
    ...core.kernelState,
    modeResult: 'PENDING_GOLDEN_TIME',
    modeResultEvidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  core.emit('legend-gate-art-guaranteed', {
    triggerRole: activeResolution?.triggerRole ?? null,
    destination: GameMode.GOLDEN_TIME,
    medalCount: activeResolution?.medalCount ?? 0,
    minimumStocks: activeResolution?.minimumStocks ?? 0,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  if (typeof app.enterGoldenTime === 'function') app.enterGoldenTime();
  renderLegendGate();
}

function finishStorySequence() {
  if (!activeResolution) return;
  setStoryLock(false);
  const specialMovieGames = activeResolution.specialMovieGames;
  if (specialMovieGames > 0) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      mode: GameMode.LEGEND_GATE,
      modeGamesRemaining: specialMovieGames,
      modeResult: null,
      modeResultEvidenceStatus: null
    });
    core.emit('legend-gate-special-movie-enter', {
      games: specialMovieGames,
      medalCount: activeResolution.medalCount,
      minimumStocks: activeResolution.minimumStocks,
      evidenceStatus: 'MULTI_SOURCE_MATCH'
    });
    if (message) message.textContent = `ALL SEVEN — SPECIAL MOVIE ${specialMovieGames}G`;
    renderLegendGate();
    return;
  }
  enterGoldenTimeFromLegendGate();
}

function playStorySequence(resolution) {
  setStoryLock(true);
  const attempts = resolution.attempts;
  attempts.forEach((attempt, index) => {
    window.setTimeout(() => {
      core.emit('legend-gate-story-result', {
        step: attempt.step,
        character: attempt.character,
        medal: attempt.medal,
        label: attempt.label,
        success: attempt.success,
        evidenceStatus: attempt.evidenceStatus
      });
      if (message) message.textContent = attempt.success
        ? `${attempt.character} — ${attempt.label} GET`
        : `${attempt.character} — FAILED`;
      if (index === attempts.length - 1) window.setTimeout(finishStorySequence, 650);
    }, 650 * (index + 1));
  });
}

core.stop = (reelIndex) => {
  if (storySequenceActive) return false;
  armLegendGateBeforeFinalStop(reelIndex);
  return originalStop(reelIndex);
};

core.addEventListener('spin-start', (event) => {
  specialMovieGameStarted = event.detail.snapshot.mode === GameMode.LEGEND_GATE
    && (event.detail.snapshot.modeGamesRemaining ?? 0) > 0
    && !event.detail.snapshot.modeResult;
  if (specialMovieGameStarted) renderLegendGate();
});

core.addEventListener('spin-end', () => {
  if (specialMovieGameStarted) {
    specialMovieGameStarted = false;
    const s = core.snapshot();
    if (s.mode !== GameMode.LEGEND_GATE) return;
    core.kernelState = Object.freeze({
      ...core.kernelState,
      credit: s.credit + 5,
      lastSettledRole: 'LEGEND_GATE_SPECIAL_MOVIE_GAME',
      lastPayout: 5
    });
    core.emit('legend-gate-special-movie-game-settled', {
      remaining: core.snapshot().modeGamesRemaining ?? 0,
      payoutCoins: 5,
      evidenceStatus: 'INFERRED_HIGH_CONFIDENCE_PURE_INCREASE_MODEL'
    });
    if ((core.snapshot().modeGamesRemaining ?? 0) <= 0) {
      if (message) message.textContent = 'SPECIAL MOVIE END — GOLDEN TIME';
      enterGoldenTimeFromLegendGate();
    } else if (message) {
      message.textContent = `SPECIAL MOVIE ${core.snapshot().modeGamesRemaining}G`;
    }
    renderLegendGate();
    return;
  }

  if (!armedEntry || core.snapshot().mode !== GameMode.LEGEND_GATE) return;
  const entry = armedEntry;
  armedEntry = null;

  core.emit('long-freeze', {
    triggerRole: entry.trigger.role,
    destination: GameMode.LEGEND_GATE,
    evidenceStatus: entry.evidenceStatus
  });
  core.emit('mode-enter', {
    mode: GameMode.LEGEND_GATE,
    games: 0,
    evidenceStatus: entry.evidenceStatus
  });

  const resolution = resolveLegendGateMedals(medalRandom);
  activeResolution = Object.freeze({ ...resolution, triggerRole: entry.trigger.role });
  core.kernelState = Object.freeze({
    ...core.kernelState,
    goldenTimeStockCount: (core.kernelState.goldenTimeStockCount ?? 0) + resolution.minimumStocks,
    legendGateMedalCount: resolution.medalCount,
    legendGateSpecialMovieGames: resolution.specialMovieGames,
    modeResult: null,
    modeResultEvidenceStatus: null
  });

  core.emit('legend-gate-medals-resolved', {
    medalCount: resolution.medalCount,
    medals: resolution.medals,
    minimumStocks: resolution.minimumStocks,
    specialMovieGames: resolution.specialMovieGames,
    evidenceStatus: resolution.evidenceStatus,
    exactDistributionKnown: false
  });

  if (phaseBadge) phaseBadge.textContent = 'LEGEND GATE';
  if (stateValue) stateValue.textContent = 'LEGEND GATE';
  if (message) message.textContent = 'LONG FREEZE — LEGEND GATE';
  renderLegendGate();
  playStorySequence(resolution);
});

app.resolveLegendGateTrigger = resolveLegendGateTrigger;
app.resolveLegendGateMedals = resolveLegendGateMedals;
app.legendGateMedalRandom = medalRandom;
app.legendGateSpec = Object.freeze({
  automaticMedalLotteryImplemented: true,
  automaticStockAwardImplemented: true,
  exactMedalDistributionKnown: false,
  medalModelEvidenceStatus: LEGEND_GATE_MEDAL_MODEL.evidenceStatus
});
