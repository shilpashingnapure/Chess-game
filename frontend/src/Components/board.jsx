import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



export const Board = ({ socket, currentPlayer }) => {
  const [board, setBoard] = useState();
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [activePiece, setActivePiece] = useState(null);

  const [currentTurn, setCurrentTurn] = useState("white");

  useEffect(() => {
    socket.on("getBoard", (board) => {
      setBoard(board);
    });

    socket.on("updateBoard", (board) => {
      setBoard(board);
      setPossibleMoves([]);
    });


    socket.on("activePiece", ({ row, col }) => {
      if (board) {
        const cell = board[row][col];
        setActivePiece(cell);
      }
    });

    socket.on("possibleMoves", (moves) => {
      setPossibleMoves(moves);
    });

    socket.on("currentTurn", (turn) => {
      setCurrentTurn(turn);
    });

    return () => {
      socket.off("startGame");
      socket.off("updateBoard");
      socket.off("possibleMoves");
    };
  }, [socket]);

  function handlePosition(row, col, index) {
    const cell = board[row][col];

    if (currentPlayer !== currentTurn) {
      return;
    }

    if (possibleMoves.includes(index)) {
      moveCurrentPiece(activePiece, cell);
    } else if (cell.piece && cell.piece.color !== currentTurn) {
      return;
    } else {
      setActivePiece(cell);
      socket.emit("selectPiece", { row, col });
      const piece = cell.piece;

      console.log(cell);
      if (piece) {
        // get moves from start to end;
        socket.emit("getMoves", { row, col });
      }
    }
  }

  function moveCurrentPiece(start, end) {
    socket.emit("movePiece", { start, end, currentTurnColor: currentTurn });
  }
  if (!board) {
    return <div>loading..</div>;
  }
  return (
    <div>
      <div className={`${currentPlayer == currentTurn ? 'your-turn' : 'opponent-turn' }`}>
        <img src="https://freepngimg.com/download/arrow/163746-icon-arrow-left-png-download-free.png" />
      </div>
      <div
        className={`board ${currentPlayer == "black" ? "rotate-board" : ""}`}
      >
        {Array.from({ length: board.length ** 2 }).map((_, index) => {
          const row = Math.floor(index / board.length);
          const col = index % board.length;
          const piece = board[row][col].piece;
          const backgroundColor =
            ((row % 2 === 0 && col % 2 !== 0) ||
              (row % 2 != 0 && col % 2 === 0)) &&
            "black-cells";
          const isActive =
            activePiece &&
            row === activePiece.x &&
            col === activePiece.y &&
            piece
              ? "active"
              : "";

          const codePoint =
            piece?.code && parseInt(piece?.code.replace("U+", ""), 16);
          const charcter = codePoint && String.fromCodePoint(codePoint);

          return (
            <div
              key={index}
              className={`${backgroundColor} ${isActive} grid-item ${piece?.color}`}
              onClick={() => handlePosition(row, col, index)}
            >
              {piece?.pieceType && <span>{charcter}</span>}

              {possibleMoves?.includes(index) && (
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Location_dot_grey.svg/1200px-Location_dot_grey.svg.png" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
