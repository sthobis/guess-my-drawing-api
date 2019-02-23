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

  removePlayerBySocketId(socketId) {
    const playerIndex = this.players.findIndex(
      u => u && u.socketId === socketId
    );
    if (playerIndex === -1) {
      throw new Error("player_not_found");
    }
    const player = this.players.splice(playerIndex, 1, null)[0];
    return player;
  }
}

export default PlayerManager;
