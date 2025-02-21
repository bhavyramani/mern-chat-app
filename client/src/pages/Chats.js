import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react';
import SearchBar from '../components/chat/SearchBar';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';

const Chats = () => {
  const { user } = ChatState();
  const [fetchAgain, setfetchAgain] = useState(false); // Fetch messages again for some events

  return (
    <div style={{ 'width': '100%' }}>
      {user ? <SearchBar /> : ""}
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        w={'100%'}
        h={'90vh'}
        px={'30px'}
        py={'10px'}
      >
        {/* List of chats */}
        {user && <ChatList fetchAgain={fetchAgain} />}
        {/* Chat box */}
        {user && <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />}
      </Box>
    </div>
  )
}

export default Chats
