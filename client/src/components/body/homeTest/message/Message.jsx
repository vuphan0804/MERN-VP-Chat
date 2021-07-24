import React from "react";

import "./Message.scss";

function Message({ own, message }) {
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          src={message.sender.avatar}
          alt=""
          className="messageImg"
        />
        <p className="messageText">
          {" "}
          {message.text}
        </p>
      </div>
      <div className="messageBottom">{message.createdAt}</div>
    </div>
  );
}

export default Message;
