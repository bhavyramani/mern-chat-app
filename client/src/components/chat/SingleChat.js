import React, { useEffect, useState, useRef } from 'react';
import { ChatState } from '../../context/ChatProvider';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/menu';
import { getSender, getUserStatus } from '../../config/chatLogics';
import { FormControl } from '@chakra-ui/form-control';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';
import '../styles.css';
import ScrollChat from './ScrollChat';
import io from 'socket.io-client';
import GroupChatDrawer from './GroupChatDrawer';
import Lottie from 'react-lottie';
import animationData from '../animations/typing.json';
import { IoMdArrowRoundBack, IoMdSend } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaCircle } from "react-icons/fa";

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Use refs to hold current page values for socket callback
    const currentPageRef = useRef(currentPage);
    const totalPagesRef = useRef(totalPages);

    useEffect(() => {
        currentPageRef.current = currentPage;
        totalPagesRef.current = totalPages;
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (socket === null) {
            socket = io(ENDPOINT);
            socket.emit("setup", user);
            socket.on('connected', () => setSocketConnected(true));
            socket.on('typing', () => setIsTyping(true));
            socket.on('stop typing', () => setIsTyping(false));
        }
    }, [user]);

    const handleFileUpload = async () => {
        const file = selectedFile;
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data"
                }
            };

            const { data } = await axios.post("/api/files/upload", formData, config);
            sendFileMessage(data.filename, file);
        } catch (error) {
            toast.error("File upload failed");
        }finally{
            setNewMessage("");
            setSelectedFile(null);
        }
    };

    const sendFileMessage = async (filename, file) => {
        console.log(filename, file);
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post('/api/message', {
                file: filename,
                content: file.name,   
                chatId: selectedChat._id
            }, config);

            socket.emit("new message", data);
            setMessages((prev) => [...prev, data]); // Append message
        } catch (error) {
            toast.error("Error sending file message");
        }
    };

    const sendMessage = async () => {
        if (!newMessage) return;
        if(selectedFile !== null){
            setNewMessage('(File Selected)')
            handleFileUpload();
            return;
        }
        try {
            setNewMessage("");
            socket.emit('stop typing', selectedChat._id);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post('/api/message', {
                content: newMessage,
                chatId: selectedChat._id
            }, config);
            socket.emit("new message", data);
            // Append new message only if we are on page 1 (newest messages)
            if (currentPageRef.current === 1) {
                setMessages(prev => [...prev, data]);
            }
        } catch (error) {
            toast.error("Error Occured");
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }
        const lastTypingTime = new Date().getTime();
        const timerLength = 3000;
        setTimeout(() => {
            const timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= timerLength && typing) {
                socket.emit('stop typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    const fetchMessagesForPage = async (page, direction = 'initial') => {
        if (!selectedChat) return;
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`
                }
            };
            setMessageLoading(true);
            const url = `/api/message/${selectedChat._id}?page=${page}`;
            const { data } = await axios.get(url, config);
            const fetchedMessages = data.messages.reverse();
            // For 'initial', we replace the messages; for others, you can choose to append/prepend as needed.
            setMessages(fetchedMessages);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
            socket.emit('join chat', selectedChat._id);
        } catch (error) {
            toast.error("Error Occured");
        } finally {
            setMessageLoading(false);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            setMessages([]);
            setCurrentPage(1);
            setTotalPages(null);
            fetchMessagesForPage(1, 'initial');
            selectedChatCompare = selectedChat;
        }
    }, [selectedChat]);

    useEffect(() => {
        const messageHandler = (newMessageRecived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id) {
                // Optionally handle notifications for new messages in other chats.
            } else if (currentPageRef.current === 1) {  // Only render if on page 1 (newest)
                setMessages(prev => [...prev, newMessageRecived]);
                setfetchAgain(prev => !prev);
            }
        };
        socket.on('message received', messageHandler);
        return () => {
            socket.off('message received', messageHandler);
        };
    }, []);

    useEffect(() => {
        const sendHeartbeat = () => {
            if (socket && user) {
                socket.emit("heartbeat", user._id);
            }
        };

        const interval = setInterval(sendHeartbeat, process.env.REACT_APP_HEARTBEAT_MINUTES * 60 * 1000);
        return () => clearInterval(interval);
    }, [socket, user]);

    const handlePrev = () => {
        if (currentPage < totalPages) {
            fetchMessagesForPage(currentPage + 1, 'prev');
        }
    };

    // "Next" button: load newer messages (decrement page number)
    const handleNext = () => {
        if (currentPage > 1) {
            fetchMessagesForPage(currentPage - 1, 'next');
        }
    };

    return (
        <Box w={'100%'} h={'100%'}>
            {selectedChat ? (
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
                        <Button display={{ base: "flex", md: "none" }} size={'sm'} onClick={() => setSelectedChat("")}>
                            <IoMdArrowRoundBack />
                        </Button>
                        {selectedChat.groupChat
                            ? <Box>{selectedChat.chatName.toUpperCase()}</Box> :
                            <Box display="flex" alignItems="center" justifyContent={'space-between'} w={'100%'} px={10}>
                                <Box ml={2}>{getSender(user, selectedChat.users)}</Box>
                                <Box display={'flex'} h={'100%'} alignItems={'center'} gap={1} justifyContent={'center'} fontSize={'sm'}>
                                    <FaCircle height={'5px'} width={'5px'} color={getUserStatus(user, selectedChat.users) === 'Online' ? 'green' : 'gray'} />
                                    {getUserStatus(user, selectedChat.users)}
                                </Box>
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
                    <Box display="flex" flexDir="column" justifyContent="flex-end" p={3} bg="gray.600" w="100%" h="70vh" borderRadius="lg" overflowY="auto">
                        {messageLoading ? (
                            <Spinner size={'xl'} w={20} h={20} alignSelf={'center'} margin={'auto'} />
                        ) : (
                            <div className='messages'>
                                <ScrollChat messages={messages} />
                            </div>
                        )}
                        {isTyping && (
                            <Lottie
                                options={{
                                    loop: true,
                                    autoplay: true,
                                    animationData: animationData,
                                    rendererSettings: { preserveAspectRatio: "xMidYmid slice" }
                                }}
                                width={50}
                                height={20}
                                style={{ marginBottom: 15, marginLeft: 0 }}
                            />
                        )}
                        <FormControl isRequired mt={3} display="flex" alignItems="center">
                            <Input
                                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                                variant={'filled'}
                                bg={'gray.300'}
                                color={'gray.900'}
                                onChange={handleTyping}
                                value={newMessage}
                                flex={1}
                            />
                            <Button
                                onClick={sendMessage}
                                background='gray.700'
                                border='none'
                                padding='8px 10px'
                                borderRadius='5px'
                                marginLeft='8px'
                                cursor='pointer'
                                display={{ base: 'flex', md: 'none' }}
                                alignItems='center'
                                justifyContent='center'
                                color='white'
                            >
                                <IoMdSend size={20} />
                            </Button>
                            <Menu>
                                <MenuButton
                                    as="button"
                                    style={{
                                        background: 'gray.700',
                                        border: 'none',
                                        padding: '8px 10px',
                                        borderRadius: '5px',
                                        marginLeft: '8px',
                                        cursor: 'pointer',
                                        color: 'white'
                                    }}
                                >
                                    <BsThreeDotsVertical size={20} />
                                </MenuButton>
                                <MenuList bg={'gray'} display={'flex'} flexDir={'column'} alignItems={'center'} padding={'5px'} borderRadius={'5px'}>
                                    <MenuItem cursor={'pointer'} onClick={handlePrev} isDisabled={!currentPage || currentPage === totalPages}>Prev</MenuItem>
                                    <MenuItem cursor={'pointer'} onClick={handleNext} isDisabled={!currentPage || currentPage === 1}>Next</MenuItem>
                                    <MenuItem cursor={'pointer'}>
                                        <Input type='file' id='file' display={'none'} w={'10px'} onChange={(e)=>{setSelectedFile(e.target.files[0]); setNewMessage('(File Selected)')}} />
                                        <Text onClick={()=>{document.getElementById('file').click()}}>Upload File</Text>
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </FormControl>
                    </Box>
                </Box>
            ) : (
                <Box display={'flex'} alignItems={'center'} justifyContent={'center'} h={'100%'} w={'100%'}>
                    <Text fontSize={'3xl'} pb={3}>Click on a user to start chat</Text>
                </Box>
            )}
        </Box>
    );
};

export default SingleChat;
