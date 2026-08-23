import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = () => app.game.scene.getScene('LupinView');
const message = document.querySelector('#message');

export const GOLD_RUSH_GAME_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  changesContinuationRate: false,
  changesStockAward: false,
  automaticBreakthroughRankSelection: false,
  exactRealMachineStopTimingVerified: false,
  phases: Object.freeze(['START_CUE', 'STOP_1', 'STOP_2', 'STOP_3', 'RESULT_REVEAL'])
});

let active = false;
let stoppedCount = 0;
let overlay = null;
let lines = null;
let label = null;
let clearTimer = null;

function ensure() {
  const s = scene();
  if (!s?.add) return false;
  if (overlay) return true;
  const { width } = s.scale;
  overlay = s.add.graphics().setDepth(1.82).setVisible(false);
  lines = s.add.graphics().setDepth(1.84).setVisible(false);
  label = s.add.text(width / 2, 103, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#ff4b52',
    stroke: '#000000', strokeThickness: 5, align: 'center'
  }).setOrigin(.5).setDepth(1.86).setVisible(false);
  return true;
}

function clearTimerIfAny() {
  if (clearTimer?.remove) clearTimer.remove(false);
  clearTimer = null;
}

function clearPresentation() {
  if (!ensure()) return false;
  clearTimerIfAny();
  overlay.clear().setVisible(false).setAlpha(1);
  lines.clear().setVisible(false).setAlpha(1);
  label.setText('').setVisible(false).setAlpha(1).setScale(1);
  active = false;
  stoppedCount = 0;
  return true;
}

function begin() {
  if (!ensure()) return false;
  const s = scene();
  const { width, height } = s.scale;
  clearTimerIfAny();
  active = true;
  stoppedCount = 0;
  overlay.clear().setVisible(true).fillStyle(0x5d0008, .18).fillRect(0, 68, width, height - 68);
  lines.clear().setVisible(true).lineStyle(3, 0xff303b, .72);
  lines.lineBetween(12, height * .72, width - 12, height * .34);
  lines.lineBetween(12, height * .34, width - 12, height * .72);
  label.setText('赤図柄を狙え').setColor('#ff5a62').setVisible(true).setAlpha(1).setScale(1);
  s.cameras.main.flash(45, 170, 0, 10, false);
  if (message) message.textContent = 'GOLD RUSH — 赤図柄を狙え';
  core.emit('gold-rush-game-presentation-phase', { phase: 'START_CUE', evidenceStatus: GOLD_RUSH_GAME_PRESENTATION_POLICY.evidenceStatus });
  return true;
}

function onStop(reelIndex, complete) {
  if (!active || !ensure()) return false;
  const s = scene();
  const { width, height } = s.scale;
  stoppedCount += 1;
  const phase = `STOP_${Math.min(3, stoppedCount)}`;
  lines.clear().setVisible(true);
  const alpha = .48 + stoppedCount * .14;
  lines.lineStyle(4 + stoppedCount, 0xff2f3b, alpha);
  const y = 92 + stoppedCount * 38;
  lines.lineBetween(18, y, width - 18, y - 18);
  lines.lineStyle(2, 0xffd0d2, .42 + stoppedCount * .1);
  lines.strokeRoundedRect(24 + stoppedCount * 8, 79 + stoppedCount * 4, width - 48 - stoppedCount * 16, height - 132 - stoppedCount * 8, 10);
  label.setText(complete ? '揃え！' : `STOP ${stoppedCount}`).setColor(stoppedCount >= 3 ? '#fff0c7' : '#ff6d74').setScale(1 + stoppedCount * .04);
  s.cameras.main.shake(45 + stoppedCount * 12, .0015 + stoppedCount * .0007);
  core.emit('gold-rush-game-presentation-phase', { phase, reelIndex, complete: complete === true, evidenceStatus: GOLD_RUSH_GAME_PRESENTATION_POLICY.evidenceStatus });
  return true;
}

function reveal(detail = {}) {
  if (!ensure()) return false;
  const s = scene();
  const { width, height } = s.scale;
  active = false;
  clearTimerIfAny();
  const rank = detail.presentationRank ?? 'NORMAL_RED_ALIGNMENT';
  overlay.clear().setVisible(true).setAlpha(1);
  lines.clear().setVisible(true).setAlpha(1);

  if (rank === 'LIMIT_BREAKTHROUGH') {
    overlay.fillStyle(0xffffff, .18).fillRect(0, 68, width, height - 68);
    const colors = [0xff4040, 0xffd54f, 0x7cff75, 0x62b8ff, 0xc77dff];
    colors.forEach((tone, i) => {
      lines.lineStyle(4, tone, .88);
      lines.lineBetween(0, 82 + i * 29, width, height - 34 - i * 22);
    });
    label.setText('限界突破').setColor('#ffffff').setScale(1.28);
    s.cameras.main.flash(150, 255, 255, 255, false);
    s.cameras.main.shake(150, .0055);
  } else if (rank === 'ABSOLUTE_BREAKTHROUGH') {
    overlay.fillStyle(0xd69b12, .22).fillRect(0, 68, width, height - 68);
    lines.lineStyle(7, 0xffef9a, .96);
    lines.lineBetween(0, height * .72, width, height * .32);
    lines.lineStyle(3, 0xffffff, .9);
    lines.lineBetween(0, height * .32, width, height * .72);
    label.setText('絶対突破').setColor('#fff1a5').setScale(1.18);
    s.cameras.main.flash(110, 255, 220, 105, false);
    s.cameras.main.shake(110, .0042);
  } else {
    overlay.fillStyle(0x8b0610, .23).fillRect(0, 68, width, height - 68);
    lines.lineStyle(6, 0xff3d47, .94);
    lines.lineBetween(12, height * .68, width - 12, height * .38);
    label.setText('赤図柄揃い').setColor('#ff7077').setScale(1.1);
    s.cameras.main.flash(80, 220, 20, 30, false);
    s.cameras.main.shake(80, .003);
  }

  core.emit('gold-rush-game-presentation-phase', {
    phase: 'RESULT_REVEAL',
    presentationRank: rank,
    breakthroughType: detail.breakthroughType ?? null,
    stockAdded: detail.stockAdded ?? null,
    evidenceStatus: GOLD_RUSH_GAME_PRESENTATION_POLICY.evidenceStatus
  });

  clearTimer = s.time.delayedCall(700, () => clearPresentation());
  return true;
}

core.addEventListener('spin-start', (event) => {
  if (event.detail.snapshot.mode === GameMode.GOLD_RUSH) begin();
});
core.addEventListener('reel-stop', (event) => {
  if (event.detail.snapshot?.mode === GameMode.GOLD_RUSH || active) onStop(event.detail.reelIndex, event.detail.complete === true);
});
core.addEventListener('gold-rush-red-alignment-presentation', (event) => reveal(event.detail));
core.addEventListener('mode-exit', (event) => {
  if (event.detail.mode === GameMode.GOLD_RUSH) clearPresentation();
});
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode !== GameMode.GOLD_RUSH && active) clearPresentation();
});

app.goldRushGamePresentationPolicy = GOLD_RUSH_GAME_PRESENTATION_POLICY;
app.clearGoldRushGamePresentation = clearPresentation;
