import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider'
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { getSender } from '../../config/chatLogics';
import { FormControl } from '@chakra-ui/form-control';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';
import '../styles.css'
import ScrollChat from './ScrollChat';
import io from 'socket.io-client';
import GroupChatDrawer from './GroupChatDrawer';
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json';

const ENDPOINT = 'http://localhost:5000';
let socket = null;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
    const { user, selectedChat, setSelectedChat } = ChatState();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [messageLoading, setMessageLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        if (socket === null) {
            socket = io(ENDPOINT);
            socket.emit("setup", user);
            socket.on('connected', () => setSocketConnected(true));
            socket.on('typing', () => setIsTyping(true));
            socket.on('stop typing', () => setIsTyping(false));
        }
    }, []);

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage) {
            try {
                socket.emit('stop typing', selectedChat._id);
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };

                setNewMessage("");
                const { data } = await axios.post('/api/message', {
                    content: newMessage,
                    chatId: selectedChat._id
                }, config);
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast.error("Error Occured", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat)
            return;
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };
            setMessageLoading(true);

            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            socket.emit('join chat', selectedChat._id);
        } catch (error) {
            toast.error("Error Occured", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setMessageLoading(false);
        }
    }

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected)
            return;
        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let time = new Date().getTime();
            if (typing && time - lastTypingTime >= timerLength) {
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);


    useEffect(() => {
        socket.on('message received', (newMessageRecived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id) {
                // Notification Logic
            } else {
                setMessages([...messages, newMessageRecived]);
                setfetchAgain(!fetchAgain);
            }
        });
    });
    return (
        <Box w={'100%'} h={'100%'}>
            {
                selectedChat ? (
                    <Box w={'100%'}>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily="Work sans"
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center"
                        >
                            <Button
                                display={{ base: "flex", md: "none" }}
                                size={'sm'}
                                onClick={() => setSelectedChat("")}
                            >
                                Back
                            </Button>
                            {
                                !selectedChat.groupChat ?
                                    <Box>
                                        {getSender(user, selectedChat.users)}
                                    </Box> :
                                    <Box>
                                        {selectedChat.chatName.toUpperCase()}
                                    </Box>
                            }
                            {selectedChat.groupChat && (
                                <GroupChatDrawer
                                    selectedChat={selectedChat}
                                    setSelectedChat={setSelectedChat}
                                    fetchAgain={fetchAgain}
                                    setfetchAgain={setfetchAgain}
                                    user={user}
                                />
                            )}

                        </Text>
                        <Box
                            display="flex"
                            flexDir="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="gray.600"
                            w="100%"
                            h="70vh"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {/* Main Chat Content */}
                            {
                                messageLoading ?
                                    <Spinner
                                        size={'xl'}
                                        w={20}
                                        h={20}
                                        alignSelf={'center'}
                                        margin={'auto'}
                                    />
                                    :
                                    <div className='messages'>
                                        <ScrollChat messages={messages} />
                                    </div>
                            }
                            <FormControl
                                onKeyDown={sendMessage}
                                isRequired
                                mt={3}
                            >
                                {isTyping && <Lottie
                                    options={{
                                        loop: true,
                                        autoplay: true,
                                        animationData: animationData,
                                        rendererSettings: { preserveAspectRatio: "xMidYmid slice" }
                                    }}
                                    width={50}
                                    height={20}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />}
                                <Input
                                    variant={'filled'}
                                    bg={'gray.300'}
                                    color={'gray.900'}
                                    onChange={handleTyping}
                                    value={newMessage}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                ) : (
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} h={'100%'} w={'100%'}>
                        <Text fontSize={'3xl'} pb={3}>
                            Click on a user to start chat
                        </Text>
                    </Box>
                )
            }
        </Box>
    )
}

export default SingleChat
