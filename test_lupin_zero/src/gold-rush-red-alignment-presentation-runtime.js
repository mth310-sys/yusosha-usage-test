const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const machine = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');
const message = document.querySelector('#message');
const stateValue = document.querySelector('#stateValue');
const phaseBadge = document.querySelector('#phaseBadge');

const PRESENTATION = Object.freeze({
  NORMAL_RED_ALIGNMENT: Object.freeze({ label: '赤図柄揃い', cue: 'red', flash: 'strong' }),
  ABSOLUTE_BREAKTHROUGH: Object.freeze({ label: '絶対突破', cue: 'gold-white', flash: 'max' }),
  LIMIT_BREAKTHROUGH: Object.freeze({ label: '限界突破', cue: 'rainbow', flash: 'max-plus' })
});

let clearTimer = null;

function clearPresentation() {
  if (machine) delete machine.dataset.goldRushResult;
  if (lcdShell) delete lcdShell.dataset.goldRushCue;
}

function showPresentation(detail) {
  const row = PRESENTATION[detail?.presentationRank] ?? PRESENTATION.NORMAL_RED_ALIGNMENT;
  if (clearTimer) window.clearTimeout(clearTimer);
  if (machine) machine.dataset.goldRushResult = detail.presentationRank;
  if (lcdShell) lcdShell.dataset.goldRushCue = row.cue;
  if (phaseBadge) phaseBadge.textContent = 'GOLD RUSH';
  if (stateValue) stateValue.textContent = row.label;
  if (message) message.textContent = `${row.label} — STOCK +${detail.stockAdded}`;
  core.emit('gold-rush-presentation-only', {
    rank: detail.presentationRank,
    label: row.label,
    cue: row.cue,
    flash: row.flash,
    stockAdded: detail.stockAdded,
    affectsGameLogic: false,
    evidenceStatus: 'PRESENTATION_ONLY'
  });
  clearTimer = window.setTimeout(clearPresentation, 900);
}

core.addEventListener('gold-rush-red-alignment-presentation', (event) => showPresentation(event.detail));
core.addEventListener('mode-exit', clearPresentation);
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode !== 'GOLD_RUSH') clearPresentation();
});

app.goldRushRedAlignmentPresentationPolicy = Object.freeze({
  presentationOnly: true,
  normalCue: 'RED',
  absoluteBreakthroughCue: 'GOLD_WHITE',
  limitBreakthroughCue: 'RAINBOW',
  automaticRankSelection: false,
  changesStockAward: false
});
