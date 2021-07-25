import React from "react";
import { Avatar, Typography } from "antd";
import styled from "styled-components";

const WrapperStyled = styled.div``;

function Message({ text, displayName, createAt, photoURL }) {
  return (
    <WrapperStyled className="message-wrapper">
      <div>
        <Avatar size="small" src={photoURL}>
          A
        </Avatar>
        <Typography.Text className="message-author">
          {displayName}
        </Typography.Text>
        <Typography.Text className="message-date">{createAt}</Typography.Text>
      </div>
      <div>
        <Typography.Text className="message-content">{text}</Typography.Text>
      </div>
    </WrapperStyled>
  );
}

export default Message;
