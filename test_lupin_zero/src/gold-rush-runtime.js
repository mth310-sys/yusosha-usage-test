import { GameMode } from './game-flow-spec.js';
import { resolveGoldRushGame } from './gold-rush-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x2016080c);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let returnExtraBonusGames = 0;

function snapshot() { return core.snapshot(); }
function renderGoldRush() {
  const s = snapshot();
  if (s.mode !== GameMode.GOLD_RUSH) return;
  if (stateValue) stateValue.textContent = `GOLD RUSH / STOCK ${s.goldenTimeStockCount ?? 0}`;
  if (phaseBadge) phaseBadge.textContent = 'GOLD RUSH';
}

function enterGoldRush() {
  const s = snapshot();
  if (s.mode !== GameMode.EXTRA_BONUS || s.modeResult !== 'PENDING_GOLD_RUSH') return false;
  returnExtraBonusGames = Number.isInteger(s.extraBonusAbsorbedGoldenTimeGames)
    ? Math.max(0, s.extraBonusAbsorbedGoldenTimeGames)
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
  const stockAdded = 1;
  const stockCount = (s.goldenTimeStockCount ?? 0) + stockAdded;

  core.kernelState = Object.freeze({
    ...core.kernelState,
    goldenTimeStockCount: stockCount,
    modeGamesRemaining: resolution.continued ? 1 : 0
  });
  core.emit('golden-time-stock-added', {
    stockAdded,
    stockCount,
    source: 'GOLD_RUSH_ODD_ALIGNMENT',
    evidenceStatus: resolution.evidenceStatus
  });

  if (resolution.continued) {
    if (message) message.textContent = `奇数揃い — STOCK ${stockCount}`;
    renderGoldRush();
    return true;
  }

  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.EXTRA_BONUS,
    modeGamesRemaining: Math.max(1, returnExtraBonusGames),
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('mode-enter', {
    mode: GameMode.EXTRA_BONUS,
    games: Math.max(1, returnExtraBonusGames),
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  if (message) message.textContent = 'GOLD RUSH END — EXTRA BONUS';
  return true;
}

core.addEventListener('extra-bonus-gold-rush-hit', () => enterGoldRush());
core.addEventListener('spin-end', (event) => {
  if (event.detail.snapshot.mode === GameMode.GOLD_RUSH) settleGoldRushGame();
});
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.GOLD_RUSH) renderGoldRush();
});

window.__LUPIN_ZERO__.goldRushRandom = random;
window.__LUPIN_ZERO__.enterGoldRush = enterGoldRush;
