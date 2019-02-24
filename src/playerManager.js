class PlayerManager {
  constructor() {
    this.players = Array(8).fill(null);
  }

  addPlayer(player) {
    const availableSlot = this.players.indexOf(null);
    if (availableSlot === -1) {
      throw new Error("room_is_full");
    } else {
      this.players.splice(availableSlot, 1, player);
    }
    return player;
  }

  removePlayerBySocketId(socketId) {
    const playerIndex = this.players.findIndex(
      u => u && u.socketId === socketId
    );
    if (playerIndex >= 0) {
      this.players.push(null);
      return this.players.splice(playerIndex, 1)[0];
    }
    return null;
  }
}

export default PlayerManager;
