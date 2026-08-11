export function bindUI(core) {
  const $ = id => document.getElementById(id);
  const el = {
    game: $('game'), setting: $('setting'), phase: $('phase'), credit: $('credit'),
    bet: $('bet'), payout: $('payout'), role: $('role'), log: $('log'),
    betButton: $('betButton'), leverButton: $('leverButton')
  };

  function render() {
    const s = core.state;
    el.game.textContent = `#${String(s.game).padStart(6, '0')}`;
    el.setting.textContent = s.setting;
    el.phase.textContent = s.phase;
    el.credit.textContent = s.credit;
    el.bet.textContent = s.bet;
    el.payout.textContent = s.payout;
    el.role.textContent = s.role;
    el.log.textContent = core.logger.text();
    el.betButton.disabled = s.phase !== 'WAIT_BET' || s.credit < 3;
    el.leverButton.disabled = s.phase !== 'WAIT_LEVER';
  }

  el.betButton.addEventListener('click', () => { core.maxBet(); render(); });
  el.leverButton.addEventListener('click', () => { core.lever(); render(); });
  render();
}
