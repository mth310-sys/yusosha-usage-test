import { GameMode } from './game-flow-spec.js';
import { SeededRandomSource } from './random-source.js';
import { createLupinRushProfile, LUPIN_RUSH_POLICY } from './lupin-rush-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160814);
const message = document.querySelector('#message');
const phaseBadge = document.querySelector('#phaseBadge');
let active = null;
let setNumber = null;
let remaining = 0;

function patternLabel(pattern) {
  if (pattern === 'WALTHER') return 'ワルサーRUSH';
  if (pattern === 'SILHOUETTE') return 'シルエットRUSH';
  if (pattern === 'REVOLVER_VISION') return 'リボルバービジョンRUSH';
  if (pattern === 'ATTACK_VISION') return 'アタックビジョンRUSH';
  return 'LUPIN RUSH';
}

function startRush(snapshot) {
  if (snapshot.mode !== GameMode.GOLDEN_TIME) return null;
  active = createLupinRushProfile(random);
  setNumber = snapshot.goldenTimeSetNumber ?? 1;
  remaining = active.games;
  core.emit('lupin-rush-enter', {
    pattern: active.pattern,
    games: active.games,
    setNumber,
    publishedAverageTreasure: active.publishedAverageTreasure,
    evidenceStatus: active.evidenceStatus,
    relationEvidenceStatus: active.relationEvidenceStatus
  });
  if (phaseBadge) phaseBadge.textContent = patternLabel(active.pattern);
  if (message) message.textContent = `${patternLabel(active.pattern)} — ${remaining}G`;
  return snapshotState();
}

function snapshotState() {
  return Object.freeze({ active: Boolean(active && remaining > 0), pattern: active?.pattern ?? null, setNumber, remaining, profile: active });
}

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.GOLDEN_TIME) startRush(event.detail.snapshot);
});

core.addEventListener('golden-time-continued', (event) => {
  startRush(event.detail.snapshot);
});

core.addEventListener('golden-time-game-settled', (event) => {
  const snapshot = event.detail.snapshot;
  if (!active || remaining <= 0 || snapshot.mode !== GameMode.GOLDEN_TIME) return;
  if ((snapshot.goldenTimeSetNumber ?? 1) !== setNumber) return;
  remaining = Math.max(0, remaining - 1);
  core.emit('lupin-rush-game-advanced', { pattern: active.pattern, remaining, setNumber, evidenceStatus: active.evidenceStatus });
  if (remaining > 0) {
    if (phaseBadge) phaseBadge.textContent = patternLabel(active.pattern);
    if (message) message.textContent = `${patternLabel(active.pattern)} — ${remaining}G`;
  } else {
    core.emit('lupin-rush-ended', { pattern: active.pattern, setNumber, evidenceStatus: active.evidenceStatus });
    if (phaseBadge) phaseBadge.textContent = `GT SET ${setNumber}`;
    if (message) message.textContent = `GOLDEN TIME ${snapshot.modeGamesRemaining ?? 0}G`;
  }
});

core.addEventListener('golden-time-ended', () => {
  active = null;
  setNumber = null;
  remaining = 0;
});

app.getLupinRushState = snapshotState;
app.lupinRushPolicy = LUPIN_RUSH_POLICY;

const initial = core.snapshot();
if (initial.mode === GameMode.GOLDEN_TIME) startRush(initial);
