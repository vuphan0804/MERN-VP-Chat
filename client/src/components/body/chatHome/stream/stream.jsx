import {AUDIOCALL, VIDEOCALL} from '../../../../constants/calling'
require('./stream.scss')

function streamVideo (props)  {
  const {callingType, myStream, partnerStream, handleCallCanceling} = props;
  
  return (
    <div className="streamVideo">
      {
        callingType === VIDEOCALL && 
        <div className="videosWrapper">
          <video width="300" ref={myStream} autoPlay/>
          <video width="300" ref={partnerStream} autoPlay/>
        </div>
      }
      {
        callingType === AUDIOCALL && 
        <div className="videosWrapper">
          <audio controls ref={myStream} autoPlay/>
          <audio controls ref={partnerStream} autoPlay/>
        </div>
      }
      
      <button onClick={handleCallCanceling}>
          <i className="fas fa-phone-slash"></i>
      </button>
    </div>
  )
}

export default streamVideo;