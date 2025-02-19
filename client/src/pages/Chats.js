import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react';
import SearchBar from '../components/chat/SearchBar';
import ChatList from '../components/chat/ChatList';
import ChatBox from '../components/chat/ChatBox';

const Chats = () => {
  const { user } = ChatState();
  const [fetchAgain, setfetchAgain] = useState(false);
  const [initfetch, setInitfetch] = useState(0);
  useEffect(() => {
    // setInitfetch(1);
  });
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
        {user && <ChatList fetchAgain={fetchAgain} initfetch={initfetch} />}
        {user && <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain}  />}
      </Box>
    </div>
  )
}

export default Chats
