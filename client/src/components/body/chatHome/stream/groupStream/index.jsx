/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";
import { AUDIOCALL, VIDEOCALL } from "../../../../../constants/calling";
require("./groupStream.scss");

function GroupStreamVideo(props) {
  const { callingType, myStream, otherMemberPeers, handleGrCallCanceling } =
    props;

  const OtherMemberVideo = (props) => {
    const streamRef = useRef();
    const { peer } = props;

    useEffect(() => {
      // TODO:
      // peer.on("stream", (stream) => {
      //   streamRef.current.srcObject = stream;
      // });
      streamRef.current.srcObject = myStream.current.srcObject;

      return () => {
        streamRef.current?.destroy();
      };
    }, []);

    return (
      <div className="participant">
        <video className="video-partner" ref={streamRef} autoPlay />
        <p>{peer.name}</p>
      </div>
    );
  };

  return (
    <div className="streamVideo">
      {callingType === VIDEOCALL && (
        <div className="videosWrapper">
          <div className="participant">
            <video className="video-mine" ref={myStream} autoPlay />
            <p>You</p>
          </div>
          {otherMemberPeers.map((peer, pos) => (
            <OtherMemberVideo key={pos} peer={peer} />
          ))}
        </div>
      )}
      {callingType === AUDIOCALL && (
        <div className="videosWrapper">
          <audio controls ref={myStream} autoPlay />
          {/* <audio controls ref={partnerStream} autoPlay /> */}
        </div>
      )}

      <button onClick={handleGrCallCanceling}>
        <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  );
}

export default GroupStreamVideo;
