import { GameMode } from './game-flow-spec.js';
import { getGoldenTimeSetPhase, GOLDEN_TIME_SET_PHASE_POLICY } from './golden-time-set-phase.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
let gamesSettled = 0;
let phase = getGoldenTimeSetPhase(0);
let setNumber = null;

function resetForSet(snapshot = core.snapshot()) {
  gamesSettled = 0;
  phase = getGoldenTimeSetPhase(0, snapshot.modeGamesRemaining ?? GOLDEN_TIME_SET_PHASE_POLICY.totalApproxGames);
  setNumber = snapshot.goldenTimeSetNumber ?? 1;
}

function snapshotState() {
  return Object.freeze({
    phase,
    gamesSettled,
    setNumber,
    mainGames: GOLDEN_TIME_SET_PHASE_POLICY.mainGames,
    evidenceStatus: GOLDEN_TIME_SET_PHASE_POLICY.evidenceStatus,
    continuationBattlePerGameMechanics: GOLDEN_TIME_SET_PHASE_POLICY.continuationBattlePerGameMechanics
  });
}

core.addEventListener('mode-enter', (event) => {
  if (event.detail.mode !== GameMode.GOLDEN_TIME) return;
  resetForSet(event.detail.snapshot);
});

core.addEventListener('golden-time-game-settled', (event) => {
  const snapshot = event.detail.snapshot;
  if (snapshot.mode !== GameMode.GOLDEN_TIME) return;
  if (setNumber !== (snapshot.goldenTimeSetNumber ?? 1)) resetForSet(snapshot);

  gamesSettled += 1;
  const totalGames = gamesSettled + Math.max(0, snapshot.modeGamesRemaining ?? 0);
  const nextPhase = getGoldenTimeSetPhase(gamesSettled, totalGames || GOLDEN_TIME_SET_PHASE_POLICY.totalApproxGames);

  if (phase !== nextPhase) {
    const previousPhase = phase;
    phase = nextPhase;
    core.emit('golden-time-set-phase-changed', {
      from: previousPhase,
      to: phase,
      gamesSettled,
      setNumber,
      evidenceStatus: GOLDEN_TIME_SET_PHASE_POLICY.evidenceStatus
    });
    if (phase === 'CONTINUATION_BATTLE') {
      core.emit('golden-time-continuation-battle-enter', {
        gamesSettled,
        remainingApproxGames: snapshot.modeGamesRemaining,
        setNumber,
        perGameMechanics: 'UNRESOLVED',
        evidenceStatus: GOLDEN_TIME_SET_PHASE_POLICY.evidenceStatus
      });
    }
  }
});

core.addEventListener('golden-time-continued', (event) => resetForSet(event.detail.snapshot));
core.addEventListener('golden-time-ended', () => {
  gamesSettled = 0;
  phase = getGoldenTimeSetPhase(0);
  setNumber = null;
});

app.getGoldenTimeSetPhaseState = snapshotState;
app.goldenTimeSetPhasePolicy = GOLDEN_TIME_SET_PHASE_POLICY;

const initial = core.snapshot();
if (initial.mode === GameMode.GOLDEN_TIME) resetForSet(initial);
