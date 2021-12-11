/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from "react";

import Timer from "../timer";

import { AUDIOCALL, VIDEOCALL } from "../../../../../constants/calling";
require("./groupStream.scss");

function GroupStreamVideo(props) {
  const {
    callingType,
    myStream,
    otherMemberPeers,
    handleGrCallCanceling,
    conversation,
    auth,
  } = props;

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
      <div className="grParticipant">
        {callingType === VIDEOCALL ? (
          <video className="grVideo-partner" ref={streamRef} autoPlay />
        ) : (
          <div className="grVideo-partner">
            <img className="partnerImg" src={peer.avatar} alt="" />
            <audio className="grVideo-partner" ref={streamRef} autoPlay />
          </div>
        )}
        <p>{peer.name}</p>
      </div>
    );
  };

  return (
    <div className="grStreamVideo">
      <h1>{conversation.name}</h1>
      {callingType === VIDEOCALL && (
        <div className="grVideosWrapper">
          <div className="grParticipant">
            <video className="grVideo-mine" ref={myStream} autoPlay />
            <p>You</p>
          </div>
          {otherMemberPeers.map((peer, pos) => (
            <OtherMemberVideo key={pos} peer={peer} />
          ))}
        </div>
      )}
      {callingType === AUDIOCALL && (
        <div className="grVideosWrapper">
          <div className="grParticipant">
            <div className="grVideo-partner">
              <img className="partnerImg" src={auth.user.avatar} alt="" />
              <audio className="grVideo-partner" ref={myStream} autoPlay />
              <p>You</p>
            </div>
          </div>
          {otherMemberPeers.map((peer, pos) => (
            <OtherMemberVideo key={pos} peer={peer} />
          ))}
        </div>
      )}
      <Timer />

      <button onClick={handleGrCallCanceling}>
        <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  );
}

export default GroupStreamVideo;
