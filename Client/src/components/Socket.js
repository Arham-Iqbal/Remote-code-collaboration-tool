// socket.js
import { io } from "socket.io-client";

const socket = io("https://remote-code-collaboration-tool.onrender.com/");

export default socket;
