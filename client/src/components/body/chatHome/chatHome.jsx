import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";
import Peer from "simple-peer";

import Conversation from "./conversation/Conversation";
import ChatOnline from "./chatOnline/ChatOnline";
import ChatBox from "./chatBox/chatBox";
import CallModel from "./callModel/callModel";
import GroupCallModel from "./callModel/groupCallModel";
import StreamVideo from "./stream/stream";
import GroupStreamVideo from "./stream/groupStream";
import NewGroupPopup from "./newGroupPopup/newGroupPopup";

import "./chatHome.scss";

import { VIDEOCALL, AUDIOCALL } from "../../../constants/calling";

function Home() {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [submitSearchText, setSubmitSearchText] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [lastestSentMsg, setLastestSentMsg] = useState("");
  const [lastestReceivedMsg, setLastestReceivedMsg] = useState("");
  const [selectedOnlineUser, setSelectedOnlineUser] = useState({});
  const [lastestOnOffUser, setLastestOnOffUser] = useState({});
  const [isCalling, setIsCalling] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callingType, setCallingType] = useState("");
  const [calleeUser, setCalleeUser] = useState({});
  const [callerUser, setCallerUser] = useState({});
  const [callerSignal, setCallerSignal] = useState("");
  const [isOpenNewGrPopup, setIsOpenNewGrPopup] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [lastestGroupCreated, setLastestGroupCreated] = useState("");

  // Phần call nhóm là phần code chắp vá, rất ẩu, rất ko đúng. Mong quý hảo hán thông cảm.
  // Vì thời gian gấp gáp. Chúng tôi sẽ cải tiến code sau. Vô cùng có lỗi.
  const [isGrCalling, setIsGrCalling] = useState(false);
  const [isGrReceiving, setIsGrReceiving] = useState(false);
  const [grCalees, setGrCallees] = useState([]);
  const [isGrCallAccepted, setIsGrCallAccepted] = useState(false);
  const [grCallerUser, setGrCallerUser] = useState();
  const [otherMemberPeers, setOtherMemberPeers] = useState([]);
  const [callingConversation, setCallingConversation] = useState();

  const socket = useRef();
  const myStream = useRef();
  const partnerStream = useRef();
  const peerRef = useRef();
  const peersRef = useRef([]);

  // didmounted
  useEffect(() => {
    console.log("alo");
    socket.current =
      process.env.ENV === "production"
        ? io("https://vp-chat.herokuapp.com")
        : io("http://localhost:8000");

    // component unmounted:
    return () => {
      socket.current.destroy();
      if (isCalling || isReceiving) handleCallCanceling();
    };
  }, []);

  // update
  useEffect(() => {
    // first connection:
    auth.user._id &&
      socket.current.emit("user-connected", { userId: auth.user._id });

    // debug:
    socket.current.on("new-online-socket", (data) =>
      console.log("online:", data)
    );
    socket.current.on("new-offline-socket", (data) =>
      console.log("offline:", data)
    );

    // on off user:
    socket.current.on("new-online-user", (data) => {
      setLastestOnOffUser(data);
    });
    socket.current.on("new-offline-user", (data) => {
      setLastestOnOffUser(data);
    });

    // get online users:
    socket.current.on("online-user", (data) => {
      console.log(data);
    });

    // receive new message:
    socket.current.on("new-message", (data) => {
      console.log(data);
      setLastestReceivedMsg(data.message);
    });

    // receive new group conversation:
    socket.current.on("new-group-conversation", (data) => {
      console.log(data);
      setLastestGroupCreated(data.conversationId);
    });

    // receiving call:
    socket.current.on("call-user", (data) => {
      console.log("callee receiving call");
      setIsReceiving(true);
      setCallingType(data.callType);
      setCallerUser({
        _id: data.userId,
        name: data.name,
        avatar: data.avatar,
      });
      setCallerSignal(data.signalData);
    });

    // gr receiving call:
    socket.current.on("gr-call-user", (data) => {
      console.log("gr callee receiving call");
      setCallingType(data.callType);
      setCallingConversation(data.conversation);
      setGrCallerUser({
        _id: data.userId,
        name: data.name,
        avatar: data.avatar,
      });
      setIsGrReceiving(true);
      setCallerSignal(data.signalData);
    });

    // gr call accepted:
    socket.current.on("gr-call-accepted", (data) => {
      console.log("gr new joiner");

      // TODO:
      const peer = { newPeer: "newPeer", name: data.joinerName };
      // const peer = new Peer({
      //   initiator: false,
      //   trickle: false,
      //   stream: myStream.current.srcObject,
      //   config: {
      //     iceServers: [
      //       { urls: "stun:stun.l.google.com:19302" },
      //       { urls: "stun:stun1.l.google.com:19302" },
      //       // { urls: "stun:stun2.l.google.com:19302" },
      //       // { urls: "stun:stun3.l.google.com:19302" },
      //       // { urls: "stun:stun4.l.google.com:19302" },
      //     ],
      //   },
      // });

      // peer.signal(data.signalData);

      setOtherMemberPeers((prev) => [...prev, peer]);

      peersRef.current.push(peer);
    });

    // call ended:
    socket.current.on("end-call", () => {
      console.log("call end");
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      navigator.getUserMedia(
        { audio: true, video: callingType === VIDEOCALL },
        function (localStream) {
          localStream.current.getTracks().forEach((track) => {
            track.stop();
          });
        },
        function (err) {
          console.log(err);
        }
      );

      setCalleeUser({});
      setCallerUser({});
      setIsCalling(false);
      setIsReceiving(false);
      setIsCallAccepted(false);

      if (peerRef.current) peerRef.current.removeAllListeners("close");
      window.location.reload();
    });

    // 1 mem in gr end call:
    // call ended:
    socket.current.on("gr-end-call", (data) => {
      setOtherMemberPeers((prev) =>
        prev.filter((mem) => mem.name !== data.leaverName)
      );
    });

    // page reloaded or closed:
    window.onbeforeunload = (e) => {
      if (isCalling || isReceiving) e.preventDefault();
      // re-connection:

      socket.current.emit("user-connected", { userId: auth.user._id });
    };
  }, [auth]);

  // update
  useEffect(() => {
    console.log("reload");

    token &&
      axios({
        method: "GET",
        headers: {
          Authorization: token,
        },
        url: `/api/users/online`,
      })
        .then((res) => {
          setOnlineUsers(res.data.users);
        })
        .catch((err) => {
          console.log(err);
        });

    token &&
      axios({
        method: "GET",
        headers: {
          Authorization: token,
        },
        url: `/api/me/conversations?search=${submitSearchText}`,
      })
        .then((res) => {
          setConversations(res.data.conversations);
        })
        .catch((err) => {
          console.log(err);
        });

    token &&
      axios({
        method: "GET",
        headers: {
          Authorization: token,
        },
        url: `/user/others/only_name`,
      })
        .then((res) => {
          setAllUsers(res.data.users);
        })
        .catch((err) => {
          console.log(err);
        });
  }, [
    auth,
    token,
    submitSearchText,
    lastestSentMsg,
    selectedOnlineUser,
    lastestOnOffUser,
    lastestGroupCreated,
  ]);

  const handleSearchTextOnChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmitSearchText(searchText);
  };

  const handleSelectedConversation = (id) => {
    setSelectedConversationId(id);
  };

  const handleLastestSentMsg = (msg) => {
    setLastestSentMsg(msg);
  };

  const handleSelectedOnlineUser = (user) => {
    setSelectedOnlineUser(user);
  };

  const handleNewGroupDisplay = () => {
    setIsOpenNewGrPopup(true);
  };

  const handleAudioCalling = (callee) => {
    console.log("caller call");
    setCalleeUser(callee);
    setCallingType(AUDIOCALL);
    setIsCalling(true);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        setIsCallAccepted(true);
        myStream.current.srcObject = stream;

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              // { urls: "stun:stun2.l.google.com:19302" },
              // { urls: "stun:stun3.l.google.com:19302" },
              // { urls: "stun:stun4.l.google.com:19302" },
            ],
          },
        });
        peer.on("signal", (data) => {
          if (data.renegotiate || data.transceiverRequest) return;
          socket.current.emit("call-user", {
            callType: AUDIOCALL,
            userToCall: callee._id,
            from: socket.current.id,
            userId: auth.user._id,
            name: auth.user.name,
            avatar: auth.user.avatar,
            signalData: JSON.stringify(data),
          });
        });

        peer.on("stream", (stream) => {
          partnerStream.current.srcObject = stream;
        });

        // call accepted:
        socket.current.on("call-accepted", (data) => {
          console.log("caller call callee successfully");
          peer.signal(data.signalData);
        });

        peerRef.current = peer;
      });
  };

  const handleVideoCalling = (callee) => {
    console.log("caller call");
    setCalleeUser(callee);
    setCallingType(VIDEOCALL);
    setIsCalling(true);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setIsCallAccepted(true);
        myStream.current.srcObject = stream;

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              // { urls: "stun:stun2.l.google.com:19302" },
              // { urls: "stun:stun3.l.google.com:19302" },
              // { urls: "stun:stun4.l.google.com:19302" },
            ],
          },
        });
        peer.on("signal", (data) => {
          if (data.renegotiate || data.transceiverRequest) return;
          socket.current.emit("call-user", {
            callType: VIDEOCALL,
            userToCall: callee._id,
            from: socket.current.id,
            userId: auth.user._id,
            name: auth.user.name,
            avatar: auth.user.avatar,
            signalData: JSON.stringify(data),
          });
        });

        peer.on("stream", (stream) => {
          partnerStream.current.srcObject = stream;
        });

        // call accepted:
        socket.current.on("call-accepted", (data) => {
          console.log("caller call callee successfully");
          peer.signal(data.signalData);
        });

        peerRef.current = peer;
      });
  };

  const handleCallCanceling = () => {
    console.log("call end");
    socket.current.emit("end-call", {
      partner: isCalling ? calleeUser._id : isReceiving ? callerUser._id : null,
    });

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.getUserMedia(
      { audio: true, video: callingType === VIDEOCALL },
      function (localStream) {
        localStream.current.getTracks().forEach((track) => {
          track.stop();
        });
      },
      function (err) {
        console.log(err);
      }
    );

    setCalleeUser({});
    setCallerUser({});
    setIsCalling(false);
    setIsReceiving(false);
    setIsCallAccepted(false);

    if (peerRef.current) peerRef.current.removeAllListeners("close");
    window.location.reload();
    socket.current.emit("page-reload", { userId: auth.user._id });
  };

  const handleCallAccepting = () => {
    console.log("callee accepting call");
    setIsCallAccepted(true);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: callingType === VIDEOCALL ? true : false,
      })
      .then(async (stream) => {
        myStream.current.srcObject = stream;
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              // { urls: "stun:stun2.l.google.com:19302" },
              // { urls: "stun:stun3.l.google.com:19302" },
              // { urls: "stun:stun4.l.google.com:19302" },
            ],
          },
        });

        peer.on("signal", (data) => {
          if (data.renegotiate || data.transceiverRequest) return;
          socket.current.emit("call-accepted", {
            to: callerUser._id,
            signalData: JSON.stringify(data),
          });
        });

        peer.signal(callerSignal);

        peer.on("stream", (stream1) => {
          console.log(stream1);
          partnerStream.current.srcObject = stream1;
        });

        peerRef.current = peer;
      });
  };

  const handleGrAudioCalling = (callee) => {
    // console.log("caller call");
    // setCalleeUser(callee);
    // setCallingType(AUDIOCALL);
    // setIsCalling(true);
    // navigator.mediaDevices
    //   .getUserMedia({
    //     audio: true,
    //   })
    //   .then((stream) => {
    //     setIsCallAccepted(true);
    //     myStream.current.srcObject = stream;
    //     const peer = new Peer({
    //       initiator: true,
    //       trickle: false,
    //       stream: stream,
    //       config: {
    //         iceServers: [
    //           { urls: "stun:stun.l.google.com:19302" },
    //           { urls: "stun:stun1.l.google.com:19302" },
    //           { urls: "stun:stun2.l.google.com:19302" },
    //           { urls: "stun:stun3.l.google.com:19302" },
    //           { urls: "stun:stun4.l.google.com:19302" },
    //         ],
    //       },
    //     });
    //     peer.on("signal", (data) => {
    //       if (data.renegotiate || data.transceiverRequest) return;
    //       socket.current.emit("call-user", {
    //         callType: AUDIOCALL,
    //         userToCall: callee._id,
    //         from: socket.current.id,
    //         userId: auth.user._id,
    //         name: auth.user.name,
    //         avatar: auth.user.avatar,
    //         signalData: JSON.stringify(data),
    //       });
    //     });
    //     peer.on("stream", (stream) => {
    //       partnerStream.current.srcObject = stream;
    //     });
    //     // call accepted:
    //     socket.current.on("call-accepted", (data) => {
    //       console.log("caller call callee successfully");
    //       peer.signal(data.signalData);
    //     });
    //     peerRef.current = peer;
    //   });
  };

  const handleGrVideoCalling = (conversation, callees) => {
    console.log("gr caller call");
    setGrCallees(callees);
    setCallingType(VIDEOCALL);
    setIsGrCalling(true);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setIsGrCallAccepted(true);
        myStream.current.srcObject = stream;

        // TODO:
        // const peer = new Peer({
        //   initiator: true,
        //   trickle: false,
        //   stream: stream,
        //   config: {
        //     iceServers: [
        //       { urls: "stun:stun.l.google.com:19302" },
        //       { urls: "stun:stun1.l.google.com:19302" },
        //       // { urls: "stun:stun2.l.google.com:19302" },
        //       // { urls: "stun:stun3.l.google.com:19302" },
        //       // { urls: "stun:stun4.l.google.com:19302" },
        //     ],
        //   },
        // });

        callees.forEach((callee) => {
          // peer.on("signal", (data) => {
          //   if (data.renegotiate || data.transceiverRequest) return;
          //   socket.current.emit("gr-call-user", {
          //     conversation,
          //     callType: VIDEOCALL,
          //     userToCall: callee._id,
          //     from: socket.current.id,
          //     userId: auth.user._id,
          //     name: auth.user.name,
          //     avatar: auth.user.avatar,
          //     signalData: JSON.stringify(data),
          //   });
          // });
          // peer.on("stream", (stream1) => {
          //   partnerStream.current.srcObject = stream1;
          // });
          // call accepted:
          // socket.current.on("call-accepted", (data) => {
          //   console.log("caller call callee successfully");
          //   peer.signal(data.signalData);
          // });

          socket.current.emit("gr-call-user", {
            conversation,
            callType: VIDEOCALL,
            userToCall: callee._id,
            from: socket.current.id,
            userId: auth.user._id,
            name: auth.user.name,
            avatar: auth.user.avatar,
            signalData: JSON.stringify({}),
          });
        });

        //peerRef.current = peer;
      });
  };

  const handleGrCallCanceling = () => {
    console.log("gr call canceling");
    socket.current.emit("gr-end-call", {
      conversation: callingConversation,
    });

    window.location.reload();
  };

  const handleGrCallAccepting = () => {
    console.log("gr callee accepting call");
    setIsGrCallAccepted(true);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: callingType === VIDEOCALL ? true : false,
      })
      .then(async (stream) => {
        myStream.current.srcObject = stream;
        // TODO:
        // const peer = new Peer({
        //   initiator: false,
        //   trickle: false,
        //   stream: stream,
        //   config: {
        //     iceServers: [
        //       { urls: "stun:stun.l.google.com:19302" },
        //       { urls: "stun:stun1.l.google.com:19302" },
        //       // { urls: "stun:stun2.l.google.com:19302" },
        //       // { urls: "stun:stun3.l.google.com:19302" },
        //       // { urls: "stun:stun4.l.google.com:19302" },
        //     ],
        //   },
        // });
        // peer.on("signal", (data) => {
        //   if (data.renegotiate || data.transceiverRequest) return;
        //   socket.current.emit("gr-call-accepted", {
        //     conversation: callingConversation,
        //     signalData: JSON.stringify(data),
        //   });
        // });

        // peer.signal(callerSignal);

        const peer = {
          newPeer: "newPeer",
          name: grCallerUser.name,
        };

        socket.current.emit("gr-call-accepted", {
          conversation: callingConversation,
          signalData: JSON.stringify({}),
        });

        setOtherMemberPeers((prev) => [...prev, peer]);

        peersRef.current.push(peer);
      });
  };

  return (
    <Router>
      {/* New Group Popup */}
      <NewGroupPopup
        id="ringtone-menu"
        keepMounted
        open={isOpenNewGrPopup}
        setOpen={setIsOpenNewGrPopup}
        allUsers={allUsers}
        token={token}
        setLastestGroupCreated={setLastestGroupCreated}
        socket={socket}
      />
      {/* Calling Popup */}
      {isCalling && (
        <div className="callModelWrapper">
          <CallModel
            callingType={callingType}
            user={calleeUser}
            isCalling={true}
            handleCallCanceling={handleCallCanceling}
          />
        </div>
      )}
      {/* Receiving Popup */}
      {!isCalling && isReceiving && (
        <div className="callModelWrapper">
          <CallModel
            callingType={callingType}
            user={callerUser}
            isCalling={false}
            handleCallCanceling={handleCallCanceling}
            handleCallAccepting={handleCallAccepting}
          />
        </div>
      )}
      {/* Group Calling Popup */}
      {isGrCalling && (
        <div className="callModelWrapper">
          <GroupCallModel
            callingType={callingType}
            isCalling={true}
            grCallerUser={{ name: auth.user.name }}
            handleCallCanceling={handleGrCallCanceling}
            token={token}
          />
        </div>
      )}
      {/* Group Receiving Popup */}
      {!isGrCalling && isGrReceiving && (
        <div className="callModelWrapper">
          <GroupCallModel
            callingType={callingType}
            isCalling={false}
            conversation={callingConversation}
            grCallerUser={grCallerUser}
            handleGrCallCanceling={handleGrCallCanceling}
            handleGrCallAccepting={handleGrCallAccepting}
            token={token}
          />
        </div>
      )}
      {/* Stream Calling */}
      {isCallAccepted && (
        <div className="peerWrapper">
          <StreamVideo
            caller={callerUser}
            callee={calleeUser}
            callingType={callingType}
            myStream={myStream}
            partnerStream={partnerStream}
            handleCallCanceling={handleCallCanceling}
            user={callerUser}
          />
        </div>
      )}
      {/* Group Stream Calling */}
      {isGrCallAccepted && (
        <div className="peerWrapper">
          <GroupStreamVideo
            callingType={callingType}
            myStream={myStream}
            otherMemberPeers={otherMemberPeers}
            partnerStream={partnerStream}
            handleGrCallCanceling={handleGrCallCanceling}
          />
        </div>
      )}
      <div className="messenger">
        {/* Menu */}
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <button className="newGroupBtn" onClick={handleNewGroupDisplay}>
              New group
            </button>
            <form onSubmit={handleSearchSubmit}>
              <input
                placeholder="Search for friends"
                className="chatMenuInput"
                value={searchText}
                onChange={handleSearchTextOnChange}
              />
            </form>
            {conversations.map((con) => (
              <Link key={con._id} to={`/conversations/${con._id}`}>
                <Conversation
                  key={con._id}
                  selectedConversation={selectedConversationId === con._id}
                  conversation={con}
                  userId={auth.user._id}
                />
              </Link>
            ))}
          </div>
        </div>
        {/* ChatBox */}
        <Switch>
          <Route
            path="/conversations/:conversationId"
            children={
              <ChatBox
                token={token}
                userId={auth.user._id}
                socket={socket}
                lastestReceivedMsg={lastestReceivedMsg}
                setConId={handleSelectedConversation}
                setLastestSentMsg={handleLastestSentMsg}
                handleAudioCalling={handleAudioCalling}
                handleVideoCalling={handleVideoCalling}
                handleGrAudioCalling={handleGrVideoCalling}
                handleGrVideoCalling={handleGrVideoCalling}
              />
            }
          />
          <Route path="/conversations">
            <h1 style={{ color: "white" }}>Open one conversation to chat</h1>
          </Route>
        </Switch>
        {/* Online */}
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            {onlineUsers.map((user) => (
              <ChatOnline
                key={user._id}
                onlineUser={user}
                token={token}
                userId={auth.user._id}
                setSelectedOnlineUser={handleSelectedOnlineUser}
              />
            ))}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default Home;
