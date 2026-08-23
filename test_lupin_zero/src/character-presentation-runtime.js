import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  usesExternalImages: false,
  exactCharacterArtworkReproduced: false,
  exactRealMachineSceneTimingVerified: false,
  note: 'Abstract vector silhouettes communicate character roles without claiming exact character artwork or altering outcomes.'
});

let group = null;
let figures = {};
let caption = null;

function scene() { return app.game.scene.getScene('LupinView'); }

function makeFigure(s, x, y, key, tone, accentTone, accessory = 'NONE') {
  const container = s.add.container(x, y).setDepth(1.15).setAlpha(.82);
  const body = s.add.graphics();
  body.fillStyle(tone, .95);
  body.fillEllipse(0, -26, 18, 22);
  body.fillRoundedRect(-10, -17, 20, 36, 7);
  body.fillTriangle(-9, 8, -18, 35, -4, 20);
  body.fillTriangle(9, 8, 18, 35, 4, 20);
  body.lineStyle(4, accentTone, .9);
  body.lineBetween(-8, -8, -22, 10);
  body.lineBetween(8, -8, 22, 10);

  const prop = s.add.graphics();
  prop.lineStyle(3, accentTone, .95);
  if (accessory === 'GUN') {
    prop.lineBetween(19, 8, 31, 3); prop.lineBetween(31, 3, 34, 4);
  } else if (accessory === 'SWORD') {
    prop.lineBetween(14, 12, 30, -18); prop.lineStyle(1, 0xf4f1df, .95); prop.lineBetween(30, -18, 34, -25);
  } else if (accessory === 'CUFF') {
    prop.strokeCircle(22, 9, 5); prop.strokeCircle(31, 9, 5); prop.lineBetween(27, 9, 26, 9);
  } else if (accessory === 'TIE') {
    prop.fillStyle(accentTone, .95); prop.fillTriangle(0, -10, -4, 6, 4, 6);
  }

  const tag = s.add.text(0, 43, key, { fontFamily:'Arial Black, sans-serif', fontSize:'8px', color:'#ffffff', stroke:'#000000', strokeThickness:3 }).setOrigin(.5);
  container.add([body, prop, tag]);
  container.setVisible(false);
  return container;
}

function ensure() {
  const s = scene();
  if (!s?.add) return false;
  if (group) return true;
  const { width, height } = s.scale;
  group = s.add.container(0, 0).setDepth(1.15);
  figures.lupin = makeFigure(s, width * .30, height * .57, 'L', 0x8d161d, 0xf4d06b, 'TIE');
  figures.jigen = makeFigure(s, width * .48, height * .60, 'J', 0x20252c, 0xc3c7ca, 'GUN');
  figures.goemon = makeFigure(s, width * .66, height * .58, 'G', 0x2d3a55, 0xece5d6, 'SWORD');
  figures.zenigata = makeFigure(s, width * .78, height * .56, 'Z', 0x5d4330, 0xf1c86c, 'CUFF');
  Object.values(figures).forEach(f => group.add(f));
  caption = s.add.text(width/2, height-58, '', { fontFamily:'Arial Black, sans-serif', fontSize:'10px', color:'#f4dd8b', stroke:'#000', strokeThickness:3 }).setOrigin(.5).setDepth(1.2).setVisible(false);
  return true;
}

function hideAll() {
  if (!ensure()) return false;
  Object.values(figures).forEach(f => f.setVisible(false));
  caption.setVisible(false);
  return true;
}

function showNormal(snapshot = core.snapshot()) {
  if (!hideAll()) return false;
  if (snapshot.mode !== GameMode.NORMAL || (snapshot.raiunHighGamesRemaining ?? 0) > 0) return false;
  figures.lupin.setVisible(true).setAlpha(.78);
  figures.jigen.setVisible(true).setAlpha(.48);
  figures.goemon.setVisible(true).setAlpha(.48);
  caption.setText('ESCAPE').setVisible(true).setAlpha(.38);
  return true;
}

function showWanted() {
  if (!hideAll()) return false;
  const s = scene();
  figures.lupin.setVisible(true).setAlpha(.82).setX(s.scale.width * .28);
  figures.zenigata.setVisible(true).setAlpha(.92).setX(s.scale.width * .78);
  caption.setText('CHASE').setVisible(true).setAlpha(.72);
  s.tweens.add({ targets: figures.zenigata, x: '-=10', duration: 320, yoyo: true, repeat: -1, ease:'Sine.InOut' });
  return true;
}

function showRaiun() {
  if (!hideAll()) return false;
  figures.lupin.setVisible(true).setAlpha(.52);
  figures.jigen.setVisible(true).setAlpha(.35);
  figures.goemon.setVisible(true).setAlpha(.35);
  caption.setText('STORM').setVisible(true).setAlpha(.5);
  return true;
}

function showBonus() {
  if (!hideAll()) return false;
  figures.lupin.setVisible(true).setAlpha(.88);
  figures.jigen.setVisible(true).setAlpha(.7);
  figures.goemon.setVisible(true).setAlpha(.7);
  figures.zenigata.setVisible(true).setAlpha(.66);
  caption.setText('LUPIN BONUS').setVisible(true).setAlpha(.72);
  return true;
}

function draw(snapshot = core.snapshot()) {
  if (!ensure()) return false;
  if ([GameMode.GOLDEN_TIME, GameMode.TREASURE_RUSH, GameMode.EXTRA_BONUS, GameMode.GOLD_RUSH, GameMode.LEGEND_GATE].includes(snapshot.mode)) return hideAll();
  if (snapshot.mode === GameMode.WANTED_CHANCE) return showWanted();
  if (snapshot.mode === GameMode.RAIUN_MODE || (snapshot.mode === GameMode.NORMAL && (snapshot.raiunHighGamesRemaining ?? 0) > 0)) return showRaiun();
  if (snapshot.mode === GameMode.LUPIN_BONUS) return showBonus();
  if ([GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(snapshot.mode)) return hideAll();
  return showNormal(snapshot);
}

function pulseHero(label = 'LUPIN') {
  if (!ensure()) return false;
  const s = scene();
  const target = figures.lupin;
  target.setVisible(true).setAlpha(1).setScale(1);
  caption.setText(label).setVisible(true).setAlpha(.95);
  s.tweens.add({ targets: target, scale: 1.18, alpha: .7, duration: 120, yoyo: true, ease:'Quad.Out' });
  return true;
}

['mode-enter','mode-exit','raiun-high-enter','raiun-high-exhausted','lupin-bonus-game-settled'].forEach(type => core.addEventListener(type, e => draw(e.detail.snapshot)));
core.addEventListener('change', e => draw(e.detail.snapshot));
core.addEventListener('chance-zone-success', () => pulseHero('CHANCE'));
core.addEventListener('raiun-mode-art-success', () => pulseHero('7 ALIGN'));

const s = scene();
if (s?.sys?.isActive()) draw();
else s?.events?.once('create', () => draw());

app.refreshCharacterPresentation = draw;
app.pulseCharacterPresentation = pulseHero;
app.characterPresentationPolicy = POLICY;
