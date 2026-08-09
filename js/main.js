(() => {
  'use strict';

  const els = {
    count: document.querySelector('#count'),
    actionCount: document.querySelector('#actionCount'),
    maxCount: document.querySelector('#maxCount'),
    history: document.querySelector('#history'),
    stateBadge: document.querySelector('#stateBadge'),
    addOne: document.querySelector('#addOne'),
    addTen: document.querySelector('#addTen'),
    subtractOne: document.querySelector('#subtractOne'),
    reset: document.querySelector('#reset'),
    clearHistory: document.querySelector('#clearHistory')
  };

  const state = {
    count: 0,
    actions: 0,
    max: 0,
    history: []
  };

  function addHistory(label, before, after) {
    state.history.unshift(`${label}: ${before} → ${after}`);
    state.history = state.history.slice(0, 8);
  }

  function setBadge(text) {
    els.stateBadge.textContent = text;
  }

  function render() {
    els.count.textContent = String(state.count);
    els.actionCount.textContent = String(state.actions);
    els.maxCount.textContent = String(state.max);

    if (state.history.length === 0) {
      els.history.innerHTML = '<li>まだ操作はありません</li>';
      return;
    }

    els.history.innerHTML = state.history
      .map(item => `<li>${item}</li>`)
      .join('');
  }

  function changeCount(delta, label) {
    const before = state.count;
    state.count += delta;
    state.actions += 1;
    state.max = Math.max(state.max, state.count);
    addHistory(label, before, state.count);
    setBadge('UPDATED');
    render();
  }

  function resetCount() {
    const before = state.count;
    state.count = 0;
    state.actions += 1;
    addHistory('RESET', before, 0);
    setBadge('RESET');
    render();
  }

  function clearHistory() {
    state.history = [];
    setBadge('CLEARED');
    render();
  }

  els.addOne.addEventListener('click', () => changeCount(1, '+1'));
  els.addTen.addEventListener('click', () => changeCount(10, '+10'));
  els.subtractOne.addEventListener('click', () => changeCount(-1, '−1'));
  els.reset.addEventListener('click', resetCount);
  els.clearHistory.addEventListener('click', clearHistory);

  render();
})();
