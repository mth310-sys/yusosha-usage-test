import { RESEARCH_SYMBOLS } from './research-reel-engine.js';

const CHANCE_EYE_VIEW = Object.freeze({
  CHANCE_EYE_BLUE: Object.freeze({ label: 'BLUE CHANCE EYE', color: 0x2b8cff, textColor: '#8fc7ff' }),
  CHANCE_EYE_RED: Object.freeze({ label: 'RED CHANCE EYE', color: 0xe52c39, textColor: '#ff9ba2' }),
  CHANCE_EYE_GOLD: Object.freeze({ label: 'GOLD 7 CHANCE EYE', color: 0xffc83d, textColor: '#ffe99a' })
});

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

    this.chanceEyePanel = this.add.graphics().setDepth(20).setVisible(false);
    this.chanceEyeText = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(.5).setDepth(21).setVisible(false);
    this.chanceEyeMeta = this.add.text(width / 2, height / 2 + 34, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff', align: 'center'
    }).setOrigin(.5).setDepth(21).setVisible(false);

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
    this.clearChanceEye();
    this.status.setText('RESEARCH SPIN // GAME-SPECIFIC RNG DISABLED');
  }

  endSpin() {
    this.status.setText('IDLE // WAITING VERIFIED SYSTEM PORT');
    this.cameras.main.flash(90, 255, 201, 72, false);
  }

  showChanceEye(cue, detail = {}) {
    const view = CHANCE_EYE_VIEW[cue];
    if (!view) return false;
    const { width, height } = this.scale;
    this.chanceEyePanel.clear();
    this.chanceEyePanel.fillStyle(view.color, 0.28);
    this.chanceEyePanel.fillRoundedRect(18, 70, width - 36, height - 112, 14);
    this.chanceEyePanel.lineStyle(3, view.color, 0.95);
    this.chanceEyePanel.strokeRoundedRect(18, 70, width - 36, height - 112, 14);
    this.chanceEyePanel.setVisible(true);
    this.chanceEyeText.setText(view.label).setColor(view.textColor).setVisible(true);
    const denominator = Number.isFinite(detail.denominator) ? `1/${detail.denominator}` : 'rate unresolved';
    this.chanceEyeMeta.setText(`${detail.visualRule ?? 'SEMANTIC VIEW'} // ${denominator}`).setVisible(true);
    this.status.setText(`${view.label} // PUBLISHED LIQUID-REEL SEMANTICS`);
    this.cameras.main.flash(120, (view.color >> 16) & 255, (view.color >> 8) & 255, view.color & 255, false);
    return true;
  }

  clearChanceEye() {
    this.chanceEyePanel?.setVisible(false);
    this.chanceEyeText?.setVisible(false);
    this.chanceEyeMeta?.setVisible(false);
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
