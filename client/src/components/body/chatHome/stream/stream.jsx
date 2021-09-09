import { AUDIOCALL, VIDEOCALL } from "../../../../constants/calling";
require("./stream.scss");

function streamVideo(props) {
  const { callingType, myStream, partnerStream, handleCallCanceling } = props;
  return (
    <div className="streamVideo">
      {callingType === VIDEOCALL && (
        <div className="videosWrapper">
          <video className="video-mine" ref={myStream} autoPlay />
          <video className="video-partner" ref={partnerStream} autoPlay />
        </div>
      )}
      {callingType === AUDIOCALL && (
        <div className="videosWrapper">
          <audio controls ref={myStream} autoPlay />
          <audio controls ref={partnerStream} autoPlay />
        </div>
      )}

      <button onClick={handleCallCanceling}>
        <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  );
}

export default streamVideo;
