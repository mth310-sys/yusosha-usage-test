import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.mechanism) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const machine = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');

const PRESENTATION_ONLY_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  physicalTriggerVerified: false,
  automaticPhysicalLedCueImplemented: false,
  automaticPrismCueImplemented: false,
  lcdSurfaceStylingImplemented: true,
  note: 'Mode-linked LCD/cabinet ambience may remain presentation-only, but physical LED and prism cues are not automatically driven until exact real-machine trigger timing is verified.'
});

function setSurface(level = 'low', cue = 'normal') {
  if (machine) machine.dataset.surfaceLevel = level;
  if (lcdShell) lcdShell.dataset.modeCue = cue;
  core.emit('surface-presentation-changed', {
    level,
    cue,
    prism: null,
    leftLed: null,
    rightLed: null,
    evidenceStatus: PRESENTATION_ONLY_POLICY.evidenceStatus,
    physicalCueApplied: false
  });
  return Object.freeze({
    level,
    cue,
    prism: null,
    leftLed: null,
    rightLed: null,
    physicalCueApplied: false
  });
}

function applyForSnapshot(snapshot = core.snapshot()) {
  const s = snapshot;
  if (s.mode === GameMode.LEGEND_GATE || s.mode === GameMode.EXTRA_BONUS || s.mode === GameMode.GOLD_RUSH) return setSurface('max', 'special');
  if (s.mode === GameMode.TREASURE_RUSH) return setSurface('max', 'special');
  if (s.mode === GameMode.GOLDEN_TIME) return setSurface('high', 'gt');
  if (s.mode === GameMode.LUPIN_BONUS) return setSurface('high', 'bonus');
  if ([GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(s.mode)) return setSurface('high', 'cz');
  if (s.mode === GameMode.RAIUN_MODE || (s.mode === GameMode.NORMAL && (s.raiunHighGamesRemaining ?? 0) > 0)) return setSurface('medium', 'raiun');
  if (s.mode === GameMode.WANTED_CHANCE) return setSurface('medium', 'wanted');
  return setSurface('low', 'normal');
}

core.addEventListener('mode-enter', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('mode-exit', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('raiun-high-enter', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('raiun-high-exhausted', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('golden-time-stage-upgraded', (event) => {
  if (event.detail.stage === 'IKUKAN') setSurface('max', 'special');
});
core.addEventListener('treasure-hunt-enter', () => setSurface('high', 'gt'));
core.addEventListener('treasure-rush-ended', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('lupin-bonus-success', () => setSurface('max', 'special'));
core.addEventListener('chance-zone-success', () => setSurface('high', 'bonus'));
core.addEventListener('golden-time-ended', (event) => applyForSnapshot(event.detail.snapshot));
core.addEventListener('change', (event) => {
  const s = event.detail.snapshot;
  if (s.mode === GameMode.NORMAL && (s.raiunHighGamesRemaining ?? 0) <= 0) applyForSnapshot(s);
});

applyForSnapshot();
app.applyModeSurfacePresentation = applyForSnapshot;
app.modeSurfacePresentationPolicy = PRESENTATION_ONLY_POLICY;
