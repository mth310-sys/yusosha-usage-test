import { GameMode } from './game-flow-spec.js';
import { SeededRandomSource } from './random-source.js';
import { resolveGtTreasureHuntRoute } from './gt-treasure-hunt-route-resolver.js';
import { createTreasureRushProfile, resolveTreasureRushGame } from './treasure-rush-resolver.js';
import { createExtraBonusProfile } from './extra-bonus-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const routeRandom = new SeededRandomSource(0x20160815);
const durationRandom = new SeededRandomSource(0x20160818);
const rushRandom = new SeededRandomSource(0x20160816);
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let returnGoldenTimeGames = 0;
let active = false;
let activeDurationGames = 5;

function snapshot() { return core.snapshot(); }
function renderRush() {
  const s = snapshot();
  if (s.mode !== GameMode.TREASURE_RUSH) return;
  if (stateValue) stateValue.textContent = `Treasure RUSH ${s.modeGamesRemaining ?? 0}G / ${Math.round((s.goldenTimeTreasure ?? 0) / 10000)}万T`;
  if (phaseBadge) phaseBadge.textContent = 'TREASURE RUSH';
}

function enterTreasureRush(fromSnapshot) {
  if (!fromSnapshot || fromSnapshot.mode !== GameMode.GOLDEN_TIME || fromSnapshot.modeResult) return false;
  const profile = createTreasureRushProfile(durationRandom);
  activeDurationGames = profile.games;
  returnGoldenTimeGames = fromSnapshot.modeGamesRemaining ?? 0;
  active = true;
  core.emit('treasure-hunt-enter', { trigger: 'GREEN_CHANCE_EYE', evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' });
  core.emit('treasure-hunt-success', { destination: GameMode.TREASURE_RUSH, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' });
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.TREASURE_RUSH,
    modeGamesRemaining: profile.games,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('treasure-rush-profile-selected', { games: profile.games, duration: profile.duration, evidenceStatus: profile.evidenceStatus });
  core.emit('mode-enter', { mode: GameMode.TREASURE_RUSH, games: profile.games, evidenceStatus: profile.evidenceStatus });
  if (message) message.textContent = `緑チャンス目 — TREASURE RUSH ${profile.games}G`;
  renderRush();
  return true;
}

function addTreasureRushAward() {
  const s = snapshot();
  if (!active || s.mode !== GameMode.TREASURE_RUSH) return false;
  const resolution = resolveTreasureRushGame(rushRandom, activeDurationGames);
  const from = s.goldenTimeTreasure ?? 0;
  const rawTo = from + resolution.treasure;
  const to = Math.min(1000000, rawTo);
  core.kernelState = Object.freeze({
    ...core.kernelState,
    credit: s.credit + 5,
    lastPayout: 5,
    lastSettledRole: 'TREASURE_RUSH_GAME',
    goldenTimeTreasure: to
  });
  core.emit('treasure-rush-game-settled', {
    payoutCoins: 5,
    treasureAdded: to - from,
    rawTreasureAdded: resolution.treasure,
    treasureOverflow: Math.max(0, rawTo - 1000000),
    treasure: to,
    durationGames: activeDurationGames,
    remaining: core.snapshot().modeGamesRemaining,
    evidenceStatus: resolution.evidenceStatus
  });
  if (to >= 1000000) {
    active = false;
    core.kernelState = Object.freeze({
      ...core.kernelState,
      mode: GameMode.GOLDEN_TIME,
      modeGamesRemaining: returnGoldenTimeGames,
      modeResult: null,
      modeResultEvidenceStatus: null
    });
    const extra = createExtraBonusProfile(returnGoldenTimeGames);
    core.enterExtraBonus(extra);
    if (message) message.textContent = '100万T — EXTRA BONUS';
    return true;
  }
  if (message) message.textContent = `TREASURE RUSH +${Math.round((to - from) / 10000)}万T`;
  renderRush();
  return true;
}

function exitTreasureRush() {
  const s = snapshot();
  if (!active || s.mode !== GameMode.TREASURE_RUSH || s.modeGamesRemaining !== 0) return false;
  active = false;
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.GOLDEN_TIME,
    modeGamesRemaining: returnGoldenTimeGames,
    modeResult: returnGoldenTimeGames > 0 ? null : 'PENDING_GT_CONTINUATION',
    modeResultEvidenceStatus: returnGoldenTimeGames > 0 ? null : 'PUBLISHED_ANALYSIS'
  });
  core.emit('treasure-rush-ended', { returnGoldenTimeGames, durationGames: activeDurationGames, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' });
  if (returnGoldenTimeGames > 0) {
    core.emit('mode-enter', { mode: GameMode.GOLDEN_TIME, games: returnGoldenTimeGames, evidenceStatus: 'PUBLISHED_ANALYSIS', treasure: core.snapshot().goldenTimeTreasure });
    if (message) message.textContent = 'TREASURE RUSH END — GOLDEN TIME';
  } else {
    core.emit('golden-time-battle-ready', { treasure: core.snapshot().goldenTimeTreasure });
  }
  return true;
}

core.addEventListener('golden-time-game-settled', (event) => {
  const s = event.detail.snapshot;
  if (active || s.mode !== GameMode.GOLDEN_TIME || s.modeResult || s.goldenTimeTreasure >= 1000000) return;
  const route = resolveGtTreasureHuntRoute(routeRandom);
  if (route.hit) enterTreasureRush(s);
});

core.addEventListener('mode-game-advanced', (event) => {
  if (event.detail.mode !== GameMode.TREASURE_RUSH) return;
  addTreasureRushAward();
});
core.addEventListener('mode-window-exhausted', (event) => {
  if (event.detail.mode === GameMode.TREASURE_RUSH) exitTreasureRush();
});
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.TREASURE_RUSH) renderRush();
});

app.treasureRushRouteRandom = routeRandom;
app.treasureRushDurationRandom = durationRandom;
app.treasureRushRandom = rushRandom;
app.enterTreasureRushFromGoldenTime = () => enterTreasureRush(core.snapshot());
