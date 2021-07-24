import React, {useEffect, useState} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import { io } from "socket.io-client";
import axios from 'axios';
import { useSelector } from "react-redux";


import Conversation from "./conversation/Conversation";
import ChatOnline from "./chatOnline/ChatOnline";
import ChatBox from "./chatBox/chatBox";



import "./home.scss";
import { Component } from "react";

const BASE_API_URL = "http://localhost:8000"
// const socket = io(BASE_API_URL);

function Home() {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);
  const {conversationId} = useParams();

  const [authState, setAuthState] = useState(auth);
  const [tokenState, setTokenState] = useState(token);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [submitSearchText, setSubmitSearchText] = useState("")
  const [selectedConversationId, setSelectedConversationId] = useState("")
  const [lastestSentMsg, setLastestSentMsg] = useState("")

  // useEffect(()=>{
  //   console.log(auth, authState);
  //   socket.emit('user-connected', {userId: authState.user._id});
  //   return (() => {
  //     socket.emit('user-disconnected', {userId: authState.user._id});
  //   })
  // }, [])



  useEffect(()=>{
   
    setAuthState(auth);
    setTokenState(token);

    axios({
      method: 'GET',
      headers: { 
        Authorization: tokenState,
      } ,
      url: `${BASE_API_URL}/api/users/online`,
    }).then(res => {
      setOnlineUsers(res.data.users);
    }).catch(err => {console.log(err)})

    axios({
      method: 'GET',
      headers: { 
        Authorization: tokenState,
      } ,
      url: `${BASE_API_URL}/api/me/conversations?search=${submitSearchText}`,
    }).then(res => {
      setConversations(res.data.conversations);
    }).catch(err => {console.log(err)})
  }, [auth, token, submitSearchText, lastestSentMsg]);

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
  
  return(
    <Router>
      <div className="messenger">
      {/* Menu */}
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <form onSubmit={handleSearchSubmit}>
            <input placeholder="Search for friends" className="chatMenuInput" value={searchText} onChange={handleSearchTextOnChange} />
          </form>
          {
            conversations.map(con =>  (
              <Link to={`/conversations/${con._id}`}>
                <Conversation  key={con._id} selectedConversation={selectedConversationId === con._id} conversation={con} userId={authState.user._id}/>
              </Link>
            ))
          }
          
        </div>
      </div>
      {/* ChatBox */}
      <Switch>
        <Route path="/conversations/:conversationId" children={ <ChatBox token={tokenState} userId={authState.user._id} setConId={handleSelectedConversation} setLastestSentMsg={handleLastestSentMsg}/>} />
        <Route path="/conversations">
          <h1>Open one conversation to chat</h1>
        </Route>
      </Switch>
      {/* Online */}
      <div className="chatOnline">
        <div className="chatOnlineWrapper">
          {
            onlineUsers.map(user => <ChatOnline key={user._id} user={user} token={tokenState} />)
          }
          
          
        </div>
      </div>
    </div>
    </Router>
    
    
  )
}



export default Home;
