import { forwardRef, useEffect, useState } from "react";
import { Board } from "./board";
import { Chat } from "./chat";
import { History } from "./history";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Dialog, DialogContent, Slide } from "@mui/material";

const gameStatus = {
  Checked: "Checked",
  CheckMate: "CheckMate",
  GameOver: "GameOver",
  Continue: "Continue",
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export const Game = ({ socket }) => {
  const navigate = useNavigate();
  const [currentPlayer, setCurrentPlayer] = useState();

  const [blackRemovedPiece, setBlackRemovedPiece] = useState([]);
  const [whiteRemovedPiece, setWhiteRemovedPiece] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);

  const [status, setStatus] = useState();

  const [playerStatus, setPlayerStatus] = useState();

  useEffect(() => {

    socket.on('opponentDisconnected' , ({ message }) => {
      alert(message); 
      handleGoBack();   
    });


    socket.on("startGame", ({ gameId, players }) => {
      // set current player
      if (players.white == socket.id) {
        setCurrentPlayer("white");
      } else {
        setCurrentPlayer("black");
      }
    });

    socket.on("gameStatus", ({ status, winner, checkedColor }) => {
      setStatus('');
      setPlayerStatus();
      if (status !== gameStatus.Continue) {
        setOpenDialog(true);
        setStatus(status);
        setPlayerStatus({
          winner,
          checkedColor,
        });
      }
    });

    socket.on("getKilledPieces", ({ whiteKilledPieces, blackKilledPieces }) => {
      setWhiteRemovedPiece(whiteKilledPieces);
      setBlackRemovedPiece(blackKilledPieces);
    });

    if (openDialog && status !== gameStatus.GameOver) {
      setTimeout(() => {
        setOpenDialog(false);
      }, 3000);
    }
  }, []);


  function handleGameEnd(){
    socket.emit('gameEnd');
    handleGoBack();
  }

  function handleGoBack(){
    socket.disconnect();
    navigate('/');
  }

  if (!currentPlayer) {
    return <div className="waiting-player">
      <div className="waiting-player">
        <p>waiting Player to join</p>
      <CircularProgress />
      </div>
      <button onClick={handleGoBack}>Go back to home</button>
    </div>;
  }
  return (
    <div className="game">
      <div className="players-killedPiece">
        <div>
          <h2>Player 1 ({currentPlayer == "white" ? 'You' : 'opponent'})</h2>
          <KilledPieceContainer killedLists={whiteRemovedPiece} />
        </div>

        <div>
          <h2>Player 2 ({currentPlayer == "black" ? 'You' : 'opponent'})</h2>
          <KilledPieceContainer killedLists={blackRemovedPiece} />
        </div>
      </div>
      <div className="container">
        <Board socket={socket} currentPlayer={currentPlayer} />
      </div>
      <button className="gameEnd-button" onClick={handleGameEnd}>
        End Game
      </button>
      <History socket={socket} />
      <Chat socket={socket} />

      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        onClose={() => setOpenDialog(false)}
        keepMounted
        hideBackdrop
      >
        <DialogContent>
          <div className="dailog-game-status">
            {status !== gameStatus.GameOver ? (
              <h3>
                {playerStatus?.checkedColor === "white" ? (
                  <span>&#9812;</span>
                ) : (
                  <span>&#9818;</span>
                )}
                <p>{status}</p>
              </h3>
            ) : (
              <div className="game-over">
                <div>
                  <div>
                    {currentPlayer == "white" ? (
                      <span>&#9812;</span>
                    ) : (
                      <span>&#9818;</span>
                    )}
                    <p>
                      {playerStatus.winner == currentPlayer
                        ? "Your Winner"
                        : "You Lost"}
                    </p>
                  </div>
                  <div>VS</div>
                  <div>
                    {currentPlayer !== "white" ? (
                      <span>&#9812;</span>
                    ) : (
                      <span>&#9818;</span>
                    )}
                    <p>
                      {playerStatus.winner !== currentPlayer
                        ? "Winner"
                        : "Lost"}
                    </p>
                  </div>
                </div>

                <button onClick={() => navigate("/")}>
                  {playerStatus.winner == currentPlayer
                    ? "New Game"
                    : "Play again"}{" "}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KilledPieceContainer = ({ killedLists }) => {
  if (!killedLists) {
    return;
  }
  const piece = killedLists[0];
  return (
    <div
      className={`${piece?.color == "white" ? "white-piece" : "black-piece"}`}
    >
      {killedLists.map((item, index) => {
        const codePoint =
          item?.code && parseInt(item?.code.replace("U+", ""), 16);
        const charcter = codePoint && String.fromCodePoint(codePoint);

        return (
          <div key={index} className={` ${item?.color}`}>
            {charcter}
          </div>
        );
      })}
    </div>
  );
};
