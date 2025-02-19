import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from "./components/ui/provider"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import ChatProvider from "./context/ChatProvider"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Provider>
      <BrowserRouter>
        <ChatProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <App />
        </ChatProvider>
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);
