// socket.js
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("joinEvent", (eventId) => {
      socket.join(eventId);
      console.log(`User ${socket.id} joined event room ${eventId}`);
    });

    socket.on("chatMessage", ({ eventId, user, message }) => {
      io.to(eventId).emit("chatMessage", { user, message, time: new Date() });
    });

    socket.on("leaveEvent", (eventId) => {
      socket.leave(eventId);
      console.log(`User ${socket.id} left event room ${eventId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};
