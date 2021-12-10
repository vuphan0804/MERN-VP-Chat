import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { DEFAULT_GROUP_AVATAR } from "../../../../../constants/conversation";
import { AUDIOCALL, VIDEOCALL } from "../../../../../constants/calling";

import "./groupCallModel.scss";

function GroupCallModel(props) {
  const { conversationId } = useParams();
  const {
    callingType,
    isCalling,
    grCallerUser,
    handleGrCallCanceling,
    handleGrCallAccepting,
    token,
  } = props;

  const [conversation, setConversation] = useState({});

  useEffect(() => {
    if (isCalling)
      axios({
        method: "GET",
        headers: {
          Authorization: token,
        },
        url: `/api/conversations/${conversationId}`,
      })
        .then((res) => {
          console.log(res.data);
          setConversation(res.data.conversation);
        })
        .catch((err) => {
          console.log(err);
        });
    else setConversation(props.conversation);
  }, []);

  return (
    <div className="callModel">
      <img className="partnerImg" src={DEFAULT_GROUP_AVATAR} alt="" />
      <h2 className="partnerName">{conversation.name}</h2>
      <p className="callingText">
        {callingType === AUDIOCALL
          ? `${grCallerUser.name} Audio Calling...`
          : callingType === VIDEOCALL
          ? `${grCallerUser.name} Video Calling...`
          : " Unknown Calling..."}
      </p>
      <div className="action">
        <button onClick={handleGrCallCanceling}>
          <i className="fas fa-phone-slash"></i>
        </button>
        {!isCalling && (
          <button onClick={handleGrCallAccepting}>
            {callingType === VIDEOCALL ? (
              <i className="fas fa-video"></i>
            ) : callingType === AUDIOCALL ? (
              <i className="fas fa-phone-alt"></i>
            ) : null}
          </button>
        )}
      </div>
    </div>
  );
}

export default GroupCallModel;
