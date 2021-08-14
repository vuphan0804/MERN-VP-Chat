import React, {useEffect, useState, useRef} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import { io } from "socket.io-client";
import axios from 'axios';
import { useSelector } from "react-redux";
import Peer from 'simple-peer'

import Conversation from "./conversation/Conversation";
import ChatOnline from "./chatOnline/ChatOnline";
import ChatBox from "./chatBox/chatBox";
import CallModel from './callModel/callModel'
import StreamVideo from './stream/stream'

import "./home.scss";

import {VIDEOCALL, AUDIOCALL} from '../../../constants/calling'


function Home() {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [submitSearchText, setSubmitSearchText] = useState("")
  const [selectedConversationId, setSelectedConversationId] = useState("")
  const [lastestSentMsg, setLastestSentMsg] = useState("")
  const [lastestReceivedMsg, setLastestReceivedMsg] = useState("")
  const [selectedOnlineUser, setSelectedOnlineUser] = useState({});
  const [lastestOnOffUser, setLastestOnOffUser] = useState({});
  const [isCalling, setIsCalling] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callingType, setCallingType] = useState("");
  const [calleeUser, setCalleeUser] = useState({});
  const [callerUser, setCallerUser] = useState({});
  const [callerSignal, setCallerSignal] = useState("");

  const socket = useRef();
  const myStream = useRef();
  const partnerStream = useRef();
  const peerRef = useRef();

  useEffect(() => {
    console.log('alo')
    socket.current = io('https://vp-chat.herokuapp.com');

    // component unmounted:
    return (() => {
      socket.current.destroy();
      if(isCalling || isReceiving)
        handleCallCanceling()
    })
  }, [])


  useEffect(()=>{
    // first connection:
    auth.user._id && socket.current.emit('user-connected', {userId: auth.user._id});

    // debug:
    socket.current.on('new-online-socket', data => console.log('online:', data));
    socket.current.on('new-offline-socket', data => console.log('offline:', data))
    
   

    // on off user:
    socket.current.on('new-online-user', data => {setLastestOnOffUser(data)})
    socket.current.on('new-offline-user', data => {setLastestOnOffUser(data)});
    
    // get online users:
    socket.current.on('online-user', data => {
      console.log(data);
    })

    // receive new message:
    socket.current.on('new-message', data => {
      console.log(data);
      setLastestReceivedMsg(data.message);
    })

    // receiving call:
    socket.current.on('call-user', data => {
      console.log('callee receiving call');
      setIsReceiving(true);
      setCallingType(data.callType)
      setCallerUser({
        _id: data.userId,
        name: data.name,
        avatar: data.avatar,
      });
      setCallerSignal(data.signalData);
    })

    // call ended:
    socket.current.on('end-call', () => {
      console.log('call end');
      navigator.getUserMedia = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia;
      navigator.getUserMedia(
        {audio: true, video: callingType === VIDEOCALL}, 
        function(localStream) {
          localStream.current.getTracks().forEach((track)=> {
            track.stop();
          });
        },
        function(err) {
            console.log(err);
      });
      

      setCalleeUser({});
      setCallerUser({});
      setIsCalling(false);
      setIsReceiving(false);
      setIsCallAccepted(false);

      if(peerRef.current)
        peerRef.current.removeAllListeners('close');
      window.location.reload();
    })

    // page reloaded or closed:
    window.onbeforeunload = (e) => {
      if(isCalling || isReceiving)
        e.preventDefault();
      // re-connection:
      
      socket.current.emit('user-connected', {userId: auth.user._id});
     }

     
  }, [auth])



  useEffect(()=>{
    console.log('reload');

    token && axios({
      method: 'GET',
      headers: { 
        Authorization: token,
      } ,
      url: `/api/users/online`,
    }).then(res => {
      setOnlineUsers(res.data.users);
    }).catch(err => {console.log(err)})

    token && axios({
      method: 'GET',
      headers: { 
        Authorization: token,
      } ,
      url: `/api/me/conversations?search=${submitSearchText}`,
    }).then(res => {
      setConversations(res.data.conversations);
    }).catch(err => {console.log(err)})
  }, [auth, token, submitSearchText, lastestSentMsg, selectedOnlineUser, lastestOnOffUser]);

  const handleSearchTextOnChange =(e) =>{
    setSearchText(e.target.value);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmitSearchText(searchText)
  }

  const handleSelectedConversation = (id) => {
    setSelectedConversationId(id);
  }

  const handleLastestSentMsg = (msg) => {
    setLastestSentMsg(msg);
  }

  const handleSelectedOnlineUser = (user) => {
    setSelectedOnlineUser(user);
  }

  const handleAudioCalling =(callee) => {
    console.log('caller call');
    setCalleeUser(callee);
    setCallingType(AUDIOCALL);
    setIsCalling(true);

    navigator.mediaDevices.getUserMedia({
      audio: true,
    }).then(stream => {
      setIsCallAccepted(true);
      myStream.current.srcObject = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        }
      })
      peer.on('signal', data => {
        if (data.renegotiate || data.transceiverRequest) return;
        socket.current.emit('call-user', {
          callType: AUDIOCALL,
          userToCall: callee._id,
          from: socket.current.id,
          userId: auth.user._id,
          name: auth.user.name,
          avatar: auth.user.avatar,
          signalData: JSON.stringify(data),
        })
      });

      peer.on('stream', stream => {
        partnerStream.current.srcObject = stream;
      });

      // call accepted:
      socket.current.on('call-accepted', (data) => {
        console.log('caller call callee successfully');
        peer.signal(data.signalData);
      });

      peerRef.current = peer;
    });
  }
  
  const handleVideoCalling =(callee) => {
    console.log('caller call');
    setCalleeUser(callee);
    setCallingType(VIDEOCALL);
    setIsCalling(true);

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    }).then(stream => {
      setIsCallAccepted(true);
      myStream.current.srcObject = stream;

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        }
      })
      peer.on('signal', data => {
        if (data.renegotiate || data.transceiverRequest) return;
        socket.current.emit('call-user', {
          callType: VIDEOCALL,
          userToCall: callee._id,
          from: socket.current.id,
          userId: auth.user._id,
          name: auth.user.name,
          avatar: auth.user.avatar,
          signalData: JSON.stringify(data),
        })
      });

      peer.on('stream', stream => {
        partnerStream.current.srcObject = stream;
      });

      // call accepted:
      socket.current.on('call-accepted', (data) => {
        console.log('caller call callee successfully');
        peer.signal(data.signalData);
      });

      peerRef.current = peer;
    });
  }

  const handleCallCanceling = async () => {
    console.log('call end');
    socket.current.emit('end-call', {
      partner: isCalling ? calleeUser._id : isReceiving ? callerUser._id : null
    })

    navigator.getUserMedia = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia;
      navigator.getUserMedia(
        {audio: true, video: callingType === VIDEOCALL}, 
        function(localStream) {
          localStream.current.getTracks().forEach((track)=> {
            track.stop();
          });
        },
        function(err) {
            console.log(err);
      });

    setCalleeUser({});
    setCallerUser({});
    setIsCalling(false);
    setIsReceiving(false);
    setIsCallAccepted(false);
    
    if(peerRef.current)
      peerRef.current.removeAllListeners('close');
    window.location.reload();
    socket.current.emit('page-reload', {userId: auth.user._id})
  }

  const handleCallAccepting = () => {
    console.log('callee accepting call');
    setIsCallAccepted(true);
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callingType === VIDEOCALL ? true: false,
    }).then(async stream => {
      myStream.current.srcObject = stream;
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
        }
      });

      peer.on('signal', data => {
        if (data.renegotiate || data.transceiverRequest) return;
        socket.current.emit('call-accepted', {
          to: callerUser._id,
          signalData: JSON.stringify(data) ,
        });
      });

      peer.signal(callerSignal);

      peer.on('stream', stream => {
        partnerStream.current.srcObject = stream;
      });

      peerRef.current = peer;
    });
    
  }
  
  return(
     <Router>
          {/* Calling Popup */}
          {isCalling && 
          <div className="callModelWrapper">
            <CallModel callingType={callingType} user={calleeUser} isCalling={true} handleCallCanceling={handleCallCanceling}/>
          </div>
          }
          {/* Receiving Popup */}
          {!isCalling && isReceiving && 
          <div className="callModelWrapper">
            <CallModel callingType={callingType} user={callerUser} isCalling={false} handleCallCanceling={handleCallCanceling} handleCallAccepting={handleCallAccepting}/>
          </div>
          }  
          {/* Stream Calling */}
          {isCallAccepted && 
          <div className="peerWrapper">
            <StreamVideo callingType={callingType} myStream={myStream} partnerStream={partnerStream} handleCallCanceling={handleCallCanceling}/>
          </div>
          }
          <div className="messenger">
          {/* Menu */}
          <div className="chatMenu">
            <div className="chatMenuWrapper">
              <form onSubmit={handleSearchSubmit}>
                <input placeholder="Search for friends" className="chatMenuInput" value={searchText} onChange={handleSearchTextOnChange} />
              </form>
              {
                conversations.map(con =>  (
                  <Link key={con._id} to={`/conversations/${con._id}`}>
                    <Conversation  key={con._id} selectedConversation={selectedConversationId === con._id} conversation={con} userId={auth.user._id}/>
                  </Link>
                ))
              }
              
            </div>
          </div>
          {/* ChatBox */}
          <Switch>
            <Route path="/conversations/:conversationId" 
            children={ 
            <ChatBox token={token} 
                    userId={auth.user._id} 
                    socket={socket} 
                    lastestReceivedMsg={lastestReceivedMsg} 
                    setConId={handleSelectedConversation} 
                    setLastestSentMsg={handleLastestSentMsg} 
                    handleAudioCalling={handleAudioCalling} 
                    handleVideoCalling={handleVideoCalling}
            />} 
            />
            <Route path="/conversations">
              <h1>Open one conversation to chat</h1>
            </Route>
          </Switch>
          {/* Online */}
          <div className="chatOnline">
            <div className="chatOnlineWrapper">
              {
                onlineUsers.map(user => <ChatOnline key={user._id} onlineUser={user} token={token} userId={auth.user._id} setSelectedOnlineUser={handleSelectedOnlineUser}/>)
              }
              
              
            </div>
          </div>
        </div>
        </Router>
  )
}



export default Home;
