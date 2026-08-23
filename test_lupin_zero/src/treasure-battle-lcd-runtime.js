const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;

export const TREASURE_BATTLE_LCD_POLICY = Object.freeze({
  reusesExistingPhaserScene: true,
  reusesGoldenTimeHud: true,
  selectedOpponent: null,
  unknownOpponentLabel: 'ENEMY ???',
  opponentDistributionStatus: 'UNRESOLVED',
  chanceUpDistributionStatus: 'UNRESOLVED',
  prismAutomaticCue: null,
  ledAutomaticCue: null,
  cabinetCueEvidenceStatus: 'UNRESOLVED',
  syntheticOpponentVisualForbidden: true,
  syntheticChanceUpVisualForbidden: true
});

let overlay = null;
let lastState = null;

function view() {
  return app.game.scene.getScene('LupinView');
}

function ensureOverlay() {
  const scene = view();
  if (overlay?.scene === scene) return overlay;
  const width = scene.scale.width;
  const bg = scene.add.graphics().setDepth(40).setVisible(false);
  const title = scene.add.text(width / 2, 92, 'TREASURE BATTLE', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '19px', color: '#ffe36f', stroke: '#000000', strokeThickness: 4
  }).setOrigin(.5).setDepth(41).setVisible(false);
  const opponent = scene.add.text(width / 2, 116, TREASURE_BATTLE_LCD_POLICY.unknownOpponentLabel, {
    fontFamily: 'Arial Black, sans-serif', fontSize: '12px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
  }).setOrigin(.5).setDepth(41).setVisible(false);
  const phase = scene.add.text(width / 2, 195, '', {
    fontFamily: 'Arial Black, sans-serif', fontSize: '15px', color: '#ffffff', stroke: '#000000', strokeThickness: 4, align: 'center'
  }).setOrigin(.5).setDepth(41).setVisible(false);
  const note = scene.add.text(width / 2, 219, '', {
    fontFamily: 'sans-serif', fontSize: '9px', color: '#e8e0cf', stroke: '#000000', strokeThickness: 2,
    align: 'center', wordWrap: { width: Math.max(120, width - 34) }
  }).setOrigin(.5, 0).setDepth(41).setVisible(false);
  overlay = { scene, bg, title, opponent, phase, note };
  return overlay;
}

function drawOverlay({ game = 1, phase = 'FIRST_ATTACK', phaseNote = '', outcomeVisibility = 'HIDDEN', revealedOutcome = null } = {}) {
  const scene = view();
  app.refreshGoldenTimeLcd?.('TREASURE BATTLE');
  const o = ensureOverlay();
  o.bg.clear();
  o.bg.fillStyle(0x050508, 0.72);
  o.bg.fillRoundedRect(10, 84, scene.scale.width - 20, 158, 12);
  o.bg.lineStyle(2, 0xd8b74b, 0.9);
  o.bg.strokeRoundedRect(10, 84, scene.scale.width - 20, 158, 12);
  o.bg.setVisible(true);
  o.title.setVisible(true);
  o.opponent.setText(TREASURE_BATTLE_LCD_POLICY.unknownOpponentLabel).setVisible(true);
  const readablePhase = String(phase ?? '').replaceAll('_', ' ');
  const result = outcomeVisibility === 'REVEALED' && revealedOutcome ? ` — ${revealedOutcome}` : '';
  o.phase.setText(`${game}/4  ${readablePhase}${result}`).setVisible(true);
  o.note.setText(String(phaseNote ?? '')).setVisible(Boolean(phaseNote));
  lastState = Object.freeze({
    visible: true,
    game,
    phase,
    phaseNote: phaseNote || '',
    selectedOpponent: null,
    opponentLabel: TREASURE_BATTLE_LCD_POLICY.unknownOpponentLabel,
    outcomeVisibility,
    revealedOutcome: outcomeVisibility === 'REVEALED' ? revealedOutcome : null
  });
  return lastState;
}

function hideOverlay() {
  if (overlay) {
    overlay.bg.setVisible(false);
    overlay.title.setVisible(false);
    overlay.opponent.setVisible(false);
    overlay.phase.setVisible(false);
    overlay.note.setVisible(false);
  }
  lastState = Object.freeze({ visible: false, selectedOpponent: null });
  return lastState;
}

core.addEventListener('treasure-battle-enter', (event) => {
  const p = event.detail.presentation ?? {};
  drawOverlay({ game: p.nextGame ?? 1, phase: p.nextPhase ?? 'FIRST_ATTACK', phaseNote: p.nextPhaseNote ?? '', outcomeVisibility: 'HIDDEN', revealedOutcome: null });
});

core.addEventListener('treasure-battle-game-started', (event) => {
  drawOverlay({ game: event.detail.game, phase: event.detail.phase, phaseNote: event.detail.phaseNote ?? '', outcomeVisibility: 'HIDDEN', revealedOutcome: null });
});

core.addEventListener('treasure-battle-presentation', (event) => {
  const runtime = app.getTreasureBattleRuntimeState?.();
  const next = runtime?.presentation;
  if (event.detail.completed) {
    drawOverlay({
      game: event.detail.game,
      phase: event.detail.phase,
      phaseNote: event.detail.phaseNote ?? '',
      outcomeVisibility: event.detail.outcomeVisibility,
      revealedOutcome: event.detail.revealedOutcome
    });
    return;
  }
  drawOverlay({
    game: next?.nextGame ?? ((event.detail.game ?? 0) + 1),
    phase: next?.nextPhase ?? event.detail.phase,
    phaseNote: next?.nextPhaseNote ?? '',
    outcomeVisibility: 'HIDDEN',
    revealedOutcome: null
  });
});

core.addEventListener('golden-time-continued', hideOverlay);
core.addEventListener('golden-time-ended', hideOverlay);
core.addEventListener('revenge-chance-enter', hideOverlay);

app.getTreasureBattleLcdState = () => lastState ?? Object.freeze({ visible: false, selectedOpponent: null });
app.treasureBattleLcdPolicy = TREASURE_BATTLE_LCD_POLICY;
