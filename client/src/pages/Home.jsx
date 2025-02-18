import React, { useState } from 'react'
import { Box, Container, Text, Tabs } from '@chakra-ui/react'
import Signup from '../components/auth/Signup';
import Login from '../components/auth/Login';
// import Login from '../components/auth/Login';
// import Signup from '../components/auth/Signup';

const Home = () => {
    const [value, setValue] = useState("login");
    return (
        <Container maxW='xl' centerContent>
            <Box
                display={'flex'}
                justifyContent={'center'}
                p={4}
                bg={'gray.800'}
                w={'100%'}
                m={'40px 0 15px 0'}
                borderRadius={'lg'}
                borderWidth={'1px'}
            >
                <Text fontSize={'2xl'}>Chat App</Text>
            </Box>

            <Box
                bg={'gray.800'}
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
