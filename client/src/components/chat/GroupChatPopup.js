import React, { useState } from 'react';
import {
    Box,
    Button,
    Input,
} from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/form-control';
import axios from 'axios';
import { ChatState } from '../../context/ChatProvider';
import UserListItem from '../UserCard/UserListItem';
import UserBadgeItem from '../UserCard/UserBadgeItem';
import { toast } from 'react-toastify';

const GroupChatPopup = ({ children }) => {
    // Control pop-up visibility
    const [isOpen, setIsOpen] = useState(false);
    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    // Form states
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user, chats, setChats } = ChatState();

    const handleGroup = (userToAdd) => {
        if (selectedUsers.find((u) => u._id === userToAdd._id)) {
            toast.warn("User already added", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        console.log(selectedUsers);
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`/api/user?search=${query}`, config);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load search results", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoading(false);
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length === 0) {
            toast.warn("Please fill all the fields!", {
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
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post(
                `/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            closePopup();
            toast.success("New Group Chat Created!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (error) {
            toast.error("Failed to create the chat!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <>
            {/* Trigger Element */}
            <span onClick={openPopup}>
                {children}
            </span>

            {/* Pop-up Overlay */}
            {isOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    bg="rgba(0,0,0,0.6)"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    zIndex="1000"
                >
                    {/* Pop-up Content */}
                    <Box
                        bg="black"
                        p="20px"
                        borderRadius="lg"
                        width={{ base: "60%", md: "500px" }}
                        position="relative"
                    >
                        {/* Close Button */}
                        <Button
                            position="absolute"
                            top="10px"
                            right="10px"
                            size="sm"
                            onClick={closePopup}
                        >
                            Close
                        </Button>
                        <Box textAlign="center" fontSize="2xl" mb="10px" fontFamily="Work sans">
                            Create Group Chat
                        </Box>
                        <FormControl mb="3">
                            <Input
                                placeholder="Chat Name"
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl mb="3">
                            <Input
                                placeholder="Add Users e.g., John, Piyush, Jane"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box display="flex" flexWrap="wrap" mb="3">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            <Box>Loading...</Box>
                        ) : (
                            searchResult?.slice(0, 4).map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handler={() => handleGroup(user)}
                                />
                            ))
                        )}
                        <Button onClick={handleSubmit} colorScheme="blue" mt="3">
                            Create Chat
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default GroupChatPopup;
