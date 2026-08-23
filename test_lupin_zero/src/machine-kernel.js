import { GameMode } from './game-flow-spec.js';

export const KernelPhase = Object.freeze({
  IDLE: 'IDLE',
  READY: 'READY',
  SPINNING: 'SPINNING',
  STOPPING: 'STOPPING'
});

export const ModeResult = Object.freeze({
  NONE: null,
  PENDING_BONUS_OR_ART: 'PENDING_BONUS_OR_ART',
  PENDING_GOLDEN_TIME: 'PENDING_GOLDEN_TIME',
  PENDING_GT_CONTINUATION: 'PENDING_GT_CONTINUATION'
});

function isPostGamePhase(phase) {
  return phase === KernelPhase.IDLE || phase === KernelPhase.READY;
}

export function createMachineState({ credit = 50, maxBet = 3 } = {}) {
  return Object.freeze({
    credit,
    maxBet,
    bet: 0,
    phase: KernelPhase.IDLE,
    stopped: Object.freeze([true, true, true]),
    spinId: 0,
    mode: GameMode.NORMAL,
    modeGamesRemaining: null,
    modeEvidenceStatus: 'VERIFIED_LINK',
    modeResult: ModeResult.NONE,
    modeResultEvidenceStatus: null,
    lastSettledRole: null,
    lastPayout: 0,
    mbFollowupGamesRemaining: 0,
    normalGamesSinceWantedReset: 0,
    wantedWindow: null,
    wantedWindowContext: null,
    wantedTriggerGame: null,
    wantedTriggerEvidenceStatus: null,
    raiunPoints: null,
    raiunHighGamesRemaining: 0,
    raiunHighRank: 'LOW',
    raiunHighLastResult: null,
    raiunModeLastResult: null,
    goldenTimeTreasure: 0,
    goldenTimeSetNumber: 0,
    goldenTimeLastContinuation: null
  });
}

function freezeState(state) {
  return Object.freeze({
    ...state,
    stopped: Object.freeze([...state.stopped]),
    wantedWindow: state.wantedWindow ? Object.freeze({ ...state.wantedWindow }) : null,
    raiunHighLastResult: state.raiunHighLastResult ? Object.freeze({ ...state.raiunHighLastResult }) : null,
    raiunModeLastResult: state.raiunModeLastResult ? Object.freeze({ ...state.raiunModeLastResult }) : null,
    goldenTimeLastContinuation: state.goldenTimeLastContinuation ? Object.freeze({ ...state.goldenTimeLastContinuation }) : null
  });
}

function result(state, events = [], accepted = true) {
  return Object.freeze({ state: freezeState(state), events: Object.freeze(events.map((event) => Object.freeze(event))), accepted });
}

export function reduceMachine(state, command = {}) {
  const type = command.type;

  if (type === 'BET_ONE') {
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase) || state.bet >= state.maxBet || state.credit <= 0) return result(state, [], false);
    const next = { ...state, credit: state.credit - 1, bet: state.bet + 1, phase: KernelPhase.READY };
    return result(next, [{ type: 'CHANGE', reason: 'bet-one' }]);
  }

  if (type === 'MAX_BET') {
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase) || state.bet >= state.maxBet || state.credit <= 0) return result(state, [], false);
    const amount = Math.min(state.maxBet - state.bet, state.credit);
    if (amount <= 0) return result(state, [], false);
    const next = { ...state, credit: state.credit - amount, bet: state.bet + amount, phase: KernelPhase.READY };
    return result(next, [{ type: 'CHANGE', reason: 'max-bet' }]);
  }

  if (type === 'START') {
    if (state.phase !== KernelPhase.READY || state.bet !== state.maxBet) return result(state, [], false);
    if (state.modeResult) return result(state, [], false);
    const spinId = state.spinId + 1;
    const next = { ...state, phase: KernelPhase.SPINNING, stopped: [false, false, false], spinId };
    return result(next, [{ type: 'SPIN_START', spinId }]);
  }

  if (type === 'STOP_REEL') {
    const index = command.reelIndex;
    if (![KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase)) return result(state, [], false);
    if (!Number.isInteger(index) || index < 0 || index > 2 || state.stopped[index]) return result(state, [], false);
    const stopped = [...state.stopped];
    stopped[index] = true;
    const complete = stopped.every(Boolean);
    const next = { ...state, stopped, phase: complete ? KernelPhase.IDLE : KernelPhase.STOPPING, bet: complete ? 0 : state.bet };
    const events = [{ type: 'REEL_STOP', reelIndex: index, spinId: state.spinId, complete }];
    if (complete) events.push({ type: 'SPIN_END', reelIndex: index, spinId: state.spinId, mode: state.mode });
    return result(next, events);
  }

  if (type === 'SETTLE_NORMAL_ROLE') {
    if (state.phase !== KernelPhase.IDLE || state.mbFollowupGamesRemaining > 0) return result(state, [], false);
    const role = command.role;
    const creditDelta = command.creditDelta;
    const replayAutoBet = command.replayAutoBet ?? 0;
    const mbFollowupGames = command.mbFollowupGames ?? 0;
    const evidenceStatus = command.evidenceStatus ?? 'UNRESOLVED';
    if (typeof role !== 'string' || !Number.isInteger(creditDelta) || creditDelta < 0) return result(state, [], false);
    if (!Number.isInteger(replayAutoBet) || replayAutoBet < 0 || replayAutoBet > state.maxBet) return result(state, [], false);
    if (!Number.isInteger(mbFollowupGames) || mbFollowupGames < 0) return result(state, [], false);
    const next = { ...state, credit: state.credit + creditDelta, bet: replayAutoBet, phase: replayAutoBet > 0 ? KernelPhase.READY : KernelPhase.IDLE, lastSettledRole: role, lastPayout: creditDelta, mbFollowupGamesRemaining: mbFollowupGames > 0 ? mbFollowupGames : state.mbFollowupGamesRemaining };
    return result(next, [{ type: 'NORMAL_ROLE_SETTLED', role, creditDelta, replayAutoBet, mbFollowupGames, evidenceStatus }]);
  }

  if (type === 'SETTLE_MB_FOLLOWUP_GAME') {
    if (state.phase !== KernelPhase.IDLE || state.mbFollowupGamesRemaining <= 0) return result(state, [], false);
    const creditDelta = command.creditDelta;
    const evidenceStatus = command.evidenceStatus ?? 'UNRESOLVED';
    if (!Number.isInteger(creditDelta) || creditDelta < 0) return result(state, [], false);
    const remaining = state.mbFollowupGamesRemaining - 1;
    const next = { ...state, credit: state.credit + creditDelta, lastSettledRole: 'MB_FOLLOWUP_10_COIN', lastPayout: creditDelta, mbFollowupGamesRemaining: remaining };
    return result(next, [{ type: 'MB_FOLLOWUP_GAME_SETTLED', creditDelta, remaining, evidenceStatus }]);
  }

  if (type === 'CONFIGURE_WANTED_WINDOW') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL) return result(state, [], false);
    const window = command.window;
    const triggerGame = command.triggerGame;
    if (!window || !Number.isInteger(window.start) || !Number.isInteger(window.end)) return result(state, [], false);
    if (!Number.isInteger(triggerGame) || triggerGame < window.start || triggerGame > window.end) return result(state, [], false);
    const next = { ...state, normalGamesSinceWantedReset: 0, wantedWindow: { ...window }, wantedWindowContext: command.context ?? null, wantedTriggerGame: triggerGame, wantedTriggerEvidenceStatus: command.evidenceStatus ?? 'UNRESOLVED' };
    return result(next, [{ type: 'WANTED_WINDOW_CONFIGURED', window: { ...window }, triggerGame, context: next.wantedWindowContext }]);
  }

  if (type === 'ADVANCE_NORMAL_PROGRESSION') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL || state.mbFollowupGamesRemaining > 0 || state.raiunHighGamesRemaining > 0) return result(state, [], false);
    if (!Number.isInteger(state.wantedTriggerGame) || !state.wantedWindow) return result(state, [], false);
    const games = state.normalGamesSinceWantedReset + 1;
    const events = [{ type: 'NORMAL_PROGRESSION_ADVANCED', games }];
    let next = { ...state, normalGamesSinceWantedReset: games };
    if (games >= state.wantedTriggerGame) {
      next = { ...next, mode: GameMode.WANTED_CHANCE, modeGamesRemaining: 10, modeEvidenceStatus: state.wantedTriggerEvidenceStatus, modeResult: ModeResult.NONE, modeResultEvidenceStatus: null };
      events.push({ type: 'MODE_ENTER', mode: GameMode.WANTED_CHANCE, games: 10, evidenceStatus: state.wantedTriggerEvidenceStatus, sourceWindow: state.wantedWindow });
    }
    return result(next, events);
  }

  if (type === 'SET_RAIUN_POINTS') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL || state.raiunHighGamesRemaining > 0) return result(state, [], false);
    const points = command.points;
    if (!Number.isInteger(points) || points < 0 || points > 100) return result(state, [], false);
    const reached = points >= 100;
    const next = { ...state, raiunPoints: points, raiunHighGamesRemaining: reached ? 7 : 0, raiunHighLastResult: null };
    const events = [{ type: 'RAIUN_POINTS_SET', points, evidenceStatus: command.evidenceStatus ?? 'UNRESOLVED' }];
    if (reached) events.push({ type: 'RAIUN_HIGH_ENTER', games: 7, points: 100, rank: state.raiunHighRank });
    return result(next, events);
  }

  if (type === 'ADD_RAIUN_POINTS') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL) return result(state, [], false);
    if (!Number.isInteger(state.raiunPoints) || state.raiunPoints < 0 || state.raiunPoints >= 100 || state.raiunHighGamesRemaining > 0) return result(state, [], false);
    const points = command.points;
    if (!Number.isInteger(points) || points <= 0) return result(state, [], false);
    const from = state.raiunPoints;
    const to = Math.min(100, from + points);
    const reached = to >= 100;
    const next = { ...state, raiunPoints: to, raiunHighGamesRemaining: reached ? 7 : 0, raiunHighLastResult: null };
    const events = [{ type: 'RAIUN_POINTS_ADDED', from, points: to - from, to, evidenceStatus: command.evidenceStatus ?? 'UNRESOLVED' }];
    if (reached) events.push({ type: 'RAIUN_HIGH_ENTER', games: 7, points: 100, rank: state.raiunHighRank });
    return result(next, events);
  }

  if (type === 'RESOLVE_RAIUN_HIGH_GAME') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL || state.raiunHighGamesRemaining <= 0) return result(state, [], false);
    const resolution = command.resolution;
    if (!resolution || resolution.rank !== state.raiunHighRank || typeof resolution.hit !== 'boolean') return result(state, [], false);
    if (resolution.hit) {
      const next = { ...state, mode: GameMode.RAIUN_MODE, modeGamesRemaining: 20, modeEvidenceStatus: resolution.evidenceStatus ?? 'MULTI_SOURCE_MATCH', raiunHighGamesRemaining: 0, raiunHighLastResult: { ...resolution }, raiunModeLastResult: null };
      return result(next, [
        { type: 'RAIUN_HIGH_GAME_RESOLVED', rank: state.raiunHighRank, hit: true, remaining: 0, resolution },
        { type: 'MODE_ENTER', mode: GameMode.RAIUN_MODE, games: 20, evidenceStatus: resolution.evidenceStatus ?? 'MULTI_SOURCE_MATCH' }
      ]);
    }
    const remaining = state.raiunHighGamesRemaining - 1;
    const next = { ...state, raiunHighGamesRemaining: remaining, raiunHighLastResult: { ...resolution } };
    const events = [{ type: 'RAIUN_HIGH_GAME_RESOLVED', rank: state.raiunHighRank, hit: false, remaining, resolution }];
    if (remaining === 0) events.push({ type: 'RAIUN_HIGH_EXHAUSTED', rank: state.raiunHighRank, redUpgradeStatus: 'UNRESOLVED' });
    return result(next, events);
  }

  if (type === 'RESET_RAIUN_COUNTER') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL || state.raiunHighGamesRemaining > 0) return result(state, [], false);
    const points = command.points;
    if (!Number.isInteger(points) || points < 0 || points >= 100) return result(state, [], false);
    const next = { ...state, raiunPoints: points, raiunHighLastResult: null };
    return result(next, [{ type: 'RAIUN_COUNTER_RESET', points, rank: state.raiunHighRank, evidenceStatus: command.evidenceStatus ?? 'UNRESOLVED' }]);
  }

  if (type === 'SET_RAIUN_HIGH_RANK') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.NORMAL || state.raiunHighGamesRemaining > 0) return result(state, [], false);
    if (!['LOW', 'HIGH'].includes(command.rank)) return result(state, [], false);
    const next = { ...state, raiunHighRank: command.rank };
    return result(next, [{ type: 'RAIUN_HIGH_RANK_SET', rank: command.rank, evidenceStatus: command.evidenceStatus ?? 'UNRESOLVED' }]);
  }

  if (type === 'SETTLE_RAIUN_MODE_GAME') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.RAIUN_MODE || !Number.isInteger(state.modeGamesRemaining) || state.modeGamesRemaining <= 0 || state.modeResult) return result(state, [], false);
    const resolution = command.resolution;
    if (!resolution || typeof resolution.artHit !== 'boolean' || !Number.isInteger(resolution.payoutCoins) || resolution.payoutCoins < 0) return result(state, [], false);
    const remaining = state.modeGamesRemaining - 1;
    const base = { ...state, credit: state.credit + resolution.payoutCoins, lastSettledRole: 'RAIUN_MODE_GAME', lastPayout: resolution.payoutCoins, raiunModeLastResult: { ...resolution } };
    if (resolution.artHit) {
      const next = { ...base, modeGamesRemaining: 0, modeResult: ModeResult.PENDING_GOLDEN_TIME, modeResultEvidenceStatus: resolution.destinationEvidenceStatus ?? 'MULTI_SOURCE_MATCH' };
      return result(next, [
        { type: 'RAIUN_MODE_GAME_SETTLED', payoutCoins: resolution.payoutCoins, remaining: 0, artHit: true, evidenceStatus: resolution.evidenceStatus },
        { type: 'RAIUN_MODE_ART_SUCCESS', successPresentation: resolution.successPresentation, destination: GameMode.GOLDEN_TIME, evidenceStatus: resolution.destinationEvidenceStatus ?? 'MULTI_SOURCE_MATCH' }
      ]);
    }
    const next = { ...base, modeGamesRemaining: remaining };
    const events = [{ type: 'RAIUN_MODE_GAME_SETTLED', payoutCoins: resolution.payoutCoins, remaining, artHit: false, evidenceStatus: resolution.evidenceStatus }];
    if (remaining === 0) events.push({ type: 'MODE_WINDOW_EXHAUSTED', mode: GameMode.RAIUN_MODE });
    return result(next, events);
  }

  if (type === 'ENTER_GOLDEN_TIME') {
    if (!isPostGamePhase(state.phase) || state.modeResult !== ModeResult.PENDING_GOLDEN_TIME) return result(state, [], false);
    const profile = command.profile;
    if (!profile || !Number.isInteger(profile.games) || profile.games <= 0 || !Number.isInteger(profile.initialTreasure) || profile.initialTreasure < 0) return result(state, [], false);
    const next = {
      ...state,
      mode: GameMode.GOLDEN_TIME,
      modeGamesRemaining: profile.games,
      modeEvidenceStatus: profile.evidenceStatus ?? 'PUBLISHED_ANALYSIS',
      modeResult: ModeResult.NONE,
      modeResultEvidenceStatus: null,
      goldenTimeTreasure: profile.initialTreasure,
      goldenTimeSetNumber: state.goldenTimeSetNumber + 1,
      goldenTimeLastContinuation: null
    };
    return result(next, [{ type: 'MODE_ENTER', mode: GameMode.GOLDEN_TIME, games: profile.games, evidenceStatus: profile.evidenceStatus ?? 'PUBLISHED_ANALYSIS', treasure: profile.initialTreasure }]);
  }

  if (type === 'SETTLE_GOLDEN_TIME_GAME') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.GOLDEN_TIME || !Number.isInteger(state.modeGamesRemaining) || state.modeGamesRemaining <= 0 || state.modeResult) return result(state, [], false);
    const payoutCoins = command.payoutCoins;
    const evidenceStatus = command.evidenceStatus ?? 'INFERRED_HIGH_CONFIDENCE';
    if (!Number.isInteger(payoutCoins) || payoutCoins < 0) return result(state, [], false);
    const remaining = state.modeGamesRemaining - 1;
    const next = {
      ...state,
      credit: state.credit + payoutCoins,
      lastSettledRole: 'GOLDEN_TIME_GAME',
      lastPayout: payoutCoins,
      modeGamesRemaining: remaining,
      modeResult: remaining === 0 ? ModeResult.PENDING_GT_CONTINUATION : state.modeResult,
      modeResultEvidenceStatus: remaining === 0 ? 'PUBLISHED_ANALYSIS' : state.modeResultEvidenceStatus
    };
    const events = [{ type: 'GOLDEN_TIME_GAME_SETTLED', payoutCoins, remaining, treasure: state.goldenTimeTreasure, evidenceStatus }];
    if (remaining === 0) events.push({ type: 'GOLDEN_TIME_BATTLE_READY', treasure: state.goldenTimeTreasure });
    return result(next, events);
  }

  if (type === 'RESOLVE_GOLDEN_TIME_CONTINUATION') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.GOLDEN_TIME || state.modeResult !== ModeResult.PENDING_GT_CONTINUATION) return result(state, [], false);
    const resolution = command.resolution;
    const profile = command.profile;
    if (!resolution || typeof resolution.continued !== 'boolean' || !profile || !Number.isInteger(profile.games) || profile.games <= 0) return result(state, [], false);
    if (resolution.continued) {
      const next = {
        ...state,
        modeGamesRemaining: profile.games,
        modeResult: ModeResult.NONE,
        modeResultEvidenceStatus: null,
        goldenTimeTreasure: profile.initialTreasure,
        goldenTimeSetNumber: state.goldenTimeSetNumber + 1,
        goldenTimeLastContinuation: { ...resolution }
      };
      return result(next, [{ type: 'GOLDEN_TIME_CONTINUED', treasure: resolution.treasure, continuationPercent: resolution.continuationPercent, setNumber: next.goldenTimeSetNumber, evidenceStatus: resolution.evidenceStatus }]);
    }
    const next = {
      ...state,
      mode: GameMode.NORMAL,
      modeGamesRemaining: null,
      modeEvidenceStatus: 'VERIFIED_LINK',
      modeResult: ModeResult.NONE,
      modeResultEvidenceStatus: null,
      goldenTimeTreasure: 0,
      goldenTimeLastContinuation: { ...resolution }
    };
    return result(next, [{ type: 'GOLDEN_TIME_ENDED', treasure: resolution.treasure, continuationPercent: resolution.continuationPercent, setNumber: state.goldenTimeSetNumber, evidenceStatus: resolution.evidenceStatus }]);
  }

  if (type === 'EXIT_RAIUN_MODE') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.RAIUN_MODE || state.modeGamesRemaining !== 0 || state.modeResult) return result(state, [], false);
    const next = { ...state, mode: GameMode.NORMAL, modeGamesRemaining: null, modeEvidenceStatus: 'VERIFIED_LINK', modeResult: ModeResult.NONE, modeResultEvidenceStatus: null };
    return result(next, [{ type: 'MODE_EXIT', from: GameMode.RAIUN_MODE, to: GameMode.NORMAL }]);
  }

  if (type === 'EXIT_WANTED_CHANCE') {
    if (!isPostGamePhase(state.phase) || state.mode !== GameMode.WANTED_CHANCE || state.modeGamesRemaining !== 0) return result(state, [], false);
    const next = { ...state, mode: GameMode.NORMAL, modeGamesRemaining: null, modeEvidenceStatus: 'VERIFIED_LINK', modeResult: ModeResult.NONE, modeResultEvidenceStatus: null, normalGamesSinceWantedReset: 0, wantedWindow: null, wantedWindowContext: null, wantedTriggerGame: null, wantedTriggerEvidenceStatus: null };
    return result(next, [{ type: 'MODE_EXIT', from: GameMode.WANTED_CHANCE, to: GameMode.NORMAL }]);
  }

  if (type === 'ENTER_MODE') {
    const mode = command.mode;
    const games = command.games;
    const evidenceStatus = command.evidenceStatus ?? 'UNRESOLVED';
    if (![GameMode.WANTED_CHANCE, GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE, GameMode.RAIUN_MODE].includes(mode)) return result(state, [], false);
    const validGames = mode === GameMode.WANTED_CHANCE ? games === 10 : mode === GameMode.RAIUN_MODE ? games === 20 : [10, 20].includes(games);
    if (!Number.isInteger(games) || !validGames) return result(state, [], false);
    if ([KernelPhase.SPINNING, KernelPhase.STOPPING].includes(state.phase)) return result(state, [], false);
    const next = { ...state, mode, modeGamesRemaining: games, modeEvidenceStatus: evidenceStatus, modeResult: ModeResult.NONE, modeResultEvidenceStatus: null };
    return result(next, [{ type: 'MODE_ENTER', mode, games, evidenceStatus }]);
  }

  if (type === 'ADVANCE_MODE_GAME') {
    if (![GameMode.WANTED_CHANCE, GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE, GameMode.RAIUN_MODE].includes(state.mode)) return result(state, [], false);
    if (state.modeResult) return result(state, [], false);
    if (!Number.isInteger(state.modeGamesRemaining) || state.modeGamesRemaining <= 0) return result(state, [], false);
    const remaining = state.modeGamesRemaining - 1;
    const next = { ...state, modeGamesRemaining: remaining };
    const events = [{ type: 'MODE_GAME_ADVANCED', mode: state.mode, remaining }];
    if (remaining === 0) events.push({ type: 'MODE_WINDOW_EXHAUSTED', mode: state.mode });
    return result(next, events);
  }

  if (type === 'CHANCE_ZONE_ODD_ALIGNED') {
    if (![GameMode.ODOROBO_ZONE, GameMode.FUJIKO_ZONE].includes(state.mode)) return result(state, [], false);
    if (state.modeResult) return result(state, [], false);
    if (!Number.isInteger(state.modeGamesRemaining) || state.modeGamesRemaining <= 0) return result(state, [], false);
    const next = { ...state, modeGamesRemaining: 0, modeResult: ModeResult.PENDING_BONUS_OR_ART, modeResultEvidenceStatus: 'MULTI_SOURCE_MATCH' };
    return result(next, [{ type: 'CHANCE_ZONE_SUCCESS', mode: state.mode, successPresentation: 'ODD_LCD_SYMBOL_ALIGNED', pendingDestination: ModeResult.PENDING_BONUS_OR_ART, destinationSplitStatus: 'UNRESOLVED', evidenceStatus: 'MULTI_SOURCE_MATCH' }]);
  }

  return result(state, [], false);
}
