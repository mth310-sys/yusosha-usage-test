import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = () => app.game.scene.getScene('LupinView');

export const NORMAL_MINI_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  selectionSource: 'SPIN_ID_ONLY',
  resultSource: 'RESOLVED_EVENT_ONLY',
  exactRealMachineOccurrenceRatesVerified: false,
  exactRealMachineTimingVerified: false,
  exactRealMachineExpectationValuesInvented: false,
  patterns: Object.freeze(['LUPIN_ESCAPE', 'JIGEN_SHOT', 'GOEMON_SLASH', 'ZENIGATA_APPROACH']),
  resultClasses: Object.freeze(['NORMAL', 'PAY', 'RARE', 'CHANCE']),
  presentationLevels: Object.freeze(['QUIET', 'MEDIUM', 'STRONG', 'CONTRADICTION']),
  contradictionRule: 'A weak-looking Lupin escape that resolves to RARE is treated as a presentation-only contradiction reveal.'
});

const PATTERNS = NORMAL_MINI_PRESENTATION_POLICY.patterns;
let active = null;
let stoppedCount = 0;
let overlay = null;
let streak = null;
let label = null;
let clearTimer = null;

function ensure() {
  const s = scene();
  if (!s?.add) return false;
  if (overlay) return true;
  const { width } = s.scale;
  overlay = s.add.graphics().setDepth(1.65).setVisible(false);
  streak = s.add.graphics().setDepth(1.7).setVisible(false);
  label = s.add.text(width / 2, 88, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '12px', color: '#fff2ac',
    stroke: '#000000', strokeThickness: 4, align: 'center'
  }).setOrigin(.5).setDepth(1.75).setVisible(false);
  return true;
}

function cancelClearTimer() {
  if (clearTimer?.remove) clearTimer.remove(false);
  clearTimer = null;
}

function clearMini() {
  if (!ensure()) return false;
  cancelClearTimer();
  overlay.clear().setVisible(false).setAlpha(1);
  streak.clear().setVisible(false).setAlpha(1);
  label.setText('').setVisible(false).setAlpha(1).setScale(1);
  active = null;
  stoppedCount = 0;
  return true;
}

function choosePattern(spinId, mode) {
  if (mode === GameMode.WANTED_CHANCE) return 'ZENIGATA_APPROACH';
  if (mode !== GameMode.NORMAL) return null;
  return PATTERNS[Math.abs(Number(spinId) || 0) % PATTERNS.length];
}

function resolvePresentationLevel(pattern, resultClass) {
  if (pattern === 'LUPIN_ESCAPE' && resultClass === 'RARE') return 'CONTRADICTION';
  if (resultClass === 'RARE' || resultClass === 'CHANCE') return 'STRONG';
  if (resultClass === 'PAY') return 'MEDIUM';
  return 'QUIET';
}

function begin(pattern) {
  if (!ensure() || !pattern) return false;
  const s = scene();
  const { width, height } = s.scale;
  cancelClearTimer();
  active = pattern;
  stoppedCount = 0;
  overlay.clear().setVisible(true).setAlpha(1);
  streak.clear().setVisible(true).setAlpha(1);

  if (pattern === 'LUPIN_ESCAPE') {
    overlay.fillStyle(0xb21722, .08); overlay.fillTriangle(0, height, width * .55, 76, width, height);
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

  label.setVisible(true).setAlpha(.15).setScale(1);
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
    streak.lineStyle(2, 0xffd65c, .35 + stoppedCount * .08);
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

  if (complete) label.setAlpha(1);
  return true;
}

function classifyNormalRole(role, creditDelta = 0) {
  if (role === 'PREMIUM' || role === 'LEGEND' || role === 'MB') return 'RARE';
  if (role === 'REPLAY') return 'NORMAL';
  if (Number(creditDelta) > 0) return 'PAY';
  return 'NORMAL';
}

function finish(resultClass = 'NORMAL', detail = {}) {
  if (!active || !ensure()) return false;
  const s = scene();
  const { width, height } = s.scale;
  const pattern = active;
  const level = resolvePresentationLevel(pattern, resultClass);
  cancelClearTimer();
  overlay.clear().setVisible(true).setAlpha(1);
  streak.clear().setVisible(true).setAlpha(1);

  const strong = level === 'STRONG' || level === 'CONTRADICTION';
  const contradiction = level === 'CONTRADICTION';
  const pay = level === 'MEDIUM';
  const roleLabel = detail.role === 'REPLAY' ? 'REPLAY' : detail.role === 'MB' ? 'MB' : pay ? `${detail.creditDelta ?? 0} PAY` : '';

  if (pattern === 'JIGEN_SHOT') {
    const tone = strong ? 0xffe68c : pay ? 0xffd46a : 0xd9dde0;
    streak.lineStyle(strong ? 5 : 3, tone, strong ? .95 : .68);
    streak.lineBetween(22, height * .61, width - 24, height * .42);
    streak.fillStyle(tone, strong ? .9 : .5); streak.fillCircle(width - 30, height * .42, strong ? 9 : 5);
    label.setText(strong ? 'HIT!' : roleLabel || 'SHOT').setColor(strong ? '#fff1a6' : '#e9edf0');
  } else if (pattern === 'GOEMON_SLASH') {
    const tone = strong ? 0xfff5a6 : 0xf7f3dc;
    streak.lineStyle(strong ? 6 : 3, tone, strong ? .95 : .64);
    streak.lineBetween(22, height - 38, width - 26, 72);
    if (strong) { streak.lineStyle(2, 0xffffff, .82); streak.lineBetween(54, height - 30, width - 58, 82); }
    label.setText(strong ? '一閃' : roleLabel || 'SLASH').setColor(strong ? '#fff7bd' : '#f5f2df');
  } else if (pattern === 'LUPIN_ESCAPE') {
    if (contradiction) {
      overlay.fillStyle(0x070707, .82); overlay.fillRect(0, 72, width, height - 72);
      streak.lineStyle(6, 0xfff1a0, .98); streak.lineBetween(0, height * .72, width, height * .35);
      streak.lineStyle(2, 0xffffff, .85); streak.lineBetween(0, height * .35, width, height * .72);
      label.setText('違和感 → CHANCE!').setColor('#fff7bf');
      app.pulseCharacterPresentation?.('CHANCE');
    } else {
      overlay.fillStyle(strong ? 0xd52029 : 0x9f1720, strong ? .24 : .10); overlay.fillTriangle(0, height, width * .62, 70, width, height);
      streak.lineStyle(strong ? 5 : 2, strong ? 0xffe878 : 0xffc95a, strong ? .9 : .45);
      streak.lineBetween(0, height * .70, width, height * .42);
      label.setText(strong ? 'CHANCE!' : roleLabel || 'ESCAPE').setColor(strong ? '#fff0a5' : '#ffe18a');
      if (strong) app.pulseCharacterPresentation?.('CHANCE');
    }
  } else {
    const escaped = strong || pay || detail.role === 'REPLAY';
    const inset = escaped ? 44 : 58;
    streak.lineStyle(strong ? 4 : 2, escaped ? 0xffd66f : 0xe05a44, strong ? .9 : .56);
    streak.strokeRoundedRect(inset, 94, width - inset * 2, height - 166, 10);
    label.setText(strong ? '突破!' : escaped ? (roleLabel || 'ESCAPE') : '追跡継続').setColor(strong ? '#fff0a0' : '#ffd28b');
  }

  label.setVisible(true).setAlpha(1).setScale(contradiction ? 1.16 : strong ? 1.08 : 1);
  if (strong) {
    s.cameras.main.flash(contradiction ? 150 : 90, 255, 222, 112, false);
    s.cameras.main.shake(contradiction ? 130 : 80, contradiction ? .0042 : .0028);
  }
  s.tweens.add({ targets: [overlay, streak, label], alpha: 0, duration: 220, delay: contradiction ? 420 : strong ? 250 : 150, onComplete: clearMini });
  core.emit('normal-mini-presentation-finished', { pattern, resultClass, presentationLevel: level, role: detail.role ?? null, evidenceStatus: NORMAL_MINI_PRESENTATION_POLICY.evidenceStatus });
  return true;
}

core.addEventListener('spin-start', (event) => {
  const snapshot = event.detail.snapshot;
  const pattern = choosePattern(event.detail.spinId, snapshot.mode);
  if (!pattern || snapshot.raiunHighGamesRemaining > 0) return clearMini();
  begin(pattern);
});

core.addEventListener('reel-stop', (event) => onStop(event.detail.reelIndex, event.detail.complete === true));
core.addEventListener('normal-role-settled', (event) => finish(classifyNormalRole(event.detail.role, event.detail.creditDelta), event.detail));
core.addEventListener('mode-enter', (event) => {
  const entered = event.detail.mode;
  if (active && [GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(entered)) return finish('CHANCE', { role: 'CHANCE_EYE' });
  clearMini();
});
core.addEventListener('raiun-high-enter', () => clearMini());
core.addEventListener('spin-end', () => {
  if (!active) return;
  if (stoppedCount < 3) return clearMini();
  const s = scene();
  cancelClearTimer();
  clearTimer = s.time.delayedCall(420, () => { if (active) finish('NORMAL', {}); });
});

app.normalMiniPresentationPolicy = NORMAL_MINI_PRESENTATION_POLICY;
app.resolveNormalMiniPresentationLevel = resolvePresentationLevel;
app.clearNormalMiniPresentation = clearMini;
app.finishNormalMiniPresentation = finish;
