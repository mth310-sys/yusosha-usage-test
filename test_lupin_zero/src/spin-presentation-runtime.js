const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const scene = () => app.game.scene.getScene('LupinView');
let stoppedCount = 0;
let activeSpinId = null;

core.addEventListener('spin-start', (event) => {
  stoppedCount = 0;
  activeSpinId = event.detail.spinId;
});

core.addEventListener('reel-stop', (event) => {
  if (event.detail.spinId !== activeSpinId) return;
  stoppedCount += 1;
  scene().stopFeel(event.detail.reelIndex, stoppedCount >= 3 || event.detail.complete === true);
});

core.addEventListener('normal-role-settled', (event) => {
  const role = event.detail.role;
  if (role === 'REPLAY') scene().showSettlementFeel('REPLAY', 'normal');
  else if (role === 'MB') scene().showSettlementFeel('MB', 'rare');
  else if ((event.detail.creditDelta ?? 0) > 0) scene().showSettlementFeel(`${event.detail.creditDelta} PAY`, 'pay');
});

core.addEventListener('mb-followup-game-settled', (event) => scene().showSettlementFeel(`${event.detail.creditDelta ?? 10} PAY`, 'pay'));
core.addEventListener('chance-zone-success', () => scene().showSettlementFeel('SUCCESS', 'rare'));
core.addEventListener('raiun-mode-art-success', () => scene().showSettlementFeel('7 ALIGN', 'special'));
core.addEventListener('lupin-bonus-success', () => scene().showSettlementFeel('GOLDEN TIME', 'special'));
core.addEventListener('golden-time-treasure-acquired', (event) => scene().showSettlementFeel(`+${Math.round((event.detail.added ?? 0) / 10000)}万T`, event.detail.extraBonusReached ? 'special' : 'pay'));
core.addEventListener('extra-bonus-gold-rush-hit', () => scene().showSettlementFeel('GOLD RUSH', 'special'));
core.addEventListener('treasure-hunt-success', () => scene().showSettlementFeel('TREASURE HUNT SUCCESS', 'rare'));

app.spinPresentationPolicy = Object.freeze({
  evidenceStatus: 'PRESENTATION_ONLY',
  affectsGameLogic: false,
  exactPhysicalTimingVerified: false,
  sequence: Object.freeze(['SPIN_START','REEL_STOP_1','REEL_STOP_2','REEL_STOP_3','SPIN_END','SETTLEMENT','MODE_PRESENTATION'])
});
