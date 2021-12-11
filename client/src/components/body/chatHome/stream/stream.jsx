import Timer from "./timer";

import { AUDIOCALL, VIDEOCALL } from "../../../../constants/calling";
import "./stream.scss";

import { useEffect, useState } from "react";

function streamVideo(props) {
  const {
    user,
    callingType,
    myStream,
    partnerStream,
    handleCallCanceling,
    timer,
    useTimer,
  } = props;

  return (
    <div className="streamVideo">
      {callingType === VIDEOCALL && (
        <div className="videosWrapper">
          <video className="video-mine" ref={myStream} autoPlay />
          <video className="video-partner" ref={partnerStream} autoPlay />
        </div>
      )}
      {callingType === AUDIOCALL && (
        <div className="audiosWrapper">
          <img className="partnerImg" src={user.avatar} alt="" />
          <h2 className="partnerName">{user.name}</h2>
          <Timer />
          <audio ref={myStream} autoPlay />
          <audio ref={partnerStream} autoPlay />
        </div>
      )}

      <button onClick={handleCallCanceling}>
        <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  );
}

export default streamVideo;
