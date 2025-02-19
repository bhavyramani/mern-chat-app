import React from 'react'
import { ChatState } from '../../context/ChatProvider'
import { Box, Avatar, Text } from '@chakra-ui/react';

const UserListItem = ({ user, handler }) => {
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
            d="flex"
            alignItems="center"
            color="black"
            px={'7px'}
            py={'7px'}
            my={'7px'}
            borderRadius="lg"
        >
            <Box display={'flex'}>
                <Box>

                    <Avatar.Root size={'sm'}>
                        <Avatar.Fallback name={user.name} />
                        <Avatar.Image src="https://bit.ly/sage-adebayo" />
                    </Avatar.Root>
                </Box>
                <Box ml={'10px'}>

                    <Text>{user.name}</Text>
                    <Text fontSize="xs">
                        <b>Email : </b>
                        {user.email}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default UserListItem
