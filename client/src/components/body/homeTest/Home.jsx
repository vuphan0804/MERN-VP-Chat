import React, {useEffect, useState} from "react";
import { io } from "socket.io-client";
import axios from 'axios';
import { useSelector } from "react-redux";

import Conversation from "./conversation/Conversation";
import Message from "./message/Message";
import ChatOnline from "./chatOnline/ChatOnline";



import "./home.scss";

const BASE_API_URL = "http://localhost:8000"
// const socket = io(BASE_API_URL);

function Home() {
  const auth = useSelector((state) => state.auth);
  const token = useSelector((state) => state.token);

  const [authState, setAuthState] = useState(auth);
  const [tokenState, setTokenState] = useState(token);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [submitSearchText, setSubmitSearchText] = useState("")

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
      console.log(res.data)
    }).catch(err => {console.log(err)})
  }, [auth, token, submitSearchText]);

  const handleSearchTextOnChange =(e) =>{
    setSearchText(e.target.value);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmitSearchText(searchText)
  }
  
  return(
    <div className="messenger">
      {/* Menu */}
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <form onSubmit={handleSearchSubmit}>
            <input placeholder="Search for friends" className="chatMenuInput" value={searchText} onChange={handleSearchTextOnChange} />
          </form>
          {
            conversations.map(con => <Conversation key={con._id} conversation={con} userId={authState.user._id}/>)
          }
          
        </div>
      </div>
      {/* ChatBox */}
      <div className="chatBox">
        <div className="chatBoxWrapper">
          <div className="chatBoxTop">
            <Message />
            <Message own={true} />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
          </div>
          <div className="chatBoxBottom">
            <textarea
              className="chatMessageInput"
              placeholder="write somthing..."
            ></textarea>
            <button className="chatSubmitButton">Send</button>
          </div>
        </div>
      </div>
      {/* Online */}
      <div className="chatOnline">
        <div className="chatOnlineWrapper">
          {
            onlineUsers.map(user => <ChatOnline key={user._id} user={user} />)
          }
          
          
        </div>
      </div>
    </div>
  )
}



export default Home;
