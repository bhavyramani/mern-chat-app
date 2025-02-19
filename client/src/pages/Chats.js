import React from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react';
import SearchBar from '../components/chat/SearchBar';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';

const Chats = () => {
  const { user } = ChatState();
  return (
    <div style={{'width':'100%'}}>
      {user ? <SearchBar/> : ""}
      <Box
      display={'flex'}
      justifyContent={'space-between'}
      w={'100%'}
      h={'90vh'}
      p={'10px'}
      >
        {user && <ChatList/>}
        {user && <ChatBox/>}
      </Box>
    </div>
  )
}

export default Chats
