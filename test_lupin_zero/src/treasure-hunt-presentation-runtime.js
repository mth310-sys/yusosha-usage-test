import { GameMode } from './game-flow-spec.js';
import { getTreasureHuntPresentationByIndex, resolveGuaranteedTreasureHunt } from './treasure-hunt-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');
const core = app.core;
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');
let presentationIndex = 0;
let activePresentation = null;

function showPresentation(trigger = 'TREASURE_HUNT') {
  const presentation = getTreasureHuntPresentationByIndex(presentationIndex++);
  activePresentation = Object.freeze({ ...presentation, trigger });
  if (phaseBadge) phaseBadge.textContent = 'TREASURE HUNT';
  if (stateValue) stateValue.textContent = presentation.label;
  if (message) message.textContent = `${presentation.label} — CHANCE`;
  core.emit('treasure-hunt-presentation', {
    ...presentation,
    trigger,
    evidenceStatus: presentation.evidenceStatus
  });
  return activePresentation;
}

function clearPresentation() {
  activePresentation = null;
}

function applyGuaranteedHold(type) {
  const resolution = resolveGuaranteedTreasureHunt(type);
  const s = core.snapshot();
  if (!resolution || s.mode !== GameMode.GOLDEN_TIME || s.modeResult) return false;
  const from = s.goldenTimeTreasure ?? 0;
  const to = Math.min(1000000, Math.max(from, resolution.minimumTreasure));
  core.kernelState = Object.freeze({ ...core.kernelState, goldenTimeTreasure: to });
  core.emit('treasure-hunt-special-hold', {
    type: resolution.type,
    label: resolution.label,
    success: true,
    minimumTreasure: resolution.minimumTreasure,
    treasureFrom: from,
    treasureTo: to,
    evidenceStatus: resolution.evidenceStatus
  });
  if (message) message.textContent = `${resolution.label} — 成功確定 / ${Math.round(resolution.minimumTreasure / 10000)}万T以上`;
  return true;
}

core.addEventListener('treasure-hunt-enter', (event) => {
  showPresentation(event.detail.trigger ?? 'TREASURE_HUNT');
});
core.addEventListener('treasure-hunt-success', () => {
  if (message && activePresentation) message.textContent = `${activePresentation.label} — SUCCESS`;
});
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode === GameMode.TREASURE_RUSH) clearPresentation();
});

app.getTreasureHuntPresentationState = () => activePresentation;
app.applyTreasureHuntGuaranteedHold = applyGuaranteedHold;
