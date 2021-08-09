import React, {useEffect, useState} from "react";
import "./Conversation.scss";

import {SELF_MESSAGE, DIRECT_MESSAGE} from '../../../../constants/conversation'

function Conversation(props) {
  const {conversation} = props;
  const {userId} = props;
  const {selectedConversation} = props;

  const [conAvatar, setConAvatar] = useState(null);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    if(conversation.type === SELF_MESSAGE){
      setConAvatar(conversation.members.avatar);
      setPartner(conversation.members.name);
    }else{
      conversation.members.map(mem => {
        if(conversation.type === DIRECT_MESSAGE && mem._id !== userId){
          setConAvatar(mem.avatar);
          setPartner(mem.name);
        }
      })
    }
    
  }, [props]);

  return (
    <div className={selectedConversation ? "selectedConversation" : "conversation"}>
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
