import { Input, Button, VStack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { toast } from "react-toastify";
import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';


const Signup = () => {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async () => {
        setLoading(true);
        if (!name || !email || !password || !confirmPassword) {
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

        if (password !== confirmPassword) {
            toast.warn("Passwords do not match!", {
                position: "top-right",
                autoClose: 5000,
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            };

            const formData = new FormData();
            formData.append("profile", profile);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);

            const { data } = await axios.post(
                "/api/user/signup",
                formData,
                config
            );
            console.log(data);
            toast.success("Registration Successful!", {
                position: "top-right",
                autoClose: 5000,
            });

            localStorage.setItem("userInfo", JSON.stringify(data));
            history.push("/chats");
            setLoading(false);
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
            <FormControl id='first-name' width={'100%'} isRequired>
                <FormLabel>
                    Name
                </FormLabel>

                <Input
                    border={'solid'}
                    borderColor={'white'}
                    borderWidth={'1px'}
                    placeholder='Enter Your Name'
                    onChange={(e) => { setName(e.target.value) }}
                />
            </FormControl>
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
            <FormControl id='confirm-password' width={'100%'} isRequired>
                <FormLabel>
                    Confirm Password
                </FormLabel>
                <Input
                    type='password'
                    border={'solid'}
                    borderColor={'white'}
                    borderWidth={'1px'}
                    placeholder='Enter Password Again'
                    onChange={(e) => { setConfirmPassword(e.target.value) }}
                />
            </FormControl>
            <FormControl id='profile' width={'100%'} >
                <FormLabel>
                    Upload Your Picture
                </FormLabel>
                <Input
                    type='file'
                    accept=".jpg"
                    mt={'7px'}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type !== "image/jpeg") {
                            toast.warn("Only JPG images are allowed!", {
                                position: "top-right",
                                autoClose: 5000,
                            });
                            e.target.value = "";
                            return;
                        }
                        setProfile(file);
                    }}
                />
            </FormControl>
            <Button
                width={'100%'}
                mt={'15px'}
                onClick={handleSubmit}
            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default Signup
