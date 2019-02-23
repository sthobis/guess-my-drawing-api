import express from "express";
import http from "http";
import socketio from "socket.io";
import PlayerManager from "./playerManager";

const PORT = process.env.PORT || 3004;
const app = express();
const server = http.Server(app);
const io = socketio(server);
const pm = new PlayerManager();

const EVENT = {
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  DISCONNECT: "disconnect",
  DISCONNECTING: "disconnecting",
  GENERAL_ERROR: "general_error",
  CLIENT_JOIN_ROOM: "client_join_room",
  CLIENT_LEAVE_ROOM: "client_leave_room",
  CLIENT_SUBMIT_ANSWER: "client_submit_answer",
  SERVER_JOIN_ERROR: "server_join_error",
  SERVER_UPDATE_PLAYER_LIST: "server_update_player_list",
  SERVER_NEW_ANSWER: "server_new_answer"
};

io.on(EVENT.CONNECT, socket => {
  socket.on(EVENT.CLIENT_JOIN_ROOM, (player, cb) => {
    try {
      pm.addPlayer({ ...player, socketId: socket.id });
      console.log(
        `${EVENT.CLIENT_JOIN_ROOM} : "${player.username}" has join the room.`
      );
      socket.broadcast.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
      cb(pm.players);
    } catch (err) {
      console.log(
        `${EVENT.CLIENT_JOIN_ROOM} : "${
          player.username
        }" failed to join the room.\nERR: ${err}`
      );
      socket.emit(EVENT.SERVER_JOIN_ERROR, err);
      socket.disconnect(true);
    }
  });

  socket.on(EVENT.CLIENT_LEAVE_ROOM, player => {
    pm.removePlayerBySocketId(player.socketId);
    console.log(
      `${EVENT.CLIENT_LEAVE_ROOM} : "${player.username}" has left the room.`
    );
    socket.broadcast.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
  });

  socket.on(EVENT.CLIENT_SUBMIT_ANSWER, payload => {
    console.log(
      `${EVENT.CLIENT_SUBMIT_ANSWER} : "${
        payload.player.username
      }" submit an answer.`
    );
    socket.broadcast.emit(EVENT.SERVER_NEW_ANSWER, payload);
  });

  socket.on(EVENT.DISCONNECT, reason => {
    console.log(`${EVENT.DISCONNECT} : ${reason}.`);
    const player = pm.removePlayerBySocketId(socket.id);
    console.log(
      `${EVENT.DISCONNECT} : "${player.username}" has left the room.`
    );
    socket.broadcast.emit(EVENT.SERVER_UPDATE_PLAYER_LIST, pm.players);
  });

  socket.on(EVENT.ERROR, err => {
    console.log(`${EVENT.ERROR} : ${err}`);
  });
});

app.get("/", (req, res) => {
  res.send("I'm listening!");
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`Ready on port ${PORT}`);
});
