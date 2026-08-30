export const TREASURE_BATTLE_CABINET_CUE_POLICY = Object.freeze({
  sourceEventFlow: 'TREASURE_BATTLE_4G_PRESENTATION',
  existingLedSurfaceReusable: true,
  existingPrismMechanismReusable: true,
  automaticLedCue: null,
  automaticPrismCue: null,
  automaticAudioCue: null,
  physicalCueEvidenceStatus: 'UNRESOLVED',
  applyUnverifiedPhysicalCue: false,
  semanticPhaseTrackingImplemented: true,
  note: 'Treasure Battle phase events are tracked so verified cabinet cues can be connected later. No LED, prism or audio action is synthesized.'
});

function installTreasureBattleCabinetCueRuntime(browserWindow, browserDocument) {
  const app = browserWindow.__LUPIN_ZERO__;
  if (!app?.core) throw new Error('LUPIN ZERO core is required');

  const core = app.core;
  const machine = browserDocument.querySelector('.machine');
  const prism = browserDocument.querySelector('#prismMechanism');

  let state = Object.freeze({
    active: false,
    game: null,
    phase: null,
    outcomeVisibility: null,
    revealedOutcome: null,
    physicalCueApplied: false,
    prismState: prism?.dataset.state ?? null,
    leftLed: machine?.dataset.leftLed ?? null,
    rightLed: machine?.dataset.rightLed ?? null
  });

  function snapshotPhysical() {
    return Object.freeze({
      prismState: prism?.dataset.state ?? null,
      leftLed: machine?.dataset.leftLed ?? null,
      rightLed: machine?.dataset.rightLed ?? null
    });
  }

  function update(detail = {}, active = true) {
    const physical = snapshotPhysical();
    state = Object.freeze({
      active,
      game: detail.game ?? detail.presentation?.nextGame ?? null,
      phase: detail.phase ?? detail.presentation?.nextPhase ?? null,
      outcomeVisibility: detail.outcomeVisibility ?? (active ? 'HIDDEN' : null),
      revealedOutcome: detail.outcomeVisibility === 'REVEALED' ? (detail.revealedOutcome ?? null) : null,
      physicalCueApplied: false,
      ...physical
    });
    core.emit('treasure-battle-cabinet-cue-audit', {
      ...state,
      automaticLedCue: null,
      automaticPrismCue: null,
      physicalCueEvidenceStatus: TREASURE_BATTLE_CABINET_CUE_POLICY.physicalCueEvidenceStatus
    });
    return state;
  }

  core.addEventListener('treasure-battle-enter', (event) => update(event.detail, true));
  core.addEventListener('treasure-battle-game-started', (event) => update(event.detail, true));
  core.addEventListener('treasure-battle-presentation', (event) => update(event.detail, !event.detail.completed));
  core.addEventListener('golden-time-continued', () => update({}, false));
  core.addEventListener('golden-time-ended', () => update({}, false));

  app.getTreasureBattleCabinetCueState = () => state;
  app.treasureBattleCabinetCuePolicy = TREASURE_BATTLE_CABINET_CUE_POLICY;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installTreasureBattleCabinetCueRuntime(window, document);
}
