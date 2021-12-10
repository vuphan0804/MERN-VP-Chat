import { GROUP_MESSAGE } from "../../../../../constants/conversation";

require("./actionBar.scss");

function actionBar(props) {
  const {
    userId,
    partner,
    conversation,
    handleAudioCalling,
    handleVideoCalling,
    handleGrAudioCalling,
    handleGrVideoCalling,
  } = props;

  return (
    <div className="callVideo">
      <div className="callVideoUser">
        <img className="callVideoAvatar" src={partner.avatar} alt="" />
        <span className="callVideoName">{partner.name}</span>
      </div>

      <div className="callVideoIcon">
        <button
          onClick={() =>
            conversation.type === GROUP_MESSAGE
              ? handleGrAudioCalling(
                  conversation,
                  conversation.members.filter((mem) => mem._id !== userId)
                )
              : handleAudioCalling(partner)
          }
        >
          <i class="fa fa-phone" aria-hidden="true"></i>
        </button>
        <button
          onClick={() =>
            conversation.type === GROUP_MESSAGE
              ? handleGrVideoCalling(
                  conversation,
                  conversation.members.filter((mem) => mem._id !== userId)
                )
              : handleVideoCalling(partner)
          }
        >
          <i class="fa fa-video-camera" aria-hidden="true"></i>
        </button>
        <button>
          <i class="fa fa-info-circle" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default actionBar;
