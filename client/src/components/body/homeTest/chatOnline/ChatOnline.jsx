import React, {useEffect} from "react";
import {useHistory} from 'react-router-dom'
import axios from 'axios'

import {SELF_MESSAGE, DIRECT_MESSAGE} from '../../../../constants/conversation'

import "./ChatOnline.scss";

const BASE_API_URL = "http://localhost:8000"

function ChatOnline(props) {
  const {userId, onlineUser, token, setSelectedOnlineUser} = props;
  const history = useHistory();

  const handleClickedChat = () => {
    axios({
      method: "POST",
      data: {
        otherMembers: [onlineUser._id],
        type: onlineUser._id === userId ? SELF_MESSAGE: DIRECT_MESSAGE
      },
      headers: {
        Authorization: token,
      },
      url: `${BASE_API_URL}/api/me/conversations`,
    })
      .then((res) => {
        const selectedOnlineUser = res.data.conversation;
        setSelectedOnlineUser(selectedOnlineUser);
        history.push(`/conversations/${selectedOnlineUser._id}`)
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
            src={onlineUser.avatar}
            alt=""
          />
          <div className="chatOnlineBadge"></div>
        </div>
        <span className="chatOnlineName">{onlineUser.name}</span>
      </div>
    </div>
  );
}

export default ChatOnline;
