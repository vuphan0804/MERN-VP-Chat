import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ScrollToBottom from "react-scroll-to-bottom";

import Message from "../message/Message";

import "./chatBox.scss";
import { DIRECT_MESSAGE } from "../../../../constants/conversation";

function ChatBox(props) {
  const { conversationId } = useParams();
  const {
    token,
    userId,
    socket,
    lastestReceivedMsg,
    setConId,
    setLastestSentMsg,
  } = props;
  setConId(conversationId);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [submitMessageText, setSubmitMessageText] = useState("");
  const [partner, setPartner] = useState({ _id: userId }); // init is own user

  useEffect(() => {
    axios({
      method: "GET",
      headers: {
        Authorization: token,
      },
      url: `/api/conversations/${conversationId}/messages`,
    })
      .then((res) => {
        setMessages(res.data.messages);
      })
      .catch((err) => {
        console.log(err);
      });

    axios({
      method: "GET",
      headers: {
        Authorization: token,
      },
      url: `/api/conversations/${conversationId}`,
    })
      .then((res) => {
        const { members } = res.data.conversation;
        if (res.data.conversation.type === DIRECT_MESSAGE)
          setPartner(members.find((mem) => mem._id !== userId));
      })
      .catch((err) => {
        console.log(err);
      });
  }, [conversationId, submitMessageText, lastestReceivedMsg]);

  const handleMessageTextOnchange = (e) => {
    setMessageText(e.target.value);
  };

  const handleMessageTextOnSubmit = () => {
    axios({
      method: "POST",
      data: {
        text: messageText,
      },
      headers: {
        Authorization: token,
      },
      url: `/api/conversations/${conversationId}/messages`,
    })
      .then((res) => {
        setSubmitMessageText(messageText);
        setLastestSentMsg(messageText);
        socket.current.emit("new-message", {
          receiverId: partner._id,
          message: messageText,
        });
        setMessageText("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="chatBox">
      {
        <div className="chatBoxWrapper">
          <ScrollToBottom className="chatBoxTop">
            {messages.map((msg) =>
              userId === msg.sender._id ? (
                <Message key={msg._id} own={true} message={msg} />
              ) : (
                <Message key={msg._id} message={msg} />
              )
            )}
          </ScrollToBottom>
          <div className="chatBoxBottom">
            <textarea
              className="chatMessageInput"
              placeholder="write somthing..."
              value={messageText}
              onChange={handleMessageTextOnchange}
            ></textarea>
            <button
              className="chatSubmitButton"
              onClick={handleMessageTextOnSubmit}
            >
              Send
            </button>
          </div>
        </div>
      }
    </div>
  );
}

export default ChatBox;
