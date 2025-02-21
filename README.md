# Real-Time Group Chat with File Sharing

## Project Description
This is a **real-time group chat application** built using the **MERN stack**. It enables users to engage in group conversations, share files, and track online/offline statuses in real time. The app is designed for seamless communication, ensuring instant message delivery and an intuitive user experience.

## Features
- **Authentication & User Management**: Secure **JWT-based authentication** ensures user security. During signup, users can upload a **profile picture** using Multer, which is stored in **MongoDB**.
- **Group Chat Functionality**: Users can **create group chats**, **search for users**, **add or remove members**, and **rename groups** dynamically. This ensures flexibility in managing group conversations.
- **Real-Time Messaging & Status Tracking**: WebSockets (**Socket.io**) enable instant messaging. **Typing indicators** enhance user interaction, while **online status** and **last seen tracking** use a heartbeat mechanism for accurate presence detection.
- **File Sharing & Storage**: Users can **upload and download files** within chat conversations. Files are stored efficiently using **MongoDB GridFS**, enabling large file handling without performance bottlenecks.

## Tech Stack
- **Frontend:** React (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Profile Image Storage:** Multer with MongoDB
- **File Sharing:** GridFS for efficient storage and retrieval
- **Real-Time Communication:** Socket.io for WebSockets

## Approach
- **State Management**: Used **React Context API with custom hooks** to efficiently manage authentication state, user presence, and chat data.
- **Online Status Tracking**: Implemented a **heartbeat-based mechanism** with WebSockets to maintain accurate **online/offline status**.
- **File Uploads & Downloads**: Utilized **MongoDB GridFS** for scalable file storage, ensuring seamless media sharing.
- **Optimized WebSocket Communication**: Events like **typing indicators**, **group updates**, and **message delivery status** are handled efficiently to enhance real-time interactivity.
- **Scalable Group Chat Management**: Used MongoDB to maintain group metadata, ensuring fast retrieval of members and permissions.

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- MongoDB (Local or cloud instance like MongoDB Atlas)

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhavyramani/mern-chat-app
   cd mern-chat-app
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory and configure:
     ```env
     MONGO_URI=your_connection_uri
     JWT_SECRET=your_secret_key
     NODE_ENV=developement                  (change to production for deployement)
     CLIENT_URL=http://localhost:3000
     REACT_APP_BACKEND=http://localhost:5000
     REACT_APP_HEARTBEAT_MINUTES=5
     ```
   - (Change **CLIENT_URL** and **REACT_APP_BACKEND** during deployement)

4. **Start the development servers:**
   ```bash
   # Start backend
   npm start

   # Start frontend
   cd client
   npm start
   ```

5. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
1. **Sign up or log in** using your credentials.
2. **Join or create a group chat** to start messaging.
3. **Send real-time messages** with instant updates.
4. **Share files** within chats.
5. **Check user status** (online/offline) in real-time.