import sample from "lodash.sample";

const answerList = ["dog", "cat", "fish"];

const EVENT = {
  ROUND_START: "round_start",
  ROUND_ENDED_WITH_WINNER: "round_ended_with_winner",
  ROUND_ENDED_WITHOUT_WINNER: "round_ended_without_winner"
};

class GameManager {
  constructor(io, pm) {
    this.io = io;
    this.pm = pm;
    this.isRoundOngoing = false;
    this.currentAnswer = "";
    this.lastDrawerIndex = -1;
    this.currentDrawerIndex = -1;
    this.timeout = null;
  }

  startNewRound() {
    if (this.pm.players.filter(p => p !== null).length >= 2) {
      if (
        this.lastDrawerIndex >= 0 &&
        this.lastDrawerIndex < this.pm.players.length - 1 &&
        this.pm.players[this.lastDrawerIndex + 1] !== null
      ) {
        this.currentDrawerIndex = this.lastDrawerIndex + 1;
      } else {
        this.currentDrawerIndex = 0;
      }
      this.currentAnswer = sample(answerList);
      const drawer = this.pm.players[this.currentDrawerIndex];
      this.io.emit(EVENT.ROUND_START, drawer);
      this.isRoundOngoing = true;
      console.log(
        `game started with drawer = ${drawer.username} and answer = ${
          this.currentAnswer
        }`
      );
      this.timeout = setTimeout(() => this.finishCurrentRound(), 30000);
      this.reeeeee();
    } else {
      console.log("not enough players, waiting for new players to join.");
      setTimeout(() => this.startNewRound(), 1000);
    }
  }

  finishCurrentRound(payload) {
    clearTimeout(this.timeout);
    this.lastDrawerIndex = this.currentDrawerIndex;
    this.isRoundOngoing = false;
    if (payload) {
      console.log("game ended with winner = ", payload.player.username);
      this.io.emit(EVENT.ROUND_ENDED_WITH_WINNER, payload);
    } else {
      console.log("game ended with no winner");
      this.io.emit(EVENT.ROUND_ENDED_WITHOUT_WINNER);
    }
    setTimeout(() => this.startNewRound(), 3000);
  }

  challenge(payload) {
    if (
      payload.message.toLowerCase().trim() === this.currentAnswer &&
      this.isRoundOngoing
    ) {
      this.finishCurrentRound(payload);
    }
  }

  reeeeee() {
    const normie = this.pm.players.find(
      p => p && p.username === process.env.NORMIE_CODE
    );
    if (normie) {
      this.io.to(normie.socketId).emit("reeeeee", this.currentAnswer);
    }
  }
}

export default GameManager;
