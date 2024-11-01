import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaRocketchat } from "react-icons/fa";
import toast from "react-hot-toast";
import socket from './Socket';

const Chat = () => {
  const location = useLocation();
  const [chat, setChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, roomid } = location.state || {};

  const openChat = () => setChat(true);
  const closeChat = () => setChat(false);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { message, username, roomid });
      setMessages((prevMessages) => [...prevMessages, { message, username }]);
      setMessage("");
      toast.success("Message sent");
    }
  };

  const handleInputChange = (e) => setMessage(e.target.value);

  useEffect(() => {
    socket.on("new-message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      if (data.username !== username) {
        toast.success(`Message received from ${data.username}`);
      }
    });
    return () => socket.off("new-message");
  }, [roomid, username]);

  // Dragging state and handlers
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e) => {
    setPosition({
      x: e.clientX - e.target.offsetWidth / 2,
      y: e.clientY - e.target.offsetHeight / 2,
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={openChat}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FaRocketchat className="mr-2" /> Open Chat
      </button>

      {chat && (
        <div
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          className="fixed bg-white rounded-lg w-64 h-80 p-4 shadow-lg z-50 cursor-move"
          draggable
          onDragEnd={handleDrag}
        >
          <h2 className="text-lg font-semibold text-blue-800">Chat Room</h2>
          <button
            onClick={closeChat}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600"
          >
            ×
          </button>
          <div className="mb-4 h-48 overflow-y-auto border border-gray-300 rounded p-2">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong className="text-blue-500">{msg.username}:</strong>
                <p className="text-black">{msg.message}</p>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded p-2 mb-2 text-black"
          />
          <button
            onClick={sendMessage}
            className="w-full bg-green-500 text-white rounded py-1 hover:bg-green-600"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
