import React, { useState } from 'react';
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
import { Box, Button, Input, Text, Spinner, DrawerFooter } from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/form-control';
import UserListItem from '../UserCard/UserListItem';
import { toast } from 'react-toastify';
import axios from 'axios';

const GroupChatDrawer = ({ selectedChat, setSelectedChat, fetchAgain, setfetchAgain, user }) => {
    const [open, setOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [renameloading, setRenameLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.put(
                `/api/chat/rename`,
                { chatId: selectedChat._id, chatName: groupChatName },
                config
            );

            setSelectedChat(data);
            setfetchAgain(!fetchAgain);
        } catch (error) {
            toast.error("Only admins can rename!", { position: "top-right" });
        }
        setRenameLoading(false);
        setGroupChatName("");
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
        } catch (error) {
            toast.error("Failed to load search results", { position: "top-right" });
        }
        setLoading(false);
    };

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast.warn("User already in group!", { position: "top-right" });
            return;
        }

        if (selectedChat.admin._id !== user._id) {
            toast.error("Only admins can add users!", { position: "top-right" });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.put(
                `/api/chat/group/add`,
                { chatId: selectedChat._id, userId: user1._id },
                config
            );

            setSelectedChat(data);
            setfetchAgain(!fetchAgain);
        } catch (error) {
            toast.error("Error occurred", { position: "top-right" });
        }
        setLoading(false);
    };

    const handleRemove = async (user1) => {
        if (selectedChat.admin._id !== user._id && user1._id !== user._id) {
            toast.error("Only admins can remove users!", { position: "top-right" });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.put(
                `/api/chat/group/remove`,
                { chatId: selectedChat._id, userId: user1._id },
                config
            );

            user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
            setfetchAgain(!fetchAgain);
        } catch (error) {
            toast.error("Error occurred", { position: "top-right" });
        }
        setLoading(false);
    };

    return (
        <DrawerRoot open={open} placement={'end'} onOpenChange={(e) => setOpen(e.open)}>
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
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Save
                            </Button>
                        </FormControl>
                        <Text>Click on a user to remove them from the group</Text>
                        {selectedChat.users.map((u) => (
                            <UserListItem
                                key={u._id}
                                user={u}
                                admin={selectedChat.admin}
                                handler={() => handleRemove(u)}
                            />
                        ))}
                        {selectedChat?.admin._id === user?._id && (
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
                                        <UserListItem key={user._id} user={user} handler={() => handleAddUser(user)} />
                                    ))
                                )}
                            </Box>
                        )}
                    </Box>
                </DrawerBody>
                <DrawerFooter>
                    <Button onClick={() => handleRemove(user)} color={'white'} bg={'red'}>
                        Leave Group
                    </Button>
                </DrawerFooter>
                <DrawerCloseTrigger asChild>
                    <Button colorScheme="red">Close</Button>
                </DrawerCloseTrigger>
            </DrawerContent>
        </DrawerRoot>
    );
};

export default GroupChatDrawer;
