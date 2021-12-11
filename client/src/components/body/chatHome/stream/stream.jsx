import { AUDIOCALL, VIDEOCALL } from "../../../../constants/calling";
import "./stream.scss";
import "../callModel/callModel";

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
  console.log("meomeo kiki", user);

  // Timer
  const formatTime = () => {
    const getSeconds = `0${timer % 60}`.slice(-2);
    const minutes = `${Math.floor(timer / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

    return `${getHours} : ${getMinutes} : ${getSeconds}`;
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
          <p>{formatTime(timer)}</p>
          <div controls ref={myStream} autoPlay />
          <div controls ref={partnerStream} autoPlay />
        </div>
      )}

      <button onClick={handleCallCanceling}>
        <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  );
}

export default streamVideo;
