import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [activePlayers , setActivePlayers] = useState(0);
  const [waitingPlayers , setWaitingPlayers] = useState(0);
  useEffect(() => {


    socket.on('getPlayersTotalCount' , ({ totalActivePlayers , totalWaitingPlayers }) => {
        console.log(totalActivePlayers , totalWaitingPlayers);
        setActivePlayers(totalActivePlayers);
        setWaitingPlayers(totalWaitingPlayers)
    })

  },[]);
  function getPlayerChoice(choice) {
    socket.emit("playerChoice", {
      content: choice,
    });

    navigate("/game");
  }
  return (
    <div className="home-container">
      <img src="https://www.shutterstock.com/image-vector/chess-game-concept-colorful-poster-600nw-2108028299.jpg" />
      <div className="home">
        <div className="players-count-display">
          <div>Total Active Players {activePlayers}</div>
          <div>Total Waiting Players {waitingPlayers}</div>
        </div>

        <div className="home-card">
          <h1 className="home-header">Chess Game
          </h1>
          <div>
            <button onClick={() => getPlayerChoice("computer")}>
              Player Vs Computer
            </button>
            <button onClick={() => getPlayerChoice("player")}>
              Player Vs Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
