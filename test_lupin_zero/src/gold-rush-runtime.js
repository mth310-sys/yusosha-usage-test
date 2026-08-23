import { GameMode } from './game-flow-spec.js';
import { resolveGoldRushGame } from './gold-rush-resolver.js';
import { resolveBreakthroughGuarantee } from './breakthrough-guarantee-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x2016080c);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let returnExtraBonusGames = 0;
let extraBonusGamesAtSpinStart = null;
let pendingBreakthroughType = null;

function snapshot() { return core.snapshot(); }
function renderGoldRush() {
  const s = snapshot();
  if (s.mode !== GameMode.GOLD_RUSH) return;
  if (stateValue) stateValue.textContent = `GOLD RUSH / STOCK ${s.goldenTimeStockCount ?? 0}`;
  if (phaseBadge) phaseBadge.textContent = 'GOLD RUSH';
}

function setNextGoldRushBreakthrough(type) {
  if (type == null) {
    pendingBreakthroughType = null;
    return true;
  }
  const resolution = resolveBreakthroughGuarantee(type);
  if (!resolution) return false;
  pendingBreakthroughType = type;
  return true;
}

function enterGoldRush() {
  const s = snapshot();
  if (s.mode !== GameMode.EXTRA_BONUS || s.modeResult !== 'PENDING_GOLD_RUSH') return false;
  returnExtraBonusGames = Number.isInteger(extraBonusGamesAtSpinStart)
    ? Math.max(0, extraBonusGamesAtSpinStart - 1)
    : 0;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.GOLD_RUSH,
    modeGamesRemaining: 1,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('mode-enter', { mode: GameMode.GOLD_RUSH, games: 1, evidenceStatus: 'MULTI_SOURCE_MATCH' });
  if (message) message.textContent = 'GOLD RUSH';
  renderGoldRush();
  return true;
}

function settleGoldRushGame() {
  const s = snapshot();
  if (s.mode !== GameMode.GOLD_RUSH || s.state !== 'IDLE') return false;
  const resolution = resolveGoldRushGame(random);
  const breakthrough = pendingBreakthroughType ? resolveBreakthroughGuarantee(pendingBreakthroughType) : null;
  pendingBreakthroughType = null;
  const stockAdded = Math.max(1, breakthrough?.minimumGtStockAward ?? 1);
  const stockCount = (s.goldenTimeStockCount ?? 0) + stockAdded;
  const presentationRank = breakthrough?.type ?? 'NORMAL_RED_ALIGNMENT';

  core.emit('gold-rush-red-alignment-presentation', {
    presentationRank,
    breakthroughType: breakthrough?.type ?? null,
    breakthroughLabel: breakthrough?.label ?? null,
    stockAdded,
    evidenceStatus: breakthrough?.evidenceStatus ?? resolution.evidenceStatus,
    presentationOnly: true
  });

  core.kernelState = Object.freeze({
    ...core.kernelState,
    goldenTimeStockCount: stockCount,
    modeGamesRemaining: resolution.continued ? 1 : 0
  });
  core.emit('golden-time-stock-added', {
    stockAdded,
    stockCount,
    source: breakthrough ? 'GOLD_RUSH_BREAKTHROUGH' : 'GOLD_RUSH_ODD_ALIGNMENT',
    breakthroughType: breakthrough?.type ?? null,
    breakthroughLabel: breakthrough?.label ?? null,
    evidenceStatus: breakthrough?.evidenceStatus ?? resolution.evidenceStatus
  });

  if (resolution.continued) {
    if (message) message.textContent = breakthrough
      ? `${breakthrough.label} — STOCK +${stockAdded} / 計${stockCount}`
      : `赤図柄揃い — STOCK ${stockCount}`;
    renderGoldRush();
    return true;
  }

  if (returnExtraBonusGames > 0) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      mode: GameMode.EXTRA_BONUS,
      modeGamesRemaining: returnExtraBonusGames,
      modeResult: null,
      modeResultEvidenceStatus: null
    });
    core.emit('mode-enter', {
      mode: GameMode.EXTRA_BONUS,
      games: returnExtraBonusGames,
      evidenceStatus: 'MULTI_SOURCE_MATCH'
    });
    if (message) message.textContent = breakthrough
      ? `${breakthrough.label} — STOCK +${stockAdded} / GOLD RUSH END — EXTRA BONUS`
      : 'GOLD RUSH END — EXTRA BONUS';
    return true;
  }

  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.GOLDEN_TIME,
    modeGamesRemaining: 0,
    modeResult: 'PENDING_GT_CONTINUATION',
    modeResultEvidenceStatus: 'PUBLISHED_ANALYSIS'
  });
  core.emit('golden-time-battle-ready', { treasure: 1000000 });
  if (message) message.textContent = breakthrough
    ? `${breakthrough.label} — STOCK +${stockAdded} / GOLD RUSH END — 継続バトル`
    : 'GOLD RUSH END — 継続バトル';
  return true;
}

core.addEventListener('spin-start', (event) => {
  const s = event.detail.snapshot;
  if (s.mode === GameMode.EXTRA_BONUS) extraBonusGamesAtSpinStart = s.modeGamesRemaining;
});
core.addEventListener('extra-bonus-gold-rush-hit', () => enterGoldRush());
core.addEventListener('spin-end', (event) => {
  if (event.detail.snapshot.mode === GameMode.GOLD_RUSH) settleGoldRushGame();
});
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.GOLD_RUSH) renderGoldRush();
});

window.__LUPIN_ZERO__.goldRushRandom = random;
window.__LUPIN_ZERO__.enterGoldRush = enterGoldRush;
window.__LUPIN_ZERO__.setNextGoldRushBreakthrough = setNextGoldRushBreakthrough;
