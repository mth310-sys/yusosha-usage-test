import { GameMode } from './game-flow-spec.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core || !app?.game) throw new Error('LUPIN ZERO runtime is required');

const core = app.core;
const view = () => app.game.scene.getScene('LupinView');

export const GOLDEN_TIME_DIRECT_ADD_PRESENTATION_POLICY = Object.freeze({
  evidenceStatus: 'PUBLISHED_ANALYSIS',
  affectsGameLogic: false,
  trigger: 'GOLDEN_TIME_TREASURE_ACQUIRED',
  publishedCue: 'TRIPLE_T_SYMBOL_ALIGNED',
  silverGoldExistencePublished: true,
  silverGoldSelectionRateResolved: false,
  syntheticSilverGoldSelectionAllowed: false
});

core.addEventListener('golden-time-treasure-acquired', (event) => {
  const snapshot = event.detail.snapshot;
  if (snapshot.mode !== GameMode.GOLDEN_TIME) return;
  const added = Number(event.detail.added ?? 0);
  if (added <= 0) return;
  const scene = view();
  scene.showSettlementFeel?.('T  T  T', 'rare');
  scene.time?.delayedCall?.(180, () => {
    scene.showSettlementFeel?.(`+${Math.round(added / 10000)}万T`, event.detail.extraBonusReached ? 'special' : 'pay');
  });
});

app.goldenTimeDirectAddPresentationPolicy = GOLDEN_TIME_DIRECT_ADD_PRESENTATION_POLICY;
