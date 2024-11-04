const express = require("express");
require('dotenv').config();
const app = express();
const Port = process.env.PORT;
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const path = require("path");
const io = new Server(server, {
  cors: {
    origin: "https://remote-code-collaboration-tool-lcvt.vercel.app",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ username, roomid }) => {
    socket.join(roomid);

    if (!rooms[roomid]) rooms[roomid] = [];
    rooms[roomid].push({ username, socketId: socket.id });

    socket.to(roomid).emit("user-joined", { username, socketId: socket.id });

    socket.emit("room-users", rooms[roomid]);
  });

  socket.on("disconnect", () => {
    for (const roomid in rooms) {
      const userIndex = rooms[roomid].findIndex(
        (user) => user.socketId === socket.id
      );
      if (userIndex !== -1) {
        const disconnectedUser = rooms[roomid][userIndex].username;

        rooms[roomid].splice(userIndex, 1);

        socket.to(roomid).emit("user-left", {
          socketId: socket.id,
          username: disconnectedUser,
        });

        if (rooms[roomid].length < 1) {
          delete rooms[roomid];
        }
        break;
      }
    }
  });

  socket.on("code-change", ({ roomid, code }) => {
    socket.to(roomid).emit("receive-code", code);
  });
  socket.on("output-change", ({ output, roomid }) => {
    socket.to(roomid).emit("receive-output", output);
  });
  socket.on("btn-run", ({ coderun, roomid }) => {
    socket.to(roomid).emit("btn-running", coderun);
  });
  socket.on("code-run-completed", ({ roomid }) => {
    socket.to(roomid).emit("code-run-completed");
  });
  socket.on("change-language", ({ language, roomid }) => {
    socket.to(roomid).emit("languagechanged", language);
  });
  socket.on("message",({message,username,roomid})=>{
    socket.to(roomid).emit("new-message",{message,username})
  })
});
// Middleware to serve static files from the React app
app.use(express.static(path.join(__dirname, 'Client/build')));

// Route all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client/build', 'index.html'));
});

server.listen(Port, () => {
  console.log(`Server started on port ${Port}`);
});
