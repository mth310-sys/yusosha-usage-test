import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = () => app.game.scene.getScene('LupinView');

export const NORMAL_MINI_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  selectionSource: 'SPIN_ID_ONLY',
  exactRealMachineOccurrenceRatesVerified: false,
  exactRealMachineTimingVerified: false,
  patterns: Object.freeze(['LUPIN_ESCAPE', 'JIGEN_SHOT', 'GOEMON_SLASH', 'ZENIGATA_APPROACH'])
});

const PATTERNS = NORMAL_MINI_PRESENTATION_POLICY.patterns;
let active = null;
let stoppedCount = 0;
let overlay = null;
let streak = null;
let label = null;

function ensure() {
  const s = scene();
  if (!s?.add) return false;
  if (overlay) return true;
  const { width, height } = s.scale;
  overlay = s.add.graphics().setDepth(1.65).setVisible(false);
  streak = s.add.graphics().setDepth(1.7).setVisible(false);
  label = s.add.text(width / 2, 88, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '12px', color: '#fff2ac',
    stroke: '#000000', strokeThickness: 4, align: 'center'
  }).setOrigin(.5).setDepth(1.75).setVisible(false);
  return true;
}

function clearMini() {
  if (!ensure()) return false;
  overlay.clear().setVisible(false);
  streak.clear().setVisible(false);
  label.setText('').setVisible(false);
  active = null;
  stoppedCount = 0;
  return true;
}

function choosePattern(spinId, mode) {
  if (mode === GameMode.WANTED_CHANCE) return 'ZENIGATA_APPROACH';
  if (mode !== GameMode.NORMAL) return null;
  return PATTERNS[Math.abs(Number(spinId) || 0) % PATTERNS.length];
}

function begin(pattern) {
  if (!ensure() || !pattern) return false;
  const s = scene();
  const { width, height } = s.scale;
  active = pattern;
  stoppedCount = 0;
  overlay.clear().setVisible(true);
  streak.clear().setVisible(true);

  if (pattern === 'LUPIN_ESCAPE') {
    overlay.fillStyle(0xb21722, .12); overlay.fillTriangle(0, height, width * .55, 76, width, height);
    label.setText('ESCAPE').setColor('#ffe18a');
    app.pulseCharacterPresentation?.('LUPIN');
  } else if (pattern === 'JIGEN_SHOT') {
    overlay.fillStyle(0x77808a, .10); overlay.fillRect(0, 72, width, height - 72);
    streak.lineStyle(2, 0xf4f1d8, .5); streak.lineBetween(18, 112, width - 22, 91);
    label.setText('SHOT').setColor('#e9edf0');
  } else if (pattern === 'GOEMON_SLASH') {
    overlay.fillStyle(0x4d6284, .10); overlay.fillRect(0, 72, width, height - 72);
    streak.lineStyle(3, 0xf7f3dc, .55); streak.lineBetween(30, height - 48, width - 36, 82);
    label.setText('SLASH').setColor('#f5f2df');
  } else {
    overlay.fillStyle(0xa44227, .11); overlay.fillRect(0, 72, width, height - 72);
    streak.lineStyle(2, 0xffc56d, .36); streak.strokeRoundedRect(18, 86, width - 36, height - 138, 12);
    label.setText('ZENIGATA').setColor('#ffd28b');
  }

  label.setVisible(true).setAlpha(.15);
  s.tweens.add({ targets: label, alpha: .72, duration: 110, yoyo: true, repeat: 1 });
  return true;
}

function onStop(reelIndex, complete) {
  if (!active || !ensure()) return false;
  const s = scene();
  const { width, height } = s.scale;
  stoppedCount += 1;
  streak.clear().setVisible(true);

  if (active === 'LUPIN_ESCAPE') {
    streak.lineStyle(2, 0xffd65c, .45 + stoppedCount * .1);
    streak.lineBetween(8, 105 + stoppedCount * 19, width - 14, 88 + stoppedCount * 11);
  } else if (active === 'JIGEN_SHOT') {
    const y = 92 + stoppedCount * 27;
    streak.lineStyle(3, 0xfff6d6, .7); streak.lineBetween(24, y, width - 28, y - 13);
    s.cameras.main.flash(42, 230, 220, 185, false);
  } else if (active === 'GOEMON_SLASH') {
    streak.lineStyle(3, 0xf9f7ee, .7);
    streak.lineBetween(28 + stoppedCount * 12, height - 40, width - 32, 75 + stoppedCount * 10);
  } else if (active === 'ZENIGATA_APPROACH') {
    const inset = 18 + stoppedCount * 10;
    streak.lineStyle(2, 0xff6d4b, .38 + stoppedCount * .12);
    streak.strokeRoundedRect(inset, 84 + stoppedCount * 4, width - inset * 2, height - 138 - stoppedCount * 8, 10);
  }

  if (complete) {
    label.setAlpha(1);
    s.tweens.add({ targets: [overlay, streak, label], alpha: 0, duration: 180, delay: 90, onComplete: clearMini });
  }
  return true;
}

core.addEventListener('spin-start', (event) => {
  const snapshot = event.detail.snapshot;
  const pattern = choosePattern(event.detail.spinId, snapshot.mode);
  if (!pattern || snapshot.raiunHighGamesRemaining > 0) return clearMini();
  begin(pattern);
});

core.addEventListener('reel-stop', (event) => onStop(event.detail.reelIndex, event.detail.complete === true));
core.addEventListener('mode-enter', () => clearMini());
core.addEventListener('raiun-high-enter', () => clearMini());
core.addEventListener('spin-end', () => {
  if (stoppedCount >= 3) return;
  clearMini();
});

app.normalMiniPresentationPolicy = NORMAL_MINI_PRESENTATION_POLICY;
app.clearNormalMiniPresentation = clearMini;
