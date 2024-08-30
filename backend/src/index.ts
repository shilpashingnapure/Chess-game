import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { Game } from "./ood/game";
import { handleGameEnd, handleMovePiece, handlePossibleMoves, handleSendMessage, notifyACtivePiece, PlayerVsComputer, PlayerVsPlayer } from "./controllers/gamePlayersController";

const app = express();
app.use(cors());
const server = createServer(app);

export const io = new Server(server);

export const waitingPlayers = [];
export const gameRooms = {};
let activePlayers = 0;

export function findRoomForSocket(socket){
  return Object.keys(gameRooms).find((room) => socket.rooms.has(room));
}

io.on("connection", (socket) => {
  activePlayers += 1;
  socket.emit("getPlayersTotalCount", {
    totalActivePlayers: activePlayers,
    totalWaitingPlayers: waitingPlayers.length,
  });


  socket.on("playerChoice", (data) => {
    // it means player waiting for another player to join
    if (data.content == "player") {
      PlayerVsPlayer(socket);
     
    } else {
      // player wants to play with computer
      PlayerVsComputer(socket);
    }
  });

  // move piece from start to end in board
  socket.on("movePiece", (data) => handleMovePiece(socket , data));
  socket.on("getMoves", (data) => handlePossibleMoves(socket , data));
  socket.on("selectPiece", (data) => notifyACtivePiece(socket , data));
  socket.on("sendMessage", (message) => handleSendMessage(socket , message));
  socket.on('gameEnd' , () => handleGameEnd(socket));


  socket.on("disconnect", () => {
    activePlayers -= 1;
    const index = waitingPlayers.indexOf(socket);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
    }

    
  });
});

server.listen(4000, () => {
  console.log("server is running !!!");
});
