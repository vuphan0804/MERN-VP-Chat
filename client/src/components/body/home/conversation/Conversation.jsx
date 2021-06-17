import React from "react";
import "./Conversation.scss";

function Conversation() {
  return (
    <div className="conversation">
      <img
        src="https://res.cloudinary.com/vuphan0804/image/upload/v1623749223/samples/animals/kitten-playing.gif"
        alt=""
        className="conversationImg"
      />

      <span className="conversationName">Vu Phan</span>
    </div>
  );
}

export default Conversation;
