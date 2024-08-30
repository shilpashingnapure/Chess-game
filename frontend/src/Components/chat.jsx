import { useEffect, useRef, useState } from "react";

export const Chat = ({ socket }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const [isNewMsg, setNewMsg] = useState(false);

  const [openBox, setOpenBox] = useState(false);

  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on("messageSent", (data) => {
      if (messages.length != data.length) {
        setNewMsg(true);
      }

      setMessages(data);

      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  function sendMesg() {
    const message = {
      text,
      socketId: socket.id,
    };
    setMessages([...messages , text]);
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setText("");
    socket.emit("sendMessage", message);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      sendMesg();
    }
  }

  return (
    <div className="chat">
      <button
        className="chat-icon"
        onClick={() => {
          setOpenBox(!openBox);
          setNewMsg(false);
        }}
      >
        {isNewMsg && !openBox ? <span>1</span> : ""}
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe5Q6tKljOdWyzL7ROdOPCdw0g0y8Uo-V2yg&s" />
      </button>

      <div className={`chat-box ${openBox ? "open-box" : ""}`}>
        <div>
          <div className="messages">
            {messages &&
              messages.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`${
                      socket.id == item.socketId
                        ? "you-message"
                        : "opponent-message"
                    }`}
                  >
                    {item.text}
                  </div>
                );
              })}
          </div>
          <div ref={messageEndRef}></div>
        </div>

        <div className="send-msg">
          <input
            type="text"
            onChange={(e) => setText(e.target.value)}
            value={text}
            onKeyDown={handleKeyDown}
            placeholder="Enter msg"
          />
          <button onClick={sendMesg} className="icon">
            <img src="https://w7.pngwing.com/pngs/10/412/png-transparent-computer-icons-send-miscellaneous-angle-rectangle-thumbnail.png" />
          </button>
        </div>
      </div>
    </div>
  );
};
