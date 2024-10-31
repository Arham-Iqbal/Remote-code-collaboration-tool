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
    navigate(`/editor/${roomid} `, { state: { username, roomid } });
    toast.success("Entered the room");
  };

  const handleenter = (e) => {
    if (e.code === "Enter") {
      joinroom();
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-gray-200"
      style={{ backgroundColor: "#1c1e29" }}
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/Images/codecast.png"
            alt="codecollab"
            className="w-24 h-24 mb-4"
          />
          <h1 className="text-2xl font-bold">Enter the Room ID</h1>
        </div>

        <input
          type="text"
          placeholder="Enter Room ID"
          className="w-full px-4 py-2 mb-4 border border-gray-600 rounded bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={roomidchange}
          value={roomid}
          onKeyDown={handleenter}
        />

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 border border-gray-600 rounded bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={usernamechange}
          value={username}
          onKeyDown={handleenter}
        />

        <button
          onClick={joinroom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition duration-300"
        >
          Join
        </button>

        <p className="text-center mt-4 text-gray-400">
          Don’t have a Room ID?
          <span
            className="text-blue-500 hover:underline cursor-pointer font-semibold"
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
