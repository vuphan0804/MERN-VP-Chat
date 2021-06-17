import React from "react";
import "./ChatOnline.scss";

function ChatOnline() {
  return (
    <div className="chatOnline">
      <div className="chatOnlineFriend">
        <div className="chatOnlineImgContainer">
          <img
            className="chatOnlineImg"
            src="https://res.cloudinary.com/vuphan0804/image/upload/v1623749223/samples/animals/kitten-playing.gif"
            alt=""
          />
          <div className="chatOnlineBadge"></div>
        </div>
        <span className="chatOnlineName">Vu Phan</span>
      </div>
    </div>
  );
}

export default ChatOnline;
