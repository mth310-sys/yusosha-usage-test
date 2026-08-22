import { RESEARCH_SYMBOLS } from './research-reel-engine.js';

export class LupinView extends Phaser.Scene {
  constructor() {
    super('LupinView');
    this.reels = [];
    this.running = [false, false, false];
    this.phase = [0, 0, 0];
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05070d, 0x05070d, 0x181006, 0x181006, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 18, 'LUPIN SYSTEM // ZERO', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '16px', color: '#f4d16b'
    }).setOrigin(.5, 0);

    this.add.text(width / 2, 45, 'PHASER 4 RENDER LAYER', {
      fontFamily: 'monospace', fontSize: '9px', color: '#8d96a6', letterSpacing: 2
    }).setOrigin(.5, 0);

    const reelY = 132;
    const reelW = 82;
    const gap = 8;
    const startX = width / 2 - (reelW * 3 + gap * 2) / 2;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (reelW + gap);
      const panel = this.add.graphics();
      panel.fillStyle(0xf1ead8, 1);
      panel.fillRoundedRect(x, reelY - 48, reelW, 108, 8);
      panel.lineStyle(3, 0x4d3c20, 1);
      panel.strokeRoundedRect(x, reelY - 48, reelW, 108, 8);

      const symbol = this.add.text(x + reelW / 2, reelY + 5, RESEARCH_SYMBOLS[i], {
        fontFamily: 'Arial Black, sans-serif', fontSize: '30px', color: '#9f1118', stroke: '#2a1408', strokeThickness: 1
      }).setOrigin(.5);
      this.reels.push(symbol);
    }

    this.status = this.add.text(width / 2, height - 34, 'VERIFIED LOGIC PORT: NOT LOADED', {
      fontFamily: 'monospace', fontSize: '9px', color: '#d3b865'
    }).setOrigin(.5);

    this.events.emit('view-ready');
  }

  setReelRunning(index, running, stopSymbol = null) {
    this.running[index] = running;
    if (!running && stopSymbol !== null) {
      this.reels[index].setText(stopSymbol).setScale(1.08);
      this.tweens.add({ targets: this.reels[index], scale: 1, duration: 120, ease: 'Back.Out' });
      this.cameras.main.shake(70, 0.0025);
    }
  }

  startSpin() {
    this.running = [true, true, true];
    this.status.setText('RESEARCH SPIN // GAME-SPECIFIC RNG DISABLED');
  }

  endSpin() {
    this.status.setText('IDLE // WAITING VERIFIED SYSTEM PORT');
    this.cameras.main.flash(90, 255, 201, 72, false);
  }

  update(_, delta) {
    for (let i = 0; i < this.reels.length; i++) {
      if (!this.running[i]) continue;
      this.phase[i] += delta * (0.02 + i * 0.002);
      const index = Math.floor(this.phase[i]) % RESEARCH_SYMBOLS.length;
      this.reels[i].setText(RESEARCH_SYMBOLS[index]);
    }
  }
}
