import React from "react";
import { UserAddOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { Button, Tooltip, Avatar, Input, Form } from "antd";
import Message from "./Message";

import "./home.scss";

const HeaderStyled = styled.div``;
const ContentStyled = styled.div``;
const MessageListStyled = styled.div``;

export default function ChatWindow() {
  return (
    <div className="chat-window">
      <HeaderStyled className="header-chat">
        <div className="header-info">
          <p className="header-title">Room 1</p>
          <span className="header-description">This is room 1</span>
        </div>
        <div className="btn-group">
          <Button icon={<UserAddOutlined />} type="text">
            Invite
          </Button>
          <Avatar.Group size="small" maxCount={2}>
            <Tooltip title="A">
              <Avatar>A</Avatar>
            </Tooltip>
            <Tooltip title="B">
              <Avatar>B</Avatar>
            </Tooltip>
            <Tooltip title="C">
              <Avatar>C</Avatar>
            </Tooltip>
            <Tooltip title="D">
              <Avatar>D</Avatar>
            </Tooltip>
          </Avatar.Group>
        </div>
      </HeaderStyled>
      <ContentStyled className="content-chat">
        <MessageListStyled>
          <Message
            text="text"
            photoURL={null}
            displayName="Vuphan"
            createAt={12345}
          ></Message>
          <Message
            text="text"
            photoURL={null}
            displayName="Vuphan"
            createAt={12345}
          ></Message>
          <Message
            text="text"
            photoURL={null}
            displayName="Vuphan"
            createAt={12345}
          ></Message>
          <Message
            text="text"
            photoURL={null}
            displayName="Vuphan"
            createAt={12345}
          ></Message>
        </MessageListStyled>
        <Form className="form-chat">
          <Form.Item>
            <Input
              placeholder="Type a message.."
              bordered={false}
              autoComplete="off"
            />
          </Form.Item>
          <Button type="primary">Send</Button>
        </Form>
      </ContentStyled>
    </div>
  );
}
