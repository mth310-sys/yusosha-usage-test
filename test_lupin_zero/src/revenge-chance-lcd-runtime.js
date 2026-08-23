import { REVENGE_CHANCE_PRESENTATION_REUSE } from './revenge-chance-reuse-audit.js';
import { REVENGE_CHANCE_SPEC } from './revenge-chance-resolver.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;

export const REVENGE_CHANCE_LCD_POLICY = Object.freeze({
  reusesExistingPhaserScene: true,
  reusesPriorB4VerifiedMechanics: true,
  games: REVENGE_CHANCE_PRESENTATION_REUSE.games,
  characterCollectionTarget: REVENGE_CHANCE_PRESENTATION_REUSE.characterCollectionTarget,
  characterCollectionMechanicVerified: REVENGE_CHANCE_PRESENTATION_REUSE.characterCollectionMechanic,
  typewriterRevengePatternsVerified: REVENGE_CHANCE_PRESENTATION_REUSE.typewriterRevengePatterns,
  characterCollectionOccurrenceTiming: null,
  characterCollectionDistribution: null,
  typewriterPatternDistribution: null,
  automaticCharacterAcquisition: false,
  automaticTypewriterPatternSelection: false,
  automaticSuccessDestination: null,
  characterCollectionDestination: REVENGE_CHANCE_SPEC.characterCollectionDestination,
  directGoldenTimeRouteExists: REVENGE_CHANCE_SPEC.directGoldenTimeRouteExists,
  directGoldenTimeRouteTrigger: REVENGE_CHANCE_SPEC.directGoldenTimeRouteTrigger,
  directGoldenTimeRoutePercent: REVENGE_CHANCE_SPEC.directGoldenTimeRoutePercent,
  syntheticCollectionProgressForbidden: true,
  syntheticTypewriterPatternForbidden: true,
  syntheticDestinationVisualForbidden: true
});

let overlay = null;
let lastState = Object.freeze({ visible: false, collectedCharacters: null });

function view() { return app.game.scene.getScene('LupinView'); }

function ensureOverlay() {
  const scene = view();
  if (overlay?.scene === scene) return overlay;
  const width = scene.scale.width;
  const bg = scene.add.graphics().setDepth(42).setVisible(false);
  const title = scene.add.text(width / 2, 92, 'REVENGE CHANCE', { fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#f2f2f2', stroke: '#000000', strokeThickness: 4 }).setOrigin(.5).setDepth(43).setVisible(false);
  const remaining = scene.add.text(width / 2, 119, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '13px', color: '#ffde73', stroke: '#000000', strokeThickness: 3 }).setOrigin(.5).setDepth(43).setVisible(false);
  const mechanic = scene.add.text(width / 2, 160, '', { fontFamily: 'sans-serif', fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 2, align: 'center', wordWrap: { width: Math.max(140, width - 40) } }).setOrigin(.5).setDepth(43).setVisible(false);
  const status = scene.add.text(width / 2, 205, '', { fontFamily: 'Arial Black, sans-serif', fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: { width: Math.max(140, width - 34) } }).setOrigin(.5).setDepth(43).setVisible(false);
  overlay = { scene, bg, title, remaining, mechanic, status };
  return overlay;
}

function draw({ remaining = 10, status = 'ACTIVE', destinationCandidates = null } = {}) {
  const scene = view();
  const o = ensureOverlay();
  o.bg.clear();
  o.bg.fillStyle(0x07090f, 0.78);
  o.bg.fillRoundedRect(10, 84, scene.scale.width - 20, 150, 12);
  o.bg.lineStyle(2, 0xc7c9d1, 0.9);
  o.bg.strokeRoundedRect(10, 84, scene.scale.width - 20, 150, 12);
  o.bg.setVisible(true); o.title.setVisible(true);
  o.remaining.setText(`残り ${Math.max(0, Number(remaining) || 0)}G`).setVisible(true);
  o.mechanic.setText('4人のキャラシンボル収集 → LUPIN BONUS復活\nタイプライタ復活パターンあり\nGT直行ルートも存在（発生条件・率は未解決）').setVisible(true);
  const destinationText = status === 'SUCCESS'
    ? 'SUCCESS — 成立した復活機構の判別待ち\n4人集合→LUPIN BONUS / GT直行ルートあり'
    : 'CHARACTER COLLECTION — 実進行は解析待ち';
  o.status.setText(status === 'FAILED' ? 'REVENGE CHANCE END' : destinationText).setVisible(true);
  lastState = Object.freeze({ visible: true, remaining: Math.max(0, Number(remaining) || 0), status, collectedCharacters: null, characterCollectionTarget: REVENGE_CHANCE_LCD_POLICY.characterCollectionTarget, typewriterPattern: null, destination: null, destinationCandidates: Array.isArray(destinationCandidates) ? Object.freeze([...destinationCandidates]) : null, characterCollectionDestination: REVENGE_CHANCE_LCD_POLICY.characterCollectionDestination, directGoldenTimeRouteExists: REVENGE_CHANCE_LCD_POLICY.directGoldenTimeRouteExists });
  return lastState;
}

function hide() {
  if (overlay) Object.values(overlay).forEach((item) => item?.setVisible?.(false));
  lastState = Object.freeze({ visible: false, collectedCharacters: null });
  return lastState;
}

core.addEventListener('revenge-chance-enter', (event) => draw({ remaining: event.detail.games ?? 10, status: 'ACTIVE' }));
core.addEventListener('revenge-chance-game-advanced', (event) => draw({ remaining: event.detail.remaining ?? 0, status: 'ACTIVE' }));
core.addEventListener('revenge-chance-success', (event) => draw({ remaining: 0, status: 'SUCCESS', destinationCandidates: event.detail.destinationCandidates ?? null }));
core.addEventListener('revenge-chance-failed', () => draw({ remaining: 0, status: 'FAILED' }));
core.addEventListener('mode-exit', (event) => { if (event.detail.from === 'REVENGE_CHANCE') hide(); });
core.addEventListener('mode-enter', (event) => { if (event.detail.mode !== 'REVENGE_CHANCE' && core.snapshot().mode !== 'REVENGE_CHANCE') hide(); });

app.getRevengeChanceLcdState = () => lastState;
app.revengeChanceLcdPolicy = REVENGE_CHANCE_LCD_POLICY;
