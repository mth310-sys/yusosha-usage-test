import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const message = document.querySelector('#message');

export const LIQUID_REEL_ALIGNMENT_SPEC = Object.freeze({
  RED: Object.freeze({ label: '赤図柄揃い', destination: GameMode.LUPIN_BONUS, evidenceStatus: 'MULTI_SOURCE_MATCH' }),
  BLUE: Object.freeze({ label: '青図柄揃い', destination: GameMode.RAIUN_MODE, evidenceStatus: 'MULTI_SOURCE_MATCH' }),
  SEVEN: Object.freeze({ label: '7揃い', destination: GameMode.GOLDEN_TIME, evidenceStatus: 'MULTI_SOURCE_MATCH' })
});

function scene() { return app.game.scene.getScene('LupinView'); }

function showAlignment(kind) {
  const spec = LIQUID_REEL_ALIGNMENT_SPEC[kind];
  if (!spec) return false;
  scene().showLiquidReelAlignment?.(kind, spec.label);
  core.emit('liquid-reel-aligned', { kind, label: spec.label, destination: spec.destination, evidenceStatus: spec.evidenceStatus });
  if (message) message.textContent = `${spec.label} — ${spec.destination}`;
  return spec;
}

function routeAlignment(kind) {
  const spec = showAlignment(kind);
  if (!spec) return false;

  if (spec.destination === GameMode.LUPIN_BONUS) {
    return typeof app.enterLupinBonus === 'function' ? app.enterLupinBonus('LIQUID_REEL_RED_ALIGNED') : false;
  }
  if (spec.destination === GameMode.RAIUN_MODE) {
    const entered = core.enterMode(GameMode.RAIUN_MODE, 20, 'MULTI_SOURCE_MATCH');
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

app.showLiquidReelAlignment = showAlignment;
app.resolveLiquidReelAlignment = routeAlignment;
app.liquidReelAlignmentSpec = LIQUID_REEL_ALIGNMENT_SPEC;
