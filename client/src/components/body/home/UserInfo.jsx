import React from "react";
import { Button, Avatar, Typography } from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import "./home.scss";

function UserInfo() {
  const auth = useSelector((state) => state.auth);

  const { user, isLogged } = auth;

  const handleLogout = async () => {
    try {
      await axios.get(`/user/logout`);
      localStorage.removeItem("firstLogin");
      window.location.href = "/login";
    } catch (err) {
      window.location.href = "/";
    }
  };
  return (
    <div className="user-info">
      <div>
        <Avatar src={user.avatar} />
        <Typography.Text className="user-name">{user.name} </Typography.Text>
      </div>
      <Link to="/" onClick={handleLogout}>
        <Button ghost>Log Out</Button>
      </Link>
    </div>
  );
}

export default UserInfo;
