import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider'
import { Box, Button, DrawerFooter, Input, Text } from '@chakra-ui/react';
import { getSender } from '../../config/chatLogics';
import {
    DrawerRoot,
    DrawerBackdrop,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseTrigger,
    DrawerTitle
} from "../ui/drawer";
import UserListItem from '../UserCard/UserListItem';
import { FormControl } from '@chakra-ui/form-control';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';
import '../styles.css'
import ScrollChat from './ScrollChat';
import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';
let socket = null;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
    const { user, selectedChat, setSelectedChat } = ChatState();
    const [open, setOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [renameloading, setRenameLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [messageLoading, setMessageLoading] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        if (socket === null) {
            socket = io(ENDPOINT);
            socket.emit("setup", user);
            socket.on('connection', () => setSocketConnected(true));
        }
    }, []);

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/rename`,
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                },
                config
            );

            setSelectedChat(data);
            setfetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast.error("Only admins can Rename!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast.warn("User Already in group!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        if (selectedChat.admin._id !== user._id) {
            toast.error("Only admins can add someone!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/group/add`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setfetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast.error("Error Occured", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoading(false);
        }
        setGroupChatName("");
    };

    const handleRemove = async (user1) => {
        if (selectedChat.admin._id !== user._id && user1._id !== user._id) {
            toast.error("Only admins can remove someone!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/group/remove`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setfetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast.error("Error Occured", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoading(false);
        }
        setGroupChatName("");
    };

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage) {
            try {
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
    };

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);


    useEffect(() => {
        socket.on('message received', (newMessageRecived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id) {

            } else {
                setMessages([...messages, newMessageRecived]);
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
                            {selectedChat.groupChat ? <DrawerRoot open={open} placement={'end'} onOpenChange={(e) => setOpen(e.open)}>
                                <DrawerTrigger asChild>
                                    <Button onClick={() => setOpen(true)}>Settings</Button>
                                </DrawerTrigger>
                                <DrawerBackdrop />
                                <DrawerContent>
                                    <DrawerHeader>
                                        <DrawerTitle>{selectedChat.chatName}</DrawerTitle>
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                                            <FormControl display="flex">
                                                <Input
                                                    placeholder="Chat Name"
                                                    mb={3}
                                                    value={groupChatName}
                                                    onChange={(e) => setGroupChatName(e.target.value)}
                                                />
                                                <Button
                                                    variant="solid"
                                                    colorScheme="teal"
                                                    ml={1}
                                                    color={'white'}
                                                    bg={'green'}
                                                    isLoading={renameloading}
                                                    onClick={handleRename}
                                                >
                                                    Save
                                                </Button>
                                            </FormControl>
                                            <Text>Click on User to Remove from Group</Text>
                                            {selectedChat.users.map((u) => (
                                                <UserListItem
                                                    key={u._id}
                                                    user={u}
                                                    admin={selectedChat.groupAdmin}
                                                    handler={() => handleRemove(u)}
                                                />
                                            ))}
                                            {selectedChat?.admin._id == user?._id ?
                                                <Box w={'100%'} mt={'20px'}>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Add User to group"
                                                            mb={1}
                                                            onChange={(e) => handleSearch(e.target.value)}
                                                        />
                                                    </FormControl>

                                                    {loading ? (
                                                        <Spinner size="lg" />
                                                    ) : (
                                                        searchResult?.map((user) => (
                                                            <UserListItem
                                                                key={user._id}
                                                                user={user}
                                                                handler={() => handleAddUser(user)}
                                                            />
                                                        ))
                                                    )}
                                                </Box>
                                                : ""
                                            }
                                        </Box>
                                    </DrawerBody>
                                    <DrawerFooter>
                                        <Button
                                            onClick={() => handleRemove(user)}
                                            color={'white'}
                                            bg={'red'}
                                        >
                                            Leave Group
                                        </Button>
                                    </DrawerFooter>
                                    <DrawerCloseTrigger asChild>
                                        <Button colorScheme="red">Close</Button>
                                    </DrawerCloseTrigger>
                                </DrawerContent>
                            </DrawerRoot> : ""}

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
