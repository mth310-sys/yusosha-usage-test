export class CreditSystem {
  constructor(initialCredit = 50, betPerGame = 3) {
    this.credit = initialCredit;
    this.betPerGame = betPerGame;
    this.bet = 0;
    this.payout = 0;
    this.replayReady = false;
  }
  canBet() { return this.replayReady || this.credit >= this.betPerGame; }
  maxBet() {
    if (this.replayReady) {
      this.bet = this.betPerGame;
      this.replayReady = false;
      return true;
    }
    if (this.credit < this.betPerGame) return false;
    this.credit -= this.betPerGame;
    this.bet = this.betPerGame;
    return true;
  }
  settle(role) {
    this.payout = role.payout;
    this.credit += role.payout;
    this.replayReady = role.replay;
    this.bet = 0;
  }
  snapshot() {
    return { credit:this.credit, bet:this.bet, payout:this.payout, replayReady:this.replayReady };
  }
}
