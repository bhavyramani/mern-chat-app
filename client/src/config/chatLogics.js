// Identify oppsite user in chat
export const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

// Get online/offline status of user
export const getUserStatus = (loggedUser, users) => {
    const sender = users ? users.find(user => user._id !== loggedUser._id) : null;

    if (!sender || !sender.lastSeen) return "Unknown";

    const lastSeenTime = new Date(sender.lastSeen);
    const currentTime = new Date();

    const diffInMinutes = (currentTime - lastSeenTime) / (1000 * 60); 

    if (diffInMinutes <= process.env.REACT_APP_HEARTBEAT_MINUTES) {
        return "Online";
    } else {
        const istTime = new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata"
        }).format(lastSeenTime);    
        return `Last seen: ${istTime}`;
    }
};

// Check if previous user is same as current user
export const isSameSender = (messages, m, i, userId) => {
    return (
        i < messages.length - 1 &&
        (messages[i + 1].sender._id !== m.sender._id ||
            messages[i + 1].sender._id === undefined) &&
        messages[i].sender._id !== userId
    );
};

// Check if it is last message of sender
export const isLastMessage = (messages, i, userId) => {
    return (
        i === messages.length - 1 &&
        messages[messages.length - 1].sender._id !== userId &&
        messages[messages.length - 1].sender._id
    );
};

// Margin for loading image of sender
export const isSameSenderMargin = (messages, m, i, userId) => {
    if (
        i < messages.length - 1 &&
        messages[i + 1].sender._id === m.sender._id &&
        messages[i].sender._id !== userId
    )
        return 33;
    else if (
        (i < messages.length - 1 &&
            messages[i + 1].sender._id !== m.sender._id &&
            messages[i].sender._id !== userId) ||
        (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
        return 0;
    else return "auto";
};

export const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

