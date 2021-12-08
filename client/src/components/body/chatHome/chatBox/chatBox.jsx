import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FileViewer from "react-file-viewer";

import Message from "./message/Message";
import ActionBar from "./actionBar/actionBar";

import "./chatBox.scss";

import UploadFilePopup from "./uploadFilePopup/uploadFilePopup";

import {
  DEFAULT_GROUP_AVATAR,
  DEFAULT_GROUP_NAME,
  DIRECT_MESSAGE,
  GROUP_MESSAGE,
} from "../../../../constants/conversation";
import { TEXT, FILE } from "../../../../constants/message";

function ChatBox(props) {
  const { conversationId } = useParams();
  const {
    token,
    userId,
    socket,
    lastestReceivedMsg,
    setConId,
    setLastestSentMsg,
    handleAudioCalling,
    handleVideoCalling,
  } = props;
  setConId(conversationId);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [submitMessageText, setSubmitMessageText] = useState("");
  const [partner, setPartner] = useState({ _id: userId }); // init is own user
  const [conversation, setConversation] = useState({}); // init is own user
  const [openUploadPopup, setOpenUploadPopup] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleEnterKeyPress = (e) => {
    if (e.keyCode === 13) {
      handleMessageTextOnSubmit();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

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
        setConversation(res.data.conversation);
        const { members } = res.data.conversation;
        if (res.data.conversation.type === DIRECT_MESSAGE)
          setPartner(members.find((mem) => mem._id !== userId));
        else if (res.data.conversation.type === GROUP_MESSAGE)
          setPartner({
            name: res.data.conversation.name,
            avatar: DEFAULT_GROUP_AVATAR,
          });
      })
      .catch((err) => {
        console.log(err);
      });

    scrollToBottom();
  }, [token, conversationId, submitMessageText, lastestReceivedMsg]);

  const handleMessageTextOnchange = (e) => {
    setMessageText(e.target.value);
  };

  const handleMessageTextOnSubmit = () => {
    axios({
      method: "POST",
      data: {
        type: TEXT,
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
        if (conversation.type === DIRECT_MESSAGE)
          socket.current.emit("new-message", {
            receiverId: partner._id,
            message: messageText,
          });
        else if (conversation.type === GROUP_MESSAGE) {
          const othersMem = conversation.members.filter(
            (mem) => mem !== userId
          );
          othersMem.forEach((mem) => {
            socket.current.emit("new-message", {
              receiverId: mem._id,
              message: messageText,
            });
          });
        }

        setMessageText("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="chatBox">
      <div className="chatBoxWrapper">
        <ActionBar
          partner={partner}
          handleAudioCalling={handleAudioCalling}
          handleVideoCalling={handleVideoCalling}
        />
        <div className="chatBoxTop">
          {messages.map((msg) =>
            userId === msg.sender._id ? (
              <Message own={true} key={msg._id} message={msg} />
            ) : (
              <Message key={msg._id} message={msg} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatBoxBottom">
          <button
            className="chatSubmitButton"
            onClick={() => setOpenUploadPopup(true)}
          >
            <i class="fas fa-paperclip"></i>
          </button>
          <textarea
            className="chatMessageInput"
            placeholder="write somthing..."
            value={messageText}
            onChange={handleMessageTextOnchange}
            onKeyDown={handleEnterKeyPress}
            wra
          ></textarea>
          <button
            className="chatSubmitButton"
            onClick={handleMessageTextOnSubmit}
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <UploadFilePopup
        id="ringtone-menu"
        keepMounted
        token={token}
        socket={socket}
        conversation={conversation}
        setLastestSentMsg={setLastestSentMsg}
        open={openUploadPopup}
        setOpen={setOpenUploadPopup}
        partner={partner}
        userId={userId}
      />
    </div>
  );
}

export default ChatBox;
