// import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AUDIOCALL, VIDEOCALL } from "../../../../constants/calling";

require("./callModel.scss");

function callModel(props) {
  const {
    callingType,
    user,
    isCalling,
    handleCallCanceling,
    handleCallAccepting,
  } = props;

  // const [hours, setHours] = useState(0);
  // const [mins, setMins] = useState(0);
  // const [second, setSecond] = useState(0);
  // const [total, setTotal] = useState(0);
  return (
    <div className="callModel">
      <img className="partnerImg" src={user.avatar} alt="" />
      <h2 className="partnerName">{user.name}</h2>
      <p className="callingText">
        {callingType === AUDIOCALL
          ? "Audio Calling..."
          : callingType === VIDEOCALL
          ? "Video Calling..."
          : " Unknown Calling..."}
      </p>
      <div className="action">
        <button onClick={handleCallCanceling}>
          <i className="fas fa-phone-slash"></i>
        </button>
        {!isCalling && (
          <button onClick={handleCallAccepting}>
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

export default callModel;
