const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const machine = document.querySelector('.machine');
const lcdShell = document.querySelector('.lcd-shell');
const message = document.querySelector('#message');
const phaseBadge = document.querySelector('#phaseBadge');
const scene = () => app.game.scene.getScene('LupinView');

export const GOLD_RUSH_TRANSITION_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  changesModeRoute: false,
  changesStockAward: false,
  routes: Object.freeze([
    'CONTINUE_GOLD_RUSH',
    'RETURN_EXTRA_BONUS',
    'GT_CONTINUATION_BATTLE'
  ]),
  exactRealMachineTransitionTimingVerified: false
});

let clearTimer = null;

function clearPresentation() {
  if (clearTimer) window.clearTimeout(clearTimer);
  clearTimer = null;
  if (machine) delete machine.dataset.goldRushTransition;
  if (lcdShell) delete lcdShell.dataset.goldRushTransition;
}

function flashScene(route) {
  const s = scene();
  if (!s?.cameras?.main) return;
  if (route === 'CONTINUE_GOLD_RUSH') {
    s.cameras.main.flash(80, 255, 45, 45, false);
    s.cameras.main.shake(70, .0022);
  } else if (route === 'RETURN_EXTRA_BONUS') {
    s.cameras.main.flash(105, 255, 208, 82, false);
  } else {
    s.cameras.main.flash(130, 255, 255, 255, false);
    s.cameras.main.shake(110, .0032);
  }
}

function showTransition(detail = {}) {
  const route = detail.route;
  if (!GOLD_RUSH_TRANSITION_PRESENTATION_POLICY.routes.includes(route)) return false;
  clearPresentation();
  if (machine) machine.dataset.goldRushTransition = route.toLowerCase();
  if (lcdShell) lcdShell.dataset.goldRushTransition = route.toLowerCase();
  flashScene(route);

  if (route === 'CONTINUE_GOLD_RUSH') {
    if (phaseBadge) phaseBadge.textContent = 'GOLD RUSH CONTINUE';
    if (message) message.textContent = `GOLD RUSH 継続 — STOCK ${detail.stockCount ?? '-'}`;
  } else if (route === 'RETURN_EXTRA_BONUS') {
    if (phaseBadge) phaseBadge.textContent = 'EXTRA BONUS';
    if (message) message.textContent = `EXTRA BONUSへ復帰 — 残り${detail.returnExtraBonusGames ?? '-'}G`;
  } else {
    if (phaseBadge) phaseBadge.textContent = 'GT BATTLE';
    if (message) message.textContent = 'GOLD RUSH END — 継続バトルへ';
  }

  clearTimer = window.setTimeout(clearPresentation, route === 'GT_CONTINUATION_BATTLE' ? 1050 : 820);
  core.emit('gold-rush-transition-presentation-shown', {
    route,
    evidenceStatus: GOLD_RUSH_TRANSITION_PRESENTATION_POLICY.evidenceStatus,
    presentationOnly: true
  });
  return true;
}

core.addEventListener('gold-rush-transition-presentation', (event) => showTransition(event.detail));
core.addEventListener('mode-enter', (event) => {
  if (!['GOLD_RUSH', 'EXTRA_BONUS', 'GOLDEN_TIME'].includes(event.detail.mode)) clearPresentation();
});

app.goldRushTransitionPresentationPolicy = GOLD_RUSH_TRANSITION_PRESENTATION_POLICY;
app.showGoldRushTransitionPresentation = showTransition;
app.clearGoldRushTransitionPresentation = clearPresentation;
