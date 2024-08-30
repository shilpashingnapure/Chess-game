import { useEffect, useRef, useState } from "react";

export const History = ({ socket }) => {
  const [moveHistory, setMoveHistory] = useState(null);
  const historyEndRef = useRef(null);
  useEffect(() => {
    socket.on("moveHistory", (data) => {
      setMoveHistory(data);
      historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  if (!moveHistory) {
    return;
  }
  return (
    <div className="history">
      <div className="head-history">History of players</div>
      <div className="history-data">
        <div>
          <h2>White</h2>
          <div>
          {moveHistory.map((item, index) => {
            if (index % 2 == 0) {
              return (
                <div key={index}>
                  <span>{item}</span>
                </div>
              );
            }
            return;
          })}
          </div>
        </div>
        <div>
          <h2>Black</h2>
          <div>
          {moveHistory.map((item, index) => {
            if (index % 2 == 1) {
              return (
                <div key={index}>
                  <span>{item}</span>
                </div>
              );
            }
            return;
          })}
          </div>
        </div>
        <div ref={historyEndRef}></div>
      </div>
      
    </div>
  );
};
