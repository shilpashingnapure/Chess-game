// to join room player vs player

import { findRoomForSocket, gameRooms, io, waitingPlayers } from "..";
import { Color } from "../ood/enums";
import { Game } from "../ood/game";
import { getAvailableMoves } from "../ood/MoveCalculationService";

export const PlayerVsComputer = (socket: any) => {
  const gameRoom = `game-${socket.id}-computer`;
  socket.join(gameRoom);
  const players = {
    white: socket.id,
    black: "computer",
  };

  const game = new Game();
  gameRooms[gameRoom] = { game, messages: [], players };
  const board = game.board.board;
  io.to(gameRoom).emit("startGame", { gameId: gameRoom, players });
  io.to(gameRoom).emit("getBoard", board);
};

export const PlayerVsPlayer = (socket: any) => {
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift();

    const gameRoom = `game-${opponent.id}-${socket.id}`;
    socket.join(gameRoom);
    opponent.join(gameRoom);

    const players = {
      white: opponent.id,
      black: socket.id,
    };

    // create a new game instance for this room
    const game = new Game();
    gameRooms[gameRoom] = { game, messages: [], players };

    const board = game.board.board;
    // for both players in room
    io.to(gameRoom).emit("startGame", { gameId: gameRoom, players });
    io.to(gameRoom).emit("getBoard", board);
  } else {
    waitingPlayers.push(socket);
  }
};

const makeComputerMove = (room) => {
  // get random moves
  const game = gameRooms[room].game;

  const board = game.board.board;

  const availableMoves = getAvailableMoves(board, Color.black);

  if (availableMoves.length > 0) {
    const move =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    const endCellIndex = move.end[Math.floor(Math.random() * move.end.length)];
    const endCellX = Math.floor(endCellIndex / board.length); 
    const endCellY = endCellIndex % board.length;
    const endCell = board[endCellX][endCellY]
    game.board.movePiece(move.start, endCell);
    const currentTurn = game.changeTurn();
    const gameStatus = game.board.checkWinner(Color.black);
    const [whiteKilledPieces, blackKilledPieces] = game.board.getRemovedPiece();

    io.to(room).emit("updateBoard", game.board.board);
    io.to(room).emit("currentTurn", currentTurn);
    io.to(room).emit("gameStatus", gameStatus);
    io.to(room).emit("getKilledPieces", {
      whiteKilledPieces,
      blackKilledPieces,
    });
    io.to(room).emit("moveHistory", game.board.moveHistory);

  }
};

// move Piece
export const handleMovePiece = (
  socket: any,
  { start, end, currentTurnColor }: any
) => {
  const room = findRoomForSocket(socket);
  if (room) {
    const game = gameRooms[room].game;
    const board = game.board;
    game.board.movePiece(start, end);
    const currentTurn = game.changeTurn();
    const gameStatus = game.board.checkWinner(currentTurnColor);
    const [whiteKilledPieces, blackKilledPieces] = game.board.getRemovedPiece();

    io.to(room).emit("updateBoard", game.board.board);
    io.to(room).emit("currentTurn", currentTurn);
    io.to(room).emit("gameStatus", gameStatus);
    io.to(room).emit("getKilledPieces", {
      whiteKilledPieces,
      blackKilledPieces,
    });
    io.to(room).emit("moveHistory", board.moveHistory);

    // check if it's the computer's turn
    if (
      currentTurn === Color.black &&
      gameRooms[room].players.black == "computer"
    ) {
      setTimeout(() => makeComputerMove(room), 1000);

    }

    
  }
};

// get possible moves on selected piece
export const handlePossibleMoves = (socket: any, { row, col }: any) => {
  const room = findRoomForSocket(socket);
  if (room) {
    const game = gameRooms[room].game;
    const board = game.board.board;
    const cell = board[row][col];
    const piece = cell.piece;
    if (piece) {
      const possibleMoves = piece.showAllPossibleMove(
        row,
        col,
        piece.color,
        board
      );
      io.to(room).emit("possibleMoves", possibleMoves);
    }
  }
};

// notify to both player which piece is active
export const notifyACtivePiece = (socket: any, { row, col }: any) => {
  const room = findRoomForSocket(socket);
  if (room) {
    io.to(room).emit("activePiece", { row, col });
  }
};

// this is for player vs player
export const handleSendMessage = (socket: any, message: any) => {
  const room = findRoomForSocket(socket);
  if (room) {
    const messages = gameRooms[room].messages;
    messages.push(message);

    gameRooms[room].messages = [...messages];

    io.to(room).emit("messageSent", messages);
  }
};

export const handleGameEnd = (socket: any) => {
  const room = findRoomForSocket(socket);
  if (room) {
    // Notify the opponent that the player has disconnected
    io.to(room).emit("opponentDisconnected", {
      message: "Your opponent has disconnected.",
    });

    // Optionally, remove the game room and game instance if desired
    delete gameRooms[room];
  }
};
