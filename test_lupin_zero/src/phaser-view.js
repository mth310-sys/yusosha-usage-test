import { RESEARCH_SYMBOLS } from './research-reel-engine.js';

const CHANCE_EYE_VIEW = Object.freeze({
  CHANCE_EYE_BLUE: Object.freeze({ label: 'BLUE CHANCE', color: 0x2b8cff, textColor: '#8fc7ff' }),
  CHANCE_EYE_RED: Object.freeze({ label: 'RED CHANCE', color: 0xe52c39, textColor: '#ff9ba2' }),
  CHANCE_EYE_GOLD: Object.freeze({ label: 'GOLD 7', color: 0xffc83d, textColor: '#ffe99a' })
});

const GT_STAGE_VIEW = Object.freeze({
  JAPAN: Object.freeze({ label: '日本', top: 0x1a2030, bottom: 0x511416 }),
  SWITZERLAND: Object.freeze({ label: 'スイス', top: 0x17314a, bottom: 0x92b9c8 }),
  CARIBBEAN: Object.freeze({ label: 'カリブ海', top: 0x063d58, bottom: 0x0a775e }),
  UNDERGROUND: Object.freeze({ label: '地下都市', top: 0x251132, bottom: 0x7c2c1d }),
  IKUKAN: Object.freeze({ label: '異空間', top: 0x13051d, bottom: 0x5f1582 })
});

function visibleStageKey(stage) {
  const raw = String(stage ?? 'JAPAN');
  if (raw.startsWith('SWITZERLAND')) return 'SWITZERLAND';
  if (raw.startsWith('CARIBBEAN')) return 'CARIBBEAN';
  if (raw.startsWith('UNDERGROUND')) return 'UNDERGROUND';
  if (raw === 'IKUKAN') return 'IKUKAN';
  return 'JAPAN';
}

export class LupinView extends Phaser.Scene {
  constructor() {
    super('LupinView');
    this.reels = [];
    this.running = [false, false, false];
    this.phase = [0, 0, 0];
    this.gtVisible = false;
    this.modeHudVisible = false;
  }

  create() {
    const { width, height } = this.scale;
    this.baseBg = this.add.graphics();
    this.drawBaseBackground();
    this.titleText = this.add.text(width / 2, 18, 'LUPIN THE THIRD', { fontFamily: 'Arial Black, sans-serif', fontSize: '16px', color: '#f4d16b' }).setOrigin(.5, 0);
    this.subtitleText = this.add.text(width / 2, 45, '消されたルパン', { fontFamily: 'sans-serif', fontSize: '11px', color: '#d6c9ae', letterSpacing: 2 }).setOrigin(.5, 0);
    const reelY = 132, reelW = 82, gap = 8, startX = width / 2 - (reelW * 3 + gap * 2) / 2;
    this.reelPanels = [];
    for (let i = 0; i < 3; i++) {
      const x = startX + i * (reelW + gap);
      const panel = this.add.graphics(); panel.fillStyle(0xf1ead8, 1); panel.fillRoundedRect(x, reelY - 48, reelW, 108, 8); panel.lineStyle(3, 0x4d3c20, 1); panel.strokeRoundedRect(x, reelY - 48, reelW, 108, 8); this.reelPanels.push(panel);
      const symbol = this.add.text(x + reelW / 2, reelY + 5, RESEARCH_SYMBOLS[i], { fontFamily: 'Arial Black, sans-serif', fontSize: '30px', color: '#9f1118', stroke: '#2a1408', strokeThickness: 1 }).setOrigin(.5); this.reels.push(symbol);
    }
    this.status = this.add.text(width / 2, height - 34, '待機中', { fontFamily: 'sans-serif', fontSize: '10px', color: '#d3b865' }).setOrigin(.5);
    this.chanceEyePanel = this.add.graphics().setDepth(20).setVisible(false);
    this.chanceEyeText = this.add.text(width / 2, height / 2, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 4 }).setOrigin(.5).setDepth(21).setVisible(false);
    this.chanceEyeMeta = this.add.text(width / 2, height / 2 + 34, '', { fontFamily: 'sans-serif', fontSize: '10px', color: '#ffffff', align: 'center' }).setOrigin(.5).setDepth(21).setVisible(false);
    this.spinPulse = this.add.graphics().setDepth(30).setVisible(false);
    this.resultText = this.add.text(width / 2, 102, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#ffe27a', stroke: '#000', strokeThickness: 4 }).setOrigin(.5).setDepth(31).setVisible(false);
    this.createGoldenTimeHud(); this.createModeHud(); this.events.emit('view-ready');
  }

  drawBaseBackground() { const { width, height } = this.scale; this.baseBg.clear(); this.baseBg.fillGradientStyle(0x05070d, 0x05070d, 0x181006, 0x181006, 1); this.baseBg.fillRect(0, 0, width, height); }
  createModeHud() { const { width } = this.scale; this.modeHudBg = this.add.graphics().setDepth(3).setVisible(false); this.modeHudTitle = this.add.text(width / 2, 13, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '16px', color: '#ffe27a', stroke: '#000', strokeThickness: 3 }).setOrigin(.5,0).setDepth(4).setVisible(false); this.modeHudMeta = this.add.text(width / 2, 42, '', { fontFamily: 'sans-serif', fontSize: '11px', color: '#fff', stroke: '#000', strokeThickness: 2, align: 'center' }).setOrigin(.5,0).setDepth(4).setVisible(false); }
  showModeHud({ title = '', meta = '', level = 'normal' } = {}) { if (this.gtVisible) return false; const { width } = this.scale; const tones = { normal:[0x0b1019,0x321313], wanted:[0x1d1207,0x5a2a08], raiun:[0x080d1f,0x263b70], cz:[0x210714,0x74253e], bonus:[0x231007,0x8d5b13] }; const tone = tones[level] ?? tones.normal; this.modeHudBg.clear(); this.modeHudBg.fillGradientStyle(tone[0],tone[0],tone[1],tone[1],.7); this.modeHudBg.fillRoundedRect(7,5,width-14,70,12); this.modeHudBg.setVisible(true); this.modeHudTitle.setText(title).setVisible(Boolean(title)); this.modeHudMeta.setText(meta).setVisible(Boolean(meta)); this.modeHudVisible = true; return true; }
  hideModeHud() { this.modeHudVisible = false; this.modeHudBg?.setVisible(false); this.modeHudTitle?.setVisible(false); this.modeHudMeta?.setVisible(false); }
  createGoldenTimeHud() { const { width } = this.scale; this.gtBg = this.add.graphics().setDepth(4).setVisible(false); this.gtHeader = this.add.text(16,10,'GOLDEN TIME',{fontFamily:'Arial Black, sans-serif',fontSize:'13px',color:'#ffe36f',stroke:'#000',strokeThickness:3}).setDepth(5).setVisible(false); this.gtStage=this.add.text(width-16,11,'日本',{fontFamily:'Arial Black, sans-serif',fontSize:'12px',color:'#ffffff',stroke:'#000',strokeThickness:3}).setOrigin(1,0).setDepth(5).setVisible(false); this.gtTreasure=this.add.text(width/2,43,'35万T',{fontFamily:'Arial Black, sans-serif',fontSize:'27px',color:'#ffe36f',stroke:'#2a1000',strokeThickness:4}).setOrigin(.5,0).setDepth(5).setVisible(false); this.gtMode=this.add.text(width/2,76,'',{fontFamily:'Arial Black, sans-serif',fontSize:'14px',color:'#ffffff',stroke:'#000',strokeThickness:4}).setOrigin(.5,0).setDepth(6).setVisible(false); this.gtHolds=[]; const holdStart=width/2-66; for(let i=0;i<4;i++) this.gtHolds.push(this.add.text(holdStart+i*44,222,'◆',{fontFamily:'sans-serif',fontSize:'20px',color:'#91a0ad',stroke:'#000',strokeThickness:3}).setOrigin(.5).setDepth(7).setVisible(false)); }
  showGoldenTimeHud({stage='JAPAN_A',treasure=0,modeLabel='',holds=null}={}) { this.hideModeHud(); this.gtVisible=true; const key=visibleStageKey(stage),v=GT_STAGE_VIEW[key],{width,height}=this.scale; this.gtBg.clear(); this.gtBg.fillGradientStyle(v.top,v.top,v.bottom,v.bottom,.82); this.gtBg.fillRoundedRect(7,5,width-14,height-10,12); this.gtBg.lineStyle(2,key==='IKUKAN'?0xd764ff:0xd8b74b,.9); this.gtBg.strokeRoundedRect(7,5,width-14,height-10,12); this.gtBg.setVisible(true); this.gtHeader.setVisible(true); this.gtStage.setText(v.label).setVisible(true); this.gtTreasure.setText(`${Math.round(Number(treasure||0)/10000)}万T`).setVisible(true); this.gtMode.setText(modeLabel||'').setVisible(Boolean(modeLabel)); const values=Array.isArray(holds)?holds:['NORMAL','NORMAL','NORMAL','NORMAL']; this.setGoldenTimeHolds(values); this.titleText.setVisible(false); this.subtitleText.setVisible(false); return true; }
  updateGoldenTimeHud(o={}) { return this.showGoldenTimeHud({stage:o.stage??'JAPAN_A',treasure:o.treasure??0,modeLabel:o.modeLabel??'',holds:o.holds}); }
  hideGoldenTimeHud(){this.gtVisible=false;this.gtBg?.setVisible(false);this.gtHeader?.setVisible(false);this.gtStage?.setVisible(false);this.gtTreasure?.setVisible(false);this.gtMode?.setVisible(false);this.gtHolds?.forEach(x=>x.setVisible(false));this.titleText?.setVisible(true);this.subtitleText?.setVisible(true);}
  setGoldenTimeModeLabel(label=''){if(!this.gtVisible)return false;this.gtMode.setText(label).setVisible(Boolean(label));return true;}
  setGoldenTimeHolds(holds=[]){if(!this.gtVisible)return false; const map={NORMAL:['◆','#91a0ad'],HOT:['◆','#ff7b41'],FLAME_LUPIN:['炎','#ff5a2f'],FUJIKO:['F','#ff78cf'],TAMACHAN:['玉','#ffe564']}; this.gtHolds.forEach((text,index)=>{const row=map[holds[index]??'NORMAL']??map.NORMAL;text.setText(row[0]).setColor(row[1]).setVisible(true);});return true;}

  beginSpinFeel() { const { width, height } = this.scale; this.resultText.setVisible(false); this.spinPulse.clear(); this.spinPulse.lineStyle(2,0xffd45a,.55); this.spinPulse.strokeRoundedRect(10,82,width-20,height-128,14); this.spinPulse.setAlpha(0).setVisible(true); this.tweens.add({targets:this.spinPulse,alpha:.75,duration:90,yoyo:true,repeat:1}); this.cameras.main.zoomTo(1.012,100); }
  stopFeel(index, complete=false) { const reel=this.reels[index]; if(reel) this.tweens.add({targets:reel,scale:1.14,duration:55,yoyo:true,ease:'Quad.Out'}); this.cameras.main.shake(complete?90:45,complete?.0035:.0018); if(complete) this.cameras.main.zoomTo(1,100); }
  showSettlementFeel(label='', intensity='normal') { if(!label)return false; const colors={normal:'#d8d2bf',pay:'#ffe067',rare:'#ff8a78',special:'#fff2a8'}; this.resultText.setText(label).setColor(colors[intensity]??colors.normal).setVisible(true).setAlpha(0).setScale(.82); this.tweens.add({targets:this.resultText,alpha:1,scale:1,duration:120,ease:'Back.Out',hold:280,yoyo:true,onComplete:()=>this.resultText.setVisible(false)}); if(intensity==='special') this.cameras.main.flash(130,255,216,80,false); return true; }
  setReelRunning(index,running,stopSymbol=null){this.running[index]=running;if(!running&&stopSymbol!==null){this.reels[index].setText(stopSymbol).setScale(1.08);this.tweens.add({targets:this.reels[index],scale:1,duration:120,ease:'Back.Out'});}}
  startSpin(){this.running=[true,true,true];this.clearChanceEye();this.status.setText('SPIN');this.beginSpinFeel();}
  endSpin(){this.status.setText('待機中');this.spinPulse?.setVisible(false);}
  showChanceEye(cue,detail={}){const v=CHANCE_EYE_VIEW[cue];if(!v)return false;const{width,height}=this.scale;this.chanceEyePanel.clear();this.chanceEyePanel.fillStyle(v.color,.28);this.chanceEyePanel.fillRoundedRect(18,70,width-36,height-112,14);this.chanceEyePanel.lineStyle(3,v.color,.95);this.chanceEyePanel.strokeRoundedRect(18,70,width-36,height-112,14);this.chanceEyePanel.setVisible(true);this.chanceEyeText.setText(v.label).setColor(v.textColor).setVisible(true);const outcome=detail.outcome?.destination??null;this.chanceEyeMeta.setText(outcome?String(outcome).replaceAll('_',' '):'').setVisible(Boolean(outcome));this.status.setText(v.label);this.cameras.main.flash(120,(v.color>>16)&255,(v.color>>8)&255,v.color&255,false);return true;}
  clearChanceEye(){this.chanceEyePanel?.setVisible(false);this.chanceEyeText?.setVisible(false);this.chanceEyeMeta?.setVisible(false);}
  update(_,delta){for(let i=0;i<this.reels.length;i++){if(!this.running[i])continue;this.phase[i]+=delta*(0.02+i*.002);const index=Math.floor(this.phase[i])%RESEARCH_SYMBOLS.length;this.reels[i].setText(RESEARCH_SYMBOLS[index]);}}
}
