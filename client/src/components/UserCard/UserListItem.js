import React from 'react'
import { FaCircle } from 'react-icons/fa';
import { Box, Avatar, Text } from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import { getUserStatus } from '../../config/chatLogics';

// User card containing their information
const UserListItem = ({ user, handler, status }) => {
    const { selectedChat } = ChatState();
    return (
        <Box
            onClick={handler}
            cursor="pointer"
            bg="#E8E8E8"
            _hover={{
                background: "#38B2AC",
                color: "white",
            }}
            w="100%"
            display="flex"
            alignItems="start"
            justifyContent={'space-between'}
            color="black"
            px={'7px'}
            pr={'15px'}
            py={'7px'}
            my={'7px'}
            borderRadius="lg"
        >
            <Box display={'flex'}>
                <Box>

                    <Avatar.Root size={'sm'}>
                        <Avatar.Fallback name={user.name} />
                        <Avatar.Image src={`${process.env.REACT_APP_BACKEND}/uploads/${user.profile}`} />
                    </Avatar.Root>
                </Box>
                <Box ml={'10px'}>
                    <Box display={'flex'} alignItems={'center'} gap={1} justifyContent={'start'} fontSize={''}>
                        <Text fontSize={'md'}>{user.name}</Text>

                    </Box>
                    <Text fontSize="xs">
                        <b>Email : </b>
                        {user.email}
                    </Text>
                </Box>
            </Box>
            {status && <FaCircle height={1} width={1} color={getUserStatus(user, selectedChat.users) === 'Online' ? 'green' : 'gray'} />}
        </Box>
    )
}

export default UserListItem
