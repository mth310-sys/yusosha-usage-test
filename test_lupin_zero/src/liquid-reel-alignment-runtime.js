import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const message = document.querySelector('#message');

export const LIQUID_REEL_ALIGNMENT_SPEC = Object.freeze({
  RED: Object.freeze({ label: '赤図柄揃い', symbol: '赤', destination: GameMode.LUPIN_BONUS, evidenceStatus: 'MULTI_SOURCE_MATCH' }),
  BLUE: Object.freeze({ label: '青図柄揃い', symbol: '青', destination: GameMode.RAIUN_MODE, evidenceStatus: 'MULTI_SOURCE_MATCH' }),
  SEVEN: Object.freeze({ label: '7揃い', symbol: '7', destination: GameMode.GOLDEN_TIME, evidenceStatus: 'MULTI_SOURCE_MATCH' })
});

function scene() { return app.game.scene.getScene('LupinView'); }

function drawAlignment(kind, spec) {
  const view = scene();
  if (!view?.add) return false;
  view.liquidAlignmentLayer?.destroy?.(true);
  const container = view.add.container(0, 0).setDepth(45);
  const { width, height } = view.scale;
  const bg = view.add.graphics();
  const tone = kind === 'RED' ? 0xb51420 : kind === 'BLUE' ? 0x176bd1 : 0xd49c18;
  bg.fillStyle(0x000000, 0.74); bg.fillRoundedRect(24, 82, width - 48, 108, 16);
  bg.lineStyle(3, tone, 0.95); bg.strokeRoundedRect(24, 82, width - 48, 108, 16);
  const symbols = [-1, 0, 1].map((offset) => view.add.text(width / 2 + offset * 72, 128, spec.symbol, {
    fontFamily: 'Arial Black, sans-serif', fontSize: kind === 'SEVEN' ? '42px' : '30px', color: '#ffffff', stroke: '#000000', strokeThickness: 5
  }).setOrigin(.5));
  const label = view.add.text(width / 2, 170, spec.label, { fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#ffe891', stroke: '#000000', strokeThickness: 4 }).setOrigin(.5);
  container.add([bg, ...symbols, label]);
  view.liquidAlignmentLayer = container;
  symbols.forEach((node, index) => { node.setScale(.3); view.tweens.add({ targets: node, scale: 1, duration: 130, delay: index * 55, ease: 'Back.Out' }); });
  view.cameras.main.flash(kind === 'SEVEN' ? 180 : 110, kind === 'BLUE' ? 60 : 255, kind === 'RED' ? 45 : 220, kind === 'BLUE' ? 255 : 80, false);
  view.time.delayedCall(780, () => { if (view.liquidAlignmentLayer === container) view.liquidAlignmentLayer = null; container.destroy(true); });
  return true;
}

function showAlignment(kind) {
  const spec = LIQUID_REEL_ALIGNMENT_SPEC[kind];
  if (!spec) return false;
  drawAlignment(kind, spec);
  core.emit('liquid-reel-aligned', { kind, label: spec.label, destination: spec.destination, evidenceStatus: spec.evidenceStatus });
  if (message) message.textContent = `${spec.label} — ${spec.destination}`;
  return spec;
}

function routeAlignment(kind) {
  const spec = showAlignment(kind);
  if (!spec) return false;
  if (spec.destination === GameMode.LUPIN_BONUS) return typeof app.enterLupinBonus === 'function' ? app.enterLupinBonus('LIQUID_REEL_RED_ALIGNED') : false;
  if (spec.destination === GameMode.RAIUN_MODE) {
    const entered = core.enterMode(GameMode.RAIUN_MODE, 20, spec.evidenceStatus);
    if (entered) core.emit('liquid-reel-destination-entered', { kind, destination: GameMode.RAIUN_MODE, evidenceStatus: spec.evidenceStatus });
    return entered;
  }
  if (spec.destination === GameMode.GOLDEN_TIME) {
    const entered = typeof app.enterGoldenTime === 'function' ? Boolean(app.enterGoldenTime()) : false;
    if (entered) core.emit('liquid-reel-destination-entered', { kind, destination: GameMode.GOLDEN_TIME, evidenceStatus: spec.evidenceStatus });
    return entered;
  }
  return false;
}

core.addEventListener('raiun-high-game-resolved', (event) => {
  if (event.detail.hit) showAlignment('BLUE');
});
core.addEventListener('raiun-mode-art-success', () => {
  showAlignment('SEVEN');
});

app.showLiquidReelAlignment = showAlignment;
app.resolveLiquidReelAlignment = routeAlignment;
app.liquidReelAlignmentSpec = LIQUID_REEL_ALIGNMENT_SPEC;
