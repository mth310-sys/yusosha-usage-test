import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = () => app.game.scene.getScene('LupinView');

export const EXTRA_BONUS_GAME_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  changesOddAlignmentLottery: false,
  changesGoldRushLottery: false,
  changesStockAward: false,
  exactRealMachineCueTimingVerified: false,
  stages: Object.freeze(['START_CUE', 'STOP_1', 'STOP_2', 'STOP_3', 'RESULT_REVEAL'])
});

let active = false;
let stopCount = 0;
let overlay = null;
let frame = null;
let label = null;
let subLabel = null;

function ensure() {
  const s = scene();
  if (!s?.add) return false;
  if (overlay) return true;
  const { width } = s.scale;
  overlay = s.add.graphics().setDepth(1.82).setVisible(false);
  frame = s.add.graphics().setDepth(1.84).setVisible(false);
  label = s.add.text(width / 2, 86, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '17px', color: '#fff0a5',
    stroke: '#000000', strokeThickness: 5, align: 'center'
  }).setOrigin(.5).setDepth(1.86).setVisible(false);
  subLabel = s.add.text(width / 2, 114, '', {
    fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#ffffff',
    stroke: '#000000', strokeThickness: 3, align: 'center'
  }).setOrigin(.5).setDepth(1.86).setVisible(false);
  return true;
}

function clear() {
  if (!ensure()) return false;
  overlay.clear().setVisible(false).setAlpha(1);
  frame.clear().setVisible(false).setAlpha(1);
  label.setText('').setVisible(false).setAlpha(1).setScale(1);
  subLabel.setText('').setVisible(false).setAlpha(1);
  active = false;
  stopCount = 0;
  return true;
}

function drawBase(strength = 0) {
  const s = scene();
  const { width, height } = s.scale;
  overlay.clear().setVisible(true).setAlpha(1);
  frame.clear().setVisible(true).setAlpha(1);
  overlay.fillStyle(0x230808, .18 + strength * .04);
  overlay.fillRect(0, 68, width, height - 68);
  frame.lineStyle(2 + strength, 0xffc85c, .35 + strength * .15);
  frame.strokeRoundedRect(18 + strength * 5, 78 + strength * 3, width - 36 - strength * 10, height - 124 - strength * 6, 12);
}

function begin() {
  if (!ensure()) return false;
  active = true;
  stopCount = 0;
  drawBase(0);
  label.setText('EXTRA BONUS').setColor('#ffe49a').setVisible(true);
  subLabel.setText('奇数図柄 / 金7に期待').setVisible(true);
  core.emit('extra-bonus-presentation-stage', { stage: 'START_CUE', evidenceStatus: EXTRA_BONUS_GAME_PRESENTATION_POLICY.evidenceStatus });
  return true;
}

function onStop() {
  if (!active || !ensure()) return false;
  const s = scene();
  stopCount = Math.min(3, stopCount + 1);
  drawBase(stopCount);
  label.setText(stopCount === 3 ? '揃え！' : `STOP ${stopCount}`).setColor(stopCount === 3 ? '#fff6bd' : '#ffe49a');
  subLabel.setText(stopCount === 1 ? '奇数テンパイ煽り' : stopCount === 2 ? '金7ならGOLD RUSH' : 'RESULT');
  if (stopCount >= 2) s.cameras.main.flash(45 + stopCount * 15, 255, 210, 92, false);
  core.emit('extra-bonus-presentation-stage', { stage: `STOP_${stopCount}`, evidenceStatus: EXTRA_BONUS_GAME_PRESENTATION_POLICY.evidenceStatus });
  return true;
}

function reveal(detail = {}) {
  if (!ensure()) return false;
  const s = scene();
  active = true;
  const goldRushHit = detail.goldRushHit === true;
  const oddAligned = detail.oddAligned === true;
  drawBase(goldRushHit ? 3 : oddAligned ? 2 : 0);

  if (goldRushHit) {
    label.setText('金7揃い').setColor('#fff4a8');
    subLabel.setText('GOLD RUSH').setColor('#ffffff');
    s.cameras.main.flash(150, 255, 231, 135, false);
    s.cameras.main.shake(120, .0042);
  } else if (oddAligned) {
    label.setText('奇数図柄揃い').setColor('#ffdf7e');
    subLabel.setText('GT STOCK +1').setColor('#ffffff');
    s.cameras.main.flash(90, 255, 120, 80, false);
    s.cameras.main.shake(75, .0024);
  } else {
    label.setText('EXTRA BONUS').setColor('#e6d9bd');
    subLabel.setText('NEXT GAME').setColor('#d9d9d9');
  }

  label.setVisible(true).setAlpha(1);
  subLabel.setVisible(true).setAlpha(1);
  core.emit('extra-bonus-presentation-stage', {
    stage: 'RESULT_REVEAL',
    result: goldRushHit ? 'GOLD_7_ALIGNED' : oddAligned ? 'ODD_ALIGNED' : 'NO_ALIGNMENT',
    evidenceStatus: EXTRA_BONUS_GAME_PRESENTATION_POLICY.evidenceStatus
  });
  s.tweens.add({ targets: [overlay, frame, label, subLabel], alpha: 0, duration: 220, delay: goldRushHit ? 540 : oddAligned ? 380 : 160, onComplete: clear });
  return true;
}

core.addEventListener('spin-start', (event) => {
  if (event.detail.snapshot.mode === GameMode.EXTRA_BONUS) begin();
  else if (active) clear();
});
core.addEventListener('reel-stop', () => onStop());
core.addEventListener('extra-bonus-game-settled', (event) => reveal(event.detail));
core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode !== GameMode.EXTRA_BONUS && active) clear();
});

app.extraBonusGamePresentationPolicy = EXTRA_BONUS_GAME_PRESENTATION_POLICY;
app.clearExtraBonusGamePresentation = clear;
