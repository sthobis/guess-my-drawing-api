class PlayerManager {
  constructor() {
    this.players = Array(8).fill(null);
  }

  addPlayer(player) {
    const availableSlot = this.players.indexOf(null);
    if (availableSlot === -1) {
      throw new Error("room_is_full");
    }
    this.players[availableSlot] = player;
    return player;
  }

  removePlayerById(id) {
    const playerIndex = this.players.findIndex(u => u.id === id);
    if (playerIndex === -1) {
      throw new Error("player_not_found");
    }
    const player = this.players.splice(playerIndex, 1)[0];
    return player;
  }
}

export default PlayerManager;
