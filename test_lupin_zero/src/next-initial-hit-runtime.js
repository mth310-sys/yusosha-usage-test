import { GameMode } from './game-flow-spec.js';
import { resolveNextInitialHit } from './next-initial-hit-resolver.js';
import { createGoldenTimeSetProfile } from './golden-time-resolver.js';
import { createLupinBonusProfile } from './lupin-bonus-resolver.js';
import { SeededRandomSource } from './random-source.js';

const app = window.__LUPIN_ZERO__;
if (!app?.core) throw new Error('LUPIN ZERO core is required');

const core = app.core;
const random = new SeededRandomSource(0x20160810);
const setting = app.machineSetting ?? 1;
let reserved = resolveNextInitialHit(random, setting, 'INITIAL_BOOT');

function reserveNext(context = 'AFTER_BONUS_OR_ART') {
  reserved = resolveNextInitialHit(random, setting, context);
  app.nextInitialHitReservation = reserved;
  return reserved;
}

function enterReservedDestination(source = 'CHANCE_ZONE_SUCCESS') {
  const s = core.snapshot();
  if (s.modeResult !== 'PENDING_BONUS_OR_ART') return false;
  const selected = reserved;

  if (selected.destination === GameMode.GOLDEN_TIME) {
    core.kernelState = Object.freeze({
      ...core.kernelState,
      modeResult: 'PENDING_GOLDEN_TIME',
      modeResultEvidenceStatus: selected.evidenceStatus
    });
    const profile = createGoldenTimeSetProfile();
    const entered = core.enterGoldenTime(profile);
    if (entered) core.emit('next-initial-hit-consumed', { source, destination: GameMode.GOLDEN_TIME, reservation: selected });
    return entered;
  }

  const profile = createLupinBonusProfile();
  core.kernelState = Object.freeze({
    ...core.kernelState,
    mode: GameMode.LUPIN_BONUS,
    modeGamesRemaining: profile.totalGames,
    modeEvidenceStatus: selected.evidenceStatus,
    modeResult: null,
    modeResultEvidenceStatus: null
  });
  core.emit('mode-enter', { mode: GameMode.LUPIN_BONUS, games: profile.totalGames, evidenceStatus: selected.evidenceStatus });
  core.emit('next-initial-hit-consumed', { source, destination: GameMode.LUPIN_BONUS, reservation: selected });
  return true;
}

core.addEventListener('chance-zone-success', () => {
  if (enterReservedDestination('CHANCE_ZONE_SUCCESS')) reserveNext();
});

core.addEventListener('lupin-bonus-ended', () => reserveNext());
core.addEventListener('golden-time-ended', () => reserveNext());

app.nextInitialHitRandom = random;
app.nextInitialHitReservation = reserved;
app.reserveNextInitialHit = reserveNext;
app.enterReservedInitialHit = enterReservedDestination;
