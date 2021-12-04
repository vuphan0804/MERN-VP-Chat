import React from "react";
import FileViewer from "react-file-viewer";

import { getTypeFromFilePath } from "../../../../../helpers/funcHepler";

import { TEXT } from "../../../../../constants/message";

import "./Message.scss";

function Message({ own, message }) {
  console.log(message);
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img src={message.sender.avatar} alt="" className="messageImg" />
        {message.type === TEXT ? (
          <p className="messageText"> {message.text}</p>
        ) : (
          <img className="messageImage" src={message.path} alt="file img" />
        )}
      </div>
      <div className="messageBottom">{message.createdAt}</div>
    </div>
  );
}

export default Message;
