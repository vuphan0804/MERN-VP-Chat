import { AUDIOCALL, VIDEOCALL } from "../../../../constants/calling";
import "./stream.scss";
import "../callModel/callModel";
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

  // Timer
  const Timer = () => {
    useEffect(() => {
      var minutesLabel = document.getElementById("minutes");
      var secondsLabel = document.getElementById("seconds");
      var totalSeconds = 0;
      setInterval(setTime, 1000);

      function setTime() {
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
      }

      function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
          return "0" + valString;
        } else {
          return valString;
        }
      }
    }, []);

    return (
      <div style={{ marginTop: "5px" }}>
        <label id="minutes">00</label>:<label id="seconds">00</label>
      </div>
    );
  };

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
