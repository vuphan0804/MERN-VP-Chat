import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ScrollToBottom from "react-scroll-to-bottom";

import Message from "../message/Message";

import "./chatBox.scss";

const BASE_API_URL = "http://localhost:8000";

function ChatBox(props) {
  const { conversationId } = useParams();
  const { token, userId, setConId, setLastestSentMsg } = props;
  setConId(conversationId);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [submitMessageText, setSubmitMessageText] = useState("");

  useEffect(() => {
    axios({
      method: "GET",
      headers: {
        Authorization: token,
      },
      url: `${BASE_API_URL}/api/conversations/${conversationId}/messages`,
    })
      .then((res) => {
        setMessages(res.data.messages);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [conversationId, submitMessageText]);

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
      url: `${BASE_API_URL}/api/conversations/${conversationId}/messages`,
    })
      .then((res) => {
        setMessageText("");
        setSubmitMessageText(messageText);
        setLastestSentMsg(messageText);
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
                <Message own={true} message={msg} />
              ) : (
                <Message message={msg} />
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
