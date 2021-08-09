require('./actionBar.scss');

function actionBar(props) {
  const {partner, handleAudioCalling, handleVideoCalling} = props;

  return(
    <div className="callVideo">
      <div className="callVideoUser">
        <img
          className="callVideoAvatar"
          src={partner.avatar}
          alt=""
        />
        <span className="callVideoName">{partner.name}</span>
      </div>

      <div className="callVideoIcon">
        <button onClick={() => handleAudioCalling(partner)}>
          <i class="fa fa-phone" aria-hidden="true"></i>
        </button>
        <button onClick={() => handleVideoCalling(partner)}>
          <i class="fa fa-video-camera" aria-hidden="true"></i>
        </button>
        <button>
          <i class="fa fa-info-circle" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default actionBar