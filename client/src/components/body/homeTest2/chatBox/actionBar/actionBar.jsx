require('./actionBar.scss');

function actionBar(props) {
  const {partner, handleAudioCalling, handleVideoCalling} = props;

  return(
    <div className="actionBar">
      <div className="calling">
      <button onClick={() => handleAudioCalling(partner)}>
          <i class="fas fa-phone-alt"></i>
        </button>
        <button onClick={() => handleVideoCalling(partner)}>
          <i class="fas fa-video"></i>
        </button>
      </div>
    </div>
  );
}

export default actionBar