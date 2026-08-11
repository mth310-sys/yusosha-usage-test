export function placeBet(state, amount) {
  if (state.credit < amount) return false;
  state.credit -= amount;
  state.bet = amount;
  state.payout = 0;
  return true;
}

export function settlePayout(state, payout) {
  state.payout = payout;
  state.credit += payout;
}
