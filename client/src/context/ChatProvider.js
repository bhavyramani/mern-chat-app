import React, { createContext, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

// Chat context provider
const chatContext = createContext();
const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();                  // Current logged in user
    const [selectedChat, setSelectedChat] = useState();  // Selected chat on which user is active now
    const [chats, setChats] = useState([]);              // Chat list
    const history = useHistory();

    // Acts as middleware from frontend
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if(!userInfo) {
            history.push("/");
        }
    }, [history]);
    return (
        <chatContext.Provider value={{user, setUser, selectedChat, setSelectedChat, chats, setChats}}>
            {children}
        </chatContext.Provider>
    )
};

export const ChatState = () => {
    return useContext(chatContext);
}

export default ChatProvider;