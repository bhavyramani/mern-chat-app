import React, { useEffect, useRef } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom';
import { Avatar } from '@chakra-ui/react';
import { FiFile, FiDownload } from 'react-icons/fi';
import { ChatState } from '../../context/ChatProvider';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../../config/chatLogics';

// Component to scroll chat to bottom
const ScrollChat = ({ messages }) => {
    const { user } = ChatState();
    const messagesEndRef = useRef(null); // Reference to bottom most div

    // Scroll to bottom when new message is added
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Function to download file
    const handleDownload = async (file) => {
        try {
            const url = `${process.env.REACT_APP_BACKEND}/api/files/download/${file.file}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const blobURL = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobURL;
            a.download = file.content;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(blobURL);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
        }
    };
    return (
        <ScrollToBottom>
            {messages &&
                messages.map((m, i) => (
                    <div style={{ display: "flex" }} key={m._id}>
                        {/* Show image only on last message of user */}
                        {(isSameSender(messages, m, i, user._id) ||
                            isLastMessage(messages, i, user._id)) && (
                                <Avatar.Root size={'sm'} mt={'7px'} mr={'5px'}>
                                    <Avatar.Fallback name={user.name} />
                                    <Avatar.Image src={`${process.env.REACT_APP_BACKEND}/uploads/${m.sender.profile}`} />
                                </Avatar.Root>
                            )}
                        <span
                            style={{
                                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}`,
                                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                                borderRadius: "20px",
                                padding: "5px 15px",
                                maxWidth: "75%",
                                color: 'black',
                                display: 'flex',
                                alignItems: "center"
                            }}
                        >
                            {/* Show file and download icon only if message is a file */}
                            {m.file && <FiFile height={'1px'} width={'1px'} style={{ marginRight: "6px" }} />}
                            {m.content}
                            {m.file && <FiDownload style={{ marginLeft: "6px", cursor: "pointer" }} onClick={() => handleDownload(m)} />}
                        </span>
                    </div>
                ))}
            <div ref={messagesEndRef} style={{ marginTop: "5px" }} />
        </ScrollToBottom>
    )
}

export default ScrollChat;
