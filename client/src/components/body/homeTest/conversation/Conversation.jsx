import React, {useEffect, useState} from "react";
import "./Conversation.scss";

import {DIRECT_MESSAGE} from '../../../../constants/conversation'

function Conversation(props) {
  const {conversation} = props;
  const {userId} = props;

  const [conAvatar, setConAvatar] = useState(null);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    conversation.members.map(mem => {
      if(conversation.type === DIRECT_MESSAGE && mem._id !== userId){
        setConAvatar(mem.avatar);
        setPartner(mem.name);
      }
    })
  }, [props]);

  return (
    <div className="conversation">
      <img
        src={conAvatar}
        alt=""
        className="conversationImg"
      />

      <span className="conversationName">{partner}</span>
    </div>
  );
}

export default Conversation;