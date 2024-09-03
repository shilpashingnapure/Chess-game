import "./App.css";
import io from "socket.io-client";
import { Route, Routes } from "react-router-dom";
import { Home } from "./Components/home";
import { Game } from "./Components/game";


const backendURL = process.env.REACT_APP_BACKEND_URL;

const socket = io(backendURL, {
  transports: ["websocket"],
});

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home socket={socket}/>}></Route>
        <Route path="/game" element={<Game socket={socket}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
