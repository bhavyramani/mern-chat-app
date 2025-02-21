import { Input, Button, VStack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { toast } from "react-toastify";
import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);

    // Handler to login
    const handleLogin = async () => {
        setLoading(true);
        if (!email || !password) {
            toast.warn("Please fill all the fields!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );
            localStorage.setItem("userInfo", JSON.stringify(data));

            toast.success("Login Successful!", {
                position: "top-right",
                autoClose: 5000,
            });
            setLoading(false);
            window.location.reload(); // User will be redirected to /chats due to chat context
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || "Something went wrong!"}`, {
                position: "top-right",
                autoClose: 5000,
            });
            setLoading(false);
        }
    };
    return (
        <VStack spacing={'5px'}>
            <FormControl id='email' width={'100%'} isRequired>
                <FormLabel>
                    Email
                </FormLabel>
                <Input
                    border={'solid'}
                    borderColor={'white'}
                    borderWidth={'1px'}
                    placeholder='Enter Your Email'
                    onChange={(e) => { setEmail(e.target.value) }}
                />
            </FormControl>
            <FormControl id='password' width={'100%'} isRequired>
                <FormLabel>
                    Password
                </FormLabel>
                <Input
                    type='password'
                    border={'solid'}
                    borderColor={'white'}
                    borderWidth={'1px'}
                    placeholder='Enter Password'
                    onChange={(e) => { setPassword(e.target.value) }}
                />
            </FormControl>

            <Button
                width={'100%'}
                mt={'15px'}
                onClick={handleLogin}
                disabled={loading ? true : false}
            >
                Login
            </Button>
        </VStack>
    )
}

export default Login
