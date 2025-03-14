import React, { useEffect, useState } from 'react'
import { Box, Container, Text, Tabs } from '@chakra-ui/react'
import Signup from '../components/auth/Signup';
import Login from '../components/auth/Login';
import { useHistory } from 'react-router-dom';

const Home = () => {
    const [value, setValue] = useState("login");
    const history = useHistory();

    // Redirect to chats if user is already logged in
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo)
            history.push("/chats");
    }
        , [history]);
    return (
        <Container zIndex={2} maxW='xl' centerContent>
            <Box
                display={'flex'}
                justifyContent={'center'}
                p={4}
                bg={'gray.900'}
                w={'100%'}
                m={'40px 0 15px 0'}
                borderRadius={'lg'}
                borderWidth={'1px'}
                fontWeight={'bold'}
            >
                <Text fontSize={'2xl'}>Chat App</Text>
            </Box>
            {/* Basic signup and login form */}
            <Box
                bg={'gray.900'}
                w={'100%'}
                p={4}
                borderRadius={'lg'}
                borderWidth={'1px'}
            >
                <Tabs.Root value={value} onValueChange={(e) => setValue(e.value)}>
                    <Tabs.List mb={'1em'}>
                        <Tabs.Trigger value="login" width={'50%'} justifyContent={'center'}>Login</Tabs.Trigger>
                        <Tabs.Trigger value="signup" width={'50%'} justifyContent={'center'}>Sign Up</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="login"><Login /></Tabs.Content>
                    <Tabs.Content value="signup"><Signup /></Tabs.Content>
                </Tabs.Root>
            </Box>
        </Container>
    )
}

export default Home
