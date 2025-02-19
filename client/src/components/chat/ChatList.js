import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Box, Button, Stack, Text } from '@chakra-ui/react';
import { getSender } from '../../config/chatLogics';
import GroupChatPopup from './GroupChatPopup';
const ChatList = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast.error("Error Occured!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={'3px'}
      bg="gray.800"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      h={"100%"}
    >
      <Box
        pb={'3px'}
        px={'3px'}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent={"space-around"}
        alignItems="center"
      >

        My Chats
        <GroupChatPopup>

          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            size={'sm'}
          >
            New Group +
          </Button>
        </GroupChatPopup>
      </Box>
      <Box
        display={'flex'}
        flexDir={'column'}
        p={'3px'}
        w={'100%'}
        h={'100%'}
        borderRadius={'lg'}
        overflowY={'hidden'}
      >

        {chats ? (
          <Stack px={4} overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={'15px'}
                py={'7px'}
                display={'flex'}
                justifyContent={'left'}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.groupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.lastMessage && (
                  <Text fontSize="xs">
                    <b>{chat.lastMessage.sender.name} : </b>
                    {chat.lastMessage.content.length > 50
                      ? chat.lastMessage.content.substring(0, 51) + "..."
                      : chat.lastMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          "Loading..."
        )}
      </Box>
    </Box>
  )
}

export default ChatList
