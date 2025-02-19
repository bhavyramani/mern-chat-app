import React, { useEffect, useRef } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom';
import { Avatar, Text } from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../../config/chatLogics';


const ScrollChat = ({ messages }) => {
    const { user } = ChatState();
    const messagesEndRef = useRef(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    return (
        <ScrollToBottom>
            {messages &&
                messages.map((m, i) => (
                    <div style={{ display: "flex" }} key={m._id}>
                        {(isSameSender(messages, m, i, user._id) ||
                            isLastMessage(messages, i, user._id)) && (
                                <Avatar.Root size={'sm'} mt={'7px'} mr={'5px'}>
                                    <Avatar.Fallback name={user.name} />
                                    <Avatar.Image src="https://bit.ly/sage-adebayo" />
                                </Avatar.Root>
                            )}
                        <span
                            style={{
                                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                                    }`,
                                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                                color: 'black'
                            }}
                        >
                            {m.content}
                        </span>
                    </div>
                ))}
            <div ref={messagesEndRef} style={{marginTop:"5px"}} />
        </ScrollToBottom>
    )
}

export default ScrollChat;
