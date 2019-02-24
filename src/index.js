import express from "express";
import http from "http";
import socketio from "socket.io";
import GameManager from "./gameManager";
import PlayerManager from "./playerManager";

const PORT = process.env.PORT || 3004;
const app = express();
const server = http.Server(app);
const io = socketio(server);
const pm = new PlayerManager();
const gm = new GameManager(io, pm);

const EVENT = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  JOIN_ROOM_ERROR: "join_room_error",
  LEAVE_ROOM: "leave_room",
  SUBMIT_ANSWER: "submit_answer",
  UPDATE_DRAWING: "update_drawing",
  UPDATE_PLAYER_LIST: "update_player_list",
  UPDATE_ANSWER_LIST: "update_answer_list"
};

io.on(EVENT.CONNECT, socket => {
  socket.on(EVENT.JOIN_ROOM, player => {
    try {
      pm.addPlayer({ ...player, socketId: socket.id });
      io.emit(EVENT.UPDATE_PLAYER_LIST, pm.players);
    } catch (err) {
      socket.emit(EVENT.JOIN_ROOM_ERROR, err);
      socket.disconnect(true);
    }
  });

  socket.on(EVENT.LEAVE_ROOM, player => {
    pm.removePlayerBySocketId(player.socketId);
    socket.broadcast.emit(EVENT.UPDATE_PLAYER_LIST, pm.players);
  });

  socket.on(EVENT.SUBMIT_ANSWER, payload => {
    gm.challenge(payload);
    socket.broadcast.emit(EVENT.UPDATE_ANSWER_LIST, payload);
  });

  socket.on(EVENT.UPDATE_DRAWING, payload => {
    socket.broadcast.emit(EVENT.UPDATE_DRAWING, payload);
  });

  socket.on(EVENT.DISCONNECT, e => {
    const player = pm.removePlayerBySocketId(socket.id);
    if (player) {
      socket.broadcast.emit(EVENT.UPDATE_PLAYER_LIST, pm.players);
    }
  });
});

app.get("/", (req, res) => {
  res.send("I'm listening!");
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`Ready on port ${PORT}`);
  gm.startNewRound();
});
