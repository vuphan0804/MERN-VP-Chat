import React from "react";
import "./ChatOnline.scss";

function ChatOnline(props) {
  const {user} = props;
  return (
    <div className="chatOnline">
      <div className="chatOnlineFriend">
        <div className="chatOnlineImgContainer">
          <img
            className="chatOnlineImg"
            src={user.avatar}
            alt=""
          />
          <div className="chatOnlineBadge"></div>
        </div>
        <span className="chatOnlineName">{user.name}</span>
      </div>
    </div>
  );
}

export default ChatOnline;
