import { CONFIG, PHASE } from './config.js';
import { placeBet, settlePayout } from './credit.js';
import { drawRole } from './role-lottery.js';
import { createLogger } from './logger.js';

export function createGameCore() {
  const logger = createLogger(CONFIG.logLimit);
  const state = {
    game: 0,
    setting: CONFIG.setting,
    phase: PHASE.WAIT_BET,
    credit: CONFIG.initialCredit,
    bet: 0,
    payout: 0,
    role: '----'
  };

  function maxBet() {
    if (state.phase !== PHASE.WAIT_BET) return false;
    if (!placeBet(state, CONFIG.maxBet)) return false;
    state.phase = PHASE.WAIT_LEVER;
    logger.push(`BET ${CONFIG.maxBet} / CREDIT ${state.credit}`);
    return true;
  }

  function lever() {
    if (state.phase !== PHASE.WAIT_LEVER) return false;
    state.game += 1;
    const role = drawRole(state.setting);
    state.role = role.name;
    settlePayout(state, role.payout);
    logger.push(`#${String(state.game).padStart(6, '0')} ${role.name} PAYOUT ${role.payout} CREDIT ${state.credit}`);
    state.bet = 0;
    state.phase = PHASE.WAIT_BET;
    return true;
  }

  return { state, logger, maxBet, lever };
}
