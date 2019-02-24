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
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  DISCONNECTING: "disconnecting",
  GENERAL_ERROR: "general_error",
  CLIENT_JOIN_ROOM: "client_join_room",
  CLIENT_LEAVE_ROOM: "client_leave_room",
  CLIENT_SUBMIT_ANSWER: "client_submit_answer",
  CLIENT_UPDATE_DRAWING: "client_update_drawing",
  SERVER_JOIN_ERROR: "server_join_error",
  SERVER_UPDATE_PLAYER_LIST: "server_update_player_list",
  SERVER_NEW_ANSWER: "server_new_answer"
};

io.on(EVENT.CONNECT, socket => {
  socket.on(EVENT.CLIENT_JOIN_ROOM, player => {
    try {
      pm.addPlayer({ ...player, socketId: socket.id });
      io.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
    } catch (err) {
      socket.emit(EVENT.SERVER_JOIN_ERROR, err);
      socket.disconnect(true);
    }
  });

  socket.on(EVENT.CLIENT_LEAVE_ROOM, player => {
    pm.removePlayerBySocketId(player.socketId);
    socket.broadcast.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
  });

  socket.on(EVENT.CLIENT_SUBMIT_ANSWER, payload => {
    gm.challenge(payload);
    socket.broadcast.emit(EVENT.SERVER_NEW_ANSWER, payload);
  });

  socket.on(EVENT.CLIENT_UPDATE_DRAWING, payload => {
    socket.broadcast.emit(EVENT.CLIENT_UPDATE_DRAWING, payload);
  });

  socket.on(EVENT.DISCONNECT, e => {
    const player = pm.removePlayerBySocketId(socket.id);
    if (player) {
      socket.broadcast.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
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
