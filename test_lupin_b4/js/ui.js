const spinTimers = [null,null,null];
const spinSymbols = ['LUPIN','JIGEN','GOEMON','BAR','CHERRY','COIN','REPLAY'];

export function startReelAnimation() {
  document.querySelectorAll('.reel-cell').forEach((cell, index) => {
    clearInterval(spinTimers[index]);
    let p = index;
    spinTimers[index] = setInterval(() => {
      p = (p + 1) % spinSymbols.length;
      cell.textContent = spinSymbols[p];
    }, 70 + index * 12);
    cell.classList.add('spinning');
  });
}

export function stopReelAnimation(index, symbol) {
  clearInterval(spinTimers[index]);
  spinTimers[index] = null;
  const cell = document.querySelector(`.reel-cell[data-reel="${index}"]`);
  if (!cell) return;
  cell.textContent = symbol;
  cell.classList.remove('spinning');
}

export function renderState(core, logger) {
  const s = core.snapshot();
  document.getElementById('game').textContent = `#${String(s.gameNo).padStart(6,'0')}`;
  document.getElementById('setting').textContent = String(s.setting);
  document.getElementById('phase').textContent = s.phase;
  document.getElementById('mode').textContent = s.normal.mode;
  document.getElementById('normalGames').textContent = String(s.normal.gameCount);
  document.getElementById('wanted').textContent = String(s.normal.wantedCount);
  document.getElementById('wantedTarget').textContent = `${s.normal.wantedTargetZone.min}-${s.normal.wantedTargetZone.max}G`;
  document.getElementById('wantedState').textContent = s.normal.wantedState;
  document.getElementById('wantedChanceGames').textContent = String(s.normal.wantedChanceGameCount);
  document.getElementById('holdCapacity').textContent = s.normal.holdCapacity == null ? '---' : String(s.normal.holdCapacity);
  document.getElementById('credit').textContent = String(s.credit);
  document.getElementById('bet').textContent = String(s.bet);
  document.getElementById('payout').textContent = String(s.payout);
  document.getElementById('role').textContent = s.role;

  document.getElementById('betButton').disabled = s.phase !== 'WAIT_BET' || !core.creditSystem.canBet();
  document.getElementById('leverButton').disabled = s.phase !== 'WAIT_LEVER';
  document.getElementById('settingSelect').disabled = s.phase !== 'WAIT_BET';
  document.getElementById('wantedSeek').disabled = s.phase !== 'WAIT_BET' || s.normal.mode !== 'NORMAL';

  document.querySelectorAll('[data-stop]').forEach(button => {
    const i = Number(button.dataset.stop);
    button.disabled = s.phase !== 'SPINNING' || s.reels.stopped[i];
  });

  document.getElementById('stopOrder').textContent = s.reels.stopOrder.length
    ? s.reels.stopOrder.map(i => ['L','C','R'][i]).join(' → ')
    : '---';
  document.getElementById('log').textContent = logger.toText();
}
