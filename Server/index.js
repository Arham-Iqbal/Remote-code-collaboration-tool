const express = require("express");
const app = express();
const Port = 4000;
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
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

server.listen(Port, () => {
  console.log(`Server started on port ${Port}`);
});
