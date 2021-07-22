import React from "react";

import "./Message.scss";

function Message({ own }) {
  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          src="https://res.cloudinary.com/vuphan0804/image/upload/v1623749223/samples/animals/kitten-playing.gif"
          alt=""
          className="messageImg"
        />
        <p className="messageText">
          {" "}
          Websocket là giao thức hỗ trợ giao tiếp hai chiều giữa client và
          server để tạo một kết nối trao đổi dữ liệu.
        </p>
      </div>
      <div className="messageBottom">1 minute ago</div>
    </div>
  );
}

export default Message;
