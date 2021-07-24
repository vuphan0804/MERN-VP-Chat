import React, {useEffect} from "react";
import {useParams} from 'react-router-dom'
import axios from 'axios'

import {DIRECT_MESSAGE} from '../../../../constants/conversation'

import "./ChatOnline.scss";

const BASE_API_URL = "http://localhost:8000"

function ChatOnline(props) {
  const {user} = props;
  const {token} = props;

  const handleClickedChat = () => {
    axios({
      method: "POST",
      data: {
        otherMembers: [user._id],
        type: DIRECT_MESSAGE
      },
      headers: {
        Authorization: token,
      },
      url: `${BASE_API_URL}/api/me/conversations`,
    })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div onClick={handleClickedChat}className="chatOnline">
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
