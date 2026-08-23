const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = app.game.scene.getScene('LupinView');

export const REEL_SYMBOL_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  imageAssetsRequired: false,
  exactArtClaimed: false,
  exactStripClaimed: false,
  middleRowOnly: true,
  affectsGameLogic: false
});

const CENTERS = Object.freeze([
  Object.freeze({ x: 79, y: 139 }),
  Object.freeze({ x: 170, y: 139 }),
  Object.freeze({ x: 261, y: 139 })
]);

function normalizeSymbol(symbol) {
  const raw = String(symbol ?? '').trim();
  if (raw === '7') return 'SEVEN';
  if (raw.toUpperCase() === 'BAR') return 'BAR';
  if (raw === '★') return 'STAR';
  if (raw === '◆') return 'DIAMOND';
  if (raw === '●') return 'ORB';
  if (raw === 'L' || raw === 'ルパン') return 'LUPIN';
  if (raw === 'R' || raw === '次元') return 'JIGEN';
  if (raw === '五エ門' || raw === '五ェ門') return 'GOEMON';
  return 'GENERIC';
}

function createLayer(index) {
  const center = CENTERS[index];
  const container = scene.add.container(center.x, center.y).setDepth(8).setVisible(false);
  const backing = scene.add.graphics();
  backing.fillStyle(0xf7f1e4, 0.98);
  backing.fillRoundedRect(-34, -19, 68, 38, 7);
  backing.lineStyle(1, 0x8b7350, 0.85);
  backing.strokeRoundedRect(-34, -19, 68, 38, 7);
  const art = scene.add.graphics();
  const label = scene.add.text(0, 0, '', {
    fontFamily: 'Arial Black, sans-serif',
    fontSize: '12px',
    color: '#2a1208',
    stroke: '#fff3d2',
    strokeThickness: 1
  }).setOrigin(.5);
  container.add([backing, art, label]);
  return { container, art, label };
}

const layers = [0, 1, 2].map(createLayer);

function drawSeven(art) {
  art.lineStyle(5, 0xd61f2c, 1);
  art.beginPath();
  art.moveTo(-17, -10); art.lineTo(16, -10); art.lineTo(-2, 13); art.strokePath();
  art.lineStyle(2, 0xffcf48, 1);
  art.beginPath();
  art.moveTo(-15, -7); art.lineTo(10, -7); art.lineTo(-3, 10); art.strokePath();
}
function drawBar(art) {
  art.fillStyle(0x141414, 1); art.fillRoundedRect(-24, -10, 48, 20, 4);
  art.lineStyle(2, 0xd9b248, 1); art.strokeRoundedRect(-24, -10, 48, 20, 4);
}
function drawStar(art) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? 16 : 7;
    points.push(new Phaser.Geom.Point(Math.cos(a) * r, Math.sin(a) * r));
  }
  art.fillStyle(0xe3b426, 1); art.fillPoints(points, true);
  art.lineStyle(2, 0x7f5510, 1); art.strokePoints(points, true, true);
}
function drawDiamond(art) {
  art.fillStyle(0x238ac4, 1);
  art.fillTriangle(0, -16, -18, 0, 0, 16);
  art.fillTriangle(0, -16, 18, 0, 0, 16);
  art.lineStyle(2, 0xd4efff, 1);
  art.strokeTriangle(0, -16, -18, 0, 0, 16);
  art.strokeTriangle(0, -16, 18, 0, 0, 16);
}
function drawOrb(art) {
  art.fillStyle(0xb51c24, 1); art.fillCircle(0, 0, 14);
  art.lineStyle(3, 0xf5cf56, 1); art.strokeCircle(0, 0, 14);
  art.fillStyle(0xffffff, 0.6); art.fillCircle(-5, -5, 4);
}
function drawCharacterBadge(art, letter, tone) {
  art.fillStyle(tone, 1); art.fillCircle(0, 0, 16);
  art.lineStyle(2, 0xf0d37a, 1); art.strokeCircle(0, 0, 16);
  return letter;
}

function renderSymbol(index, symbol) {
  const layer = layers[index];
  if (!layer) return false;
  const kind = normalizeSymbol(symbol);
  layer.art.clear();
  layer.label.setText('');
  if (kind === 'SEVEN') drawSeven(layer.art);
  else if (kind === 'BAR') { drawBar(layer.art); layer.label.setText('BAR').setColor('#f3d57c'); }
  else if (kind === 'STAR') drawStar(layer.art);
  else if (kind === 'DIAMOND') drawDiamond(layer.art);
  else if (kind === 'ORB') drawOrb(layer.art);
  else if (kind === 'LUPIN') layer.label.setText(drawCharacterBadge(layer.art, 'L', 0x9b171d)).setColor('#ffe46b');
  else if (kind === 'JIGEN') layer.label.setText(drawCharacterBadge(layer.art, 'J', 0x202735)).setColor('#dbe8ff');
  else if (kind === 'GOEMON') layer.label.setText(drawCharacterBadge(layer.art, 'G', 0x2d5f48)).setColor('#e9f7dd');
  else layer.label.setText(String(symbol ?? '?').slice(0, 4)).setColor('#2a1208');
  layer.container.setVisible(true).setScale(0.82).setAlpha(0);
  scene.tweens.add({ targets: layer.container, scale: 1, alpha: 1, duration: 110, ease: 'Back.Out' });
  const centerText = scene.reelRows?.[index]?.[1];
  if (centerText) centerText.setVisible(false);
  return true;
}

function clearForSpin(index = null) {
  const targets = index == null ? layers : [layers[index]].filter(Boolean);
  targets.forEach((layer, i) => {
    layer.container.setVisible(false);
  });
  if (index == null) scene.reelRows?.forEach((rows) => rows?.[1]?.setVisible(true));
  else scene.reelRows?.[index]?.[1]?.setVisible(true);
}

core.addEventListener('spin-start', () => clearForSpin());
core.addEventListener('reel-stop', (event) => {
  const index = event.detail.reelIndex;
  const symbol = scene.reelRows?.[index]?.[1]?.text ?? '';
  queueMicrotask(() => {
    const finalSymbol = scene.reelRows?.[index]?.[1]?.text ?? symbol;
    renderSymbol(index, finalSymbol);
  });
});

app.renderVectorReelSymbol = renderSymbol;
app.clearVectorReelSymbols = clearForSpin;
app.reelSymbolPresentationPolicy = REEL_SYMBOL_PRESENTATION_POLICY;
