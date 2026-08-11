import { MACHINE } from './config.js';
import { RNG } from './rng.js';
import { getSettingProfile } from './setting-profile.js';
import { drawRole } from './role-lottery.js';
import { CreditSystem } from './credit.js';

export class GameCore {
  constructor({setting=1, seed=Date.now()} = {}) {
    this.setting = Number(setting);
    this.profile = getSettingProfile(this.setting);
    this.rng = new RNG(seed);
    this.creditSystem = new CreditSystem(MACHINE.initialCredit, MACHINE.betPerGame);
    this.gameNo = 0;
    this.phase = 'WAIT_BET';
    this.lastRole = null;
  }
  setSetting(setting) {
    if (this.phase !== 'WAIT_BET') return false;
    this.setting = Number(setting);
    this.profile = getSettingProfile(this.setting);
    return true;
  }
  bet() {
    if (this.phase !== 'WAIT_BET') return false;
    if (!this.creditSystem.maxBet()) return false;
    this.phase = 'WAIT_LEVER';
    return true;
  }
  lever() {
    if (this.phase !== 'WAIT_LEVER') return null;
    this.phase = 'ROLE_LOTTERY';
    this.gameNo += 1;
    const before = this.creditSystem.snapshot();
    const role = drawRole(this.profile, this.rng);
    this.lastRole = role;
    this.creditSystem.settle(role);
    const after = this.creditSystem.snapshot();
    this.phase = 'WAIT_BET';
    return {
      gameNo:this.gameNo,
      setting:this.setting,
      role:role.name,
      payout:role.payout,
      replay:role.replay,
      creditBefore:before.credit,
      creditAfter:after.credit,
      nextPhase:this.phase
    };
  }
  snapshot() {
    return {
      gameNo:this.gameNo,
      setting:this.setting,
      phase:this.phase,
      role:this.lastRole?.name ?? '----',
      ...this.creditSystem.snapshot()
    };
  }
}
