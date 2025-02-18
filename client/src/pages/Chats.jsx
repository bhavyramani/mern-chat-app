import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Chat = () => {
  const [chats, setChats] = useState([]);
  const fetchChats = async () => {
    const data = await axios.get(`/api/chat`);
    console.log(data.data);
    setChats(data.data);
  };

  useEffect(() => {
    fetchChats();
  }, []);
  

  return (
    <div>
      {
        chats.map((chat)=>{
          return <div key={chat._id}>{chat.chatName}</div>
        })
      }
    </div>
  )
}

export default Chat
