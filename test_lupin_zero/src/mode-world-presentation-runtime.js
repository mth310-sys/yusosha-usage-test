import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  usesExternalImages: false,
  exactRealMachineSceneCompositionVerified: false,
  note: 'Vector-only atmospheric backgrounds translate mode meaning into a production scene without changing outcomes.'
});

let layer = null;
let skyline = null;
let accent = null;
let modeText = null;
let lightning = null;
let scanTween = null;

function scene() { return app.game.scene.getScene('LupinView'); }

function ensureLayer() {
  const s = scene();
  if (!s?.add) return false;
  if (layer) return true;
  const { width, height } = s.scale;
  layer = s.add.graphics().setDepth(0.55);
  skyline = s.add.graphics().setDepth(0.6);
  accent = s.add.graphics().setDepth(0.65);
  lightning = s.add.graphics().setDepth(0.7);
  modeText = s.add.text(width - 16, height - 48, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '11px', color: '#ffffff',
    stroke: '#000000', strokeThickness: 3, align: 'right'
  }).setOrigin(1, 1).setAlpha(.55).setDepth(0.75);
  return true;
}

function clear() {
  if (!ensureLayer()) return false;
  layer.clear(); skyline.clear(); accent.clear(); lightning.clear();
  modeText.setText('');
  if (scanTween) { scanTween.stop(); scanTween = null; }
  return true;
}

function drawNormal() {
  if (!clear()) return false;
  const s = scene();
  const { width, height } = s.scale;
  layer.fillGradientStyle(0x07111e,0x111927,0x351513,0x120708,.64);
  layer.fillRect(0,0,width,height);
  skyline.fillStyle(0x05070a,.86);
  const buildings = [[0,104,32,80],[27,87,42,97],[63,116,30,68],[88,74,48,110],[131,101,35,83],[160,65,54,119],[207,96,35,88],[237,77,50,107],[282,110,35,74],[311,83,29,101]];
  buildings.forEach(([x,y,w,h],i)=>{
    skyline.fillRect(x,y,w,h);
    skyline.fillStyle(i%2?0x0a0b0d:0x05070a,.86);
  });
  accent.fillStyle(0xe2a64b,.20);
  for(let x=12;x<width;x+=38) accent.fillRect(x,122+(x%3)*10,4,3);
  modeText.setText('CITY / ESCAPE');
  return true;
}

function drawWanted() {
  if (!drawNormal()) return false;
  const s = scene();
  const { width, height } = s.scale;
  accent.lineStyle(2,0xff443d,.36);
  for(let y=82;y<height-42;y+=20) accent.lineBetween(8,y,width-8,y);
  accent.lineStyle(2,0xffa055,.26);
  accent.strokeRoundedRect(14,90,width-28,height-150,10);
  modeText.setText('WANTED / ALERT');
  scanTween = s.tweens.add({ targets: modeText, alpha: .95, duration: 380, yoyo: true, repeat: -1 });
  return true;
}

function drawRaiun(strong=false) {
  if (!clear()) return false;
  const s = scene();
  const { width, height } = s.scale;
  layer.fillGradientStyle(0x03050d,0x0a1028,0x20294f,0x080814,.78);
  layer.fillRect(0,0,width,height);
  skyline.fillStyle(0x202640,.58);
  [[20,92,88,28],[86,75,112,38],[184,96,128,30],[240,67,86,35]].forEach(([x,y,w,h])=>skyline.fillEllipse(x+w/2,y+h/2,w,h));
  accent.lineStyle(1,0x8290ff,.22);
  for(let y=90;y<210;y+=25) accent.lineBetween(0,y,width,y+8);
  if (strong) {
    lightning.lineStyle(3,0xeaf2ff,.9);
    lightning.beginPath(); lightning.moveTo(245,80); lightning.lineTo(216,122); lightning.lineTo(233,120); lightning.lineTo(198,174); lightning.strokePath();
    s.tweens.add({ targets: lightning, alpha: .18, duration: 110, yoyo: true, repeat: 1 });
  }
  modeText.setText(strong ? 'RAIUN MODE / 7 ALIGN' : 'RAIUN HIGH');
  return true;
}

function drawCz(mode) {
  if (!clear()) return false;
  const s = scene();
  const { width, height } = s.scale;
  const fujiko = mode === GameMode.FUJIKO_ZONE;
  layer.fillGradientStyle(fujiko?0x24071e:0x19070a,fujiko?0x481434:0x431013,0x080607,0x030303,.72);
  layer.fillRect(0,0,width,height);
  accent.lineStyle(2,fujiko?0xff76d8:0xff6a5a,.25);
  accent.strokeCircle(width/2,145,75); accent.strokeCircle(width/2,145,96);
  modeText.setText(fujiko ? 'FUJIKO ZONE' : 'ODOROBO ZONE');
  return true;
}

function drawBonus() {
  if (!clear()) return false;
  const s=scene(); const {width,height}=s.scale;
  layer.fillGradientStyle(0x271004,0x4a2208,0x120604,0x050303,.67); layer.fillRect(0,0,width,height);
  accent.lineStyle(2,0xffcf62,.22); for(let x=24;x<width;x+=44) accent.lineBetween(x,76,x-34,height-48);
  modeText.setText('LUPIN BONUS');
  return true;
}

function hideForGt() { clear(); modeText?.setVisible(false); }

function draw(snapshot=core.snapshot()) {
  if (!ensureLayer()) return false;
  modeText.setVisible(true);
  if ([GameMode.GOLDEN_TIME,GameMode.TREASURE_RUSH,GameMode.EXTRA_BONUS,GameMode.GOLD_RUSH,GameMode.LEGEND_GATE].includes(snapshot.mode)) return hideForGt();
  if (snapshot.mode===GameMode.WANTED_CHANCE) return drawWanted();
  if (snapshot.mode===GameMode.RAIUN_MODE) return drawRaiun(true);
  if (snapshot.mode===GameMode.NORMAL && (snapshot.raiunHighGamesRemaining??0)>0) return drawRaiun(false);
  if ([GameMode.ODOROBO_ZONE,GameMode.FUJIKO_ZONE].includes(snapshot.mode)) return drawCz(snapshot.mode);
  if (snapshot.mode===GameMode.LUPIN_BONUS) return drawBonus();
  return drawNormal();
}

['mode-enter','mode-exit','raiun-high-enter','raiun-high-exhausted','raiun-mode-game-settled','lupin-bonus-game-settled'].forEach(type=>core.addEventListener(type,e=>draw(e.detail.snapshot)));
core.addEventListener('change', e=>draw(e.detail.snapshot));

const s=scene();
if (s?.sys?.isActive()) draw();
else s?.events?.once('create',()=>draw());

app.refreshModeWorldPresentation = draw;
app.modeWorldPresentationPolicy = POLICY;
