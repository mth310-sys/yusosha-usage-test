import { MachineCore, MachineState } from './machine-core.js';
import { LupinView } from './phaser-view.js';

const core = new MachineCore({ credit: 50, maxBet: 3 });

const ui = {
  credit: document.querySelector('#creditValue'),
  bet: document.querySelector('#betValue'),
  state: document.querySelector('#stateValue'),
  message: document.querySelector('#message'),
  betBtn: document.querySelector('#betBtn'),
  maxBetBtn: document.querySelector('#maxBetBtn'),
  startBtn: document.querySelector('#startBtn'),
  stopBtns: [...document.querySelectorAll('.stop')]
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 340,
  height: 260,
  backgroundColor: '#05070d',
  transparent: false,
  antialias: true,
  pixelArt: false,
  roundPixels: false,
  scene: [LupinView],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, powerPreference: 'high-performance' }
});

function scene() {
  return game.scene.getScene('LupinView');
}

function render(snapshot = core.snapshot()) {
  ui.credit.textContent = snapshot.credit;
  ui.bet.textContent = snapshot.bet;
  ui.state.textContent = snapshot.state;
  const busy = [MachineState.SPINNING, MachineState.STOPPING].includes(snapshot.state);
  ui.betBtn.disabled = busy || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.maxBetBtn.disabled = busy || snapshot.credit <= 0 || snapshot.bet >= 3;
  ui.startBtn.disabled = snapshot.state !== MachineState.READY;
  ui.stopBtns.forEach((button, i) => {
    button.disabled = !busy || snapshot.stopped[i];
  });
}

core.addEventListener('change', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = event.detail.snapshot.bet === 3 ? 'MAX BET — START可能' : 'BET受付中';
});

core.addEventListener('spin-start', (event) => {
  render(event.detail.snapshot);
  ui.message.textContent = 'SPIN — STOPボタンで停止';
  scene().startSpin();
});

core.addEventListener('reel-stop', (event) => {
  scene().setReelRunning(event.detail.reelIndex, false);
  render(event.detail.snapshot);
});

core.addEventListener('spin-end', (event) => {
  const finalIndex = event.detail.snapshot.stopped.findIndex(Boolean);
  void finalIndex;
  render(event.detail.snapshot);
  scene().endSpin();
  ui.message.textContent = '研究用1ゲーム完了 — 実機固有抽選は未接続';
});

ui.betBtn.addEventListener('click', () => core.betOne());
ui.maxBetBtn.addEventListener('click', () => core.maxBetNow());
ui.startBtn.addEventListener('click', () => core.start());
ui.stopBtns.forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.reel);
    if (core.stop(index)) scene().setReelRunning(index, false);
  });
});

render();
window.__LUPIN_ZERO__ = { core, game };
