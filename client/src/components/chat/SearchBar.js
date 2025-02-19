import { Box, Button, Container, Text, useDisclosure, Input, Toast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Avatar } from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import { useHistory } from 'react-router-dom';
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { toast } from "react-toastify";
import axios from 'axios';
import UserListItem from '../UserCard/UserListItem';

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setSelectedChat, chats, setChats } = ChatState();
  const [open, setOpen] = useState(false)
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    history.push('/')
  };

  const handleSearch = async () => {
    if (!search) {
      toast.warn("Please enter something in search", {
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
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast.error("Error Occured!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.post('/api/chat', { userId }, config);
      if (!chats.find((c) => c._id === data._id))
        setChats([data, ...chats]);
      setSelectedChat(data);
      setOpen(false);
    } catch (error) {
      toast.error("Error Occured!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <Container >
      <Box
        display={'flex'}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg="gray.800"
        w="100%"
        my={'10px'}
        p="5px 10px 5px 10px"
        borderWidth="5px">
        <DrawerRoot open={open} placement={'left'} onOpenChange={(e) => setOpen(e.open)}>
          <DrawerBackdrop />
          <DrawerTrigger asChild>
            <Button variant="ghost">
              <Text display={{ base: "none", md: "flex" }} px={4}>
                Search User
              </Text>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Search Users</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <Box display={'flex'} pb={'2px'}>
                <Input
                  placeholder={'Search my email or name'}
                  mr={'2px'}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button ml={'2px'} colorScheme="teal" variant="solid" onClick={handleSearch}>
                  Search
                </Button>
              </Box>
              {loading ? (
                "Loading..."
              ) :
                searchResult?.map((user) => {
                  return <UserListItem
                    key={user._id}
                    user={user}
                    handler={() => { accessChat(user._id); }}
                  />
                })
              }
            </DrawerBody>
            <DrawerCloseTrigger />
          </DrawerContent>
        </DrawerRoot>
        <Text fontSize={'2xl'} >Chat App</Text>
        <Menu>
          <MenuButton as={Button} p={'1px'} >
            <Avatar.Root>
              <Avatar.Fallback name={user.name} />
              <Avatar.Image src="https://bit.ly/sage-adebayo" />
            </Avatar.Root>
          </MenuButton>
          <MenuList zIndex={500} bg={'black'} p={'3px'}>
            <MenuItem cursor={'pointer'} value={user.name}>{user.name}</MenuItem>
            <MenuItem cursor={'pointer'} value="export" onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>

      </Box>
    </Container>
  )
};

export default SearchBar
