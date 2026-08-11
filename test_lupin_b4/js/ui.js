export function renderState(core, logger) {
  const s = core.snapshot();
  document.getElementById('game').textContent = `#${String(s.gameNo).padStart(6,'0')}`;
  document.getElementById('setting').textContent = String(s.setting);
  document.getElementById('phase').textContent = s.phase;
  document.getElementById('credit').textContent = String(s.credit);
  document.getElementById('bet').textContent = String(s.bet);
  document.getElementById('payout').textContent = String(s.payout);
  document.getElementById('role').textContent = s.role;
  document.getElementById('betButton').disabled = s.phase !== 'WAIT_BET' || !core.creditSystem.canBet();
  document.getElementById('leverButton').disabled = s.phase !== 'WAIT_LEVER';
  document.getElementById('settingSelect').disabled = s.phase !== 'WAIT_BET';
  document.getElementById('log').textContent = logger.toText();
}
