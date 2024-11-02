import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uuid from "react-uuid";
import toast from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [roomid, setroomid] = useState("");
  const [username, setusername] = useState("");

  const roomidchange = (e) => {
    setroomid(e.target.value);
  };

  const usernamechange = (e) => {
    setusername(e.target.value);
  };

  const generateid = () => {
    let x = uuid();
    setroomid(x);
    toast.success("New Room ID created successfully");
  };

  const joinroom = (event) => {
    if (!roomid || !username) {
      toast.error("Both fields are required.");
      return;
    }
    navigate(`/editor/${roomid}`, { state: { username, roomid } });
    toast.success("Entered the room");
  };

  const handleenter = (e) => {
    if (e.code === "Enter") {
      joinroom();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-200 bg-[#1c1e29]">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-lg shadow-lg max-w-md w-full transform hover:scale-105 transition-transform duration-300">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/Images/codecast.png"
            alt="codecollab"
            className="w-28 h-28 mb-4 rounded-full shadow-lg"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Join Your Collaboration Room
          </h1>
          <p className="text-gray-400 text-center">
            Collaborate in real-time with your team members
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter Room ID"
          className="w-full px-4 py-2 mb-4 border border-gray-700 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onChange={roomidchange}
          value={roomid}
          onKeyDown={handleenter}
        />

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-6 border border-gray-700 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onChange={usernamechange}
          value={username}
          onKeyDown={handleenter}
        />

        <button
          onClick={joinroom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow-md hover:shadow-lg transition-all duration-300"
        >
          Join Room
        </button>

        <p className="text-center mt-6 text-gray-400">
          Don’t have a Room ID?{" "}
          <span
            className="text-blue-500 hover:text-blue-400 hover:underline cursor-pointer font-semibold transition duration-300"
            onClick={generateid}
          >
            Create New Room
          </span>
        </p>
      </div>
    </div>
  );
};

export default Home;
