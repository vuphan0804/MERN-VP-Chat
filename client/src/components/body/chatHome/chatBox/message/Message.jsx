import React from "react";
import Link from "@mui/material/Link";

import {
  getFileNameFromFilePath,
  getFileTypeFromFilePath,
} from "../../../../../helpers/funcHepler";

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
        ) : ["png", "jpeg", "jpe", "jpg"].includes(
            getFileTypeFromFilePath(message.path)
          ) ? (
          <img className="messageImage" src={message.path} alt="file img" />
        ) : (
          <Link className="messageText" href={message.path} underline="hover">
            {getFileNameFromFilePath(message.path)}
          </Link>
        )}
      </div>
      <div className="messageBottom">{message.createdAt}</div>
    </div>
  );
}

export default Message;
