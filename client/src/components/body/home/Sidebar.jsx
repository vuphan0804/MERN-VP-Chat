import React from "react";
import { Row, Col } from "antd";
import UserInfo from "./UserInfo";
import RoomList from "./RoomList";

import "./home.scss";

function Sidebar() {
  return (
    <div className="sidebar">
      <Row>
        <Col span={24}>
          <UserInfo />
        </Col>
        <Col span={24}>
          <RoomList />
        </Col>
      </Row>
    </div>
  );
}

export default Sidebar;
