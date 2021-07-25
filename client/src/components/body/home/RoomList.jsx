import React from "react";
import { Collapse, Typography, Button } from "antd";
import styled from "styled-components";
import { PlusSquareOutlined } from "@ant-design/icons";

import "./home.scss";

const { Panel } = Collapse;

const PanelStyled = styled(Panel)`
  &&& {
    .ant-collapse-header,
    p {
      color: white;
    }
    .ant-collapse-content-box {
      padding: 0 40px;
    }
  }
`;

const LinkStyled = styled(Typography.Link)`
  display: block;
  margin-bottom: 5pxl;
  color: white;
`;

function RoomList() {
  return (
    <Collapse ghost defaultActiveKey={["1"]} className="room-list">
      <PanelStyled header="Room List" key="1" style={{ color: "white" }}>
        <LinkStyled>Room 1</LinkStyled>
        <LinkStyled>Room 2</LinkStyled>
        <LinkStyled>Room 3</LinkStyled>
        <Button
          type="text"
          icon={<PlusSquareOutlined />}
          ghost
          className="add-room"
        >
          Add Room
        </Button>
      </PanelStyled>
    </Collapse>
  );
}

export default RoomList;
