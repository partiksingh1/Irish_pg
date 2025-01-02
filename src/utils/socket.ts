import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

// Create an Express application instance
const app = express();

// Create an HTTP server for Socket.IO to bind
const server = createServer(app);

// Initialize the Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*", // Replace with your frontend's URL in production
        methods: ["GET", "POST"],
    },
});

// Set up Socket.IO event listeners
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat room
    socket.on("joinChat", (chatId: string) => {
        console.log(`User ${socket.id} joined chat: ${chatId}`);
        socket.join(chatId);
    });

    // Leave a chat room
    socket.on("leaveChat", (chatId: string) => {
        console.log(`User ${socket.id} left chat: ${chatId}`);
        socket.leave(chatId);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Export both the `io` instance and the `server` for use elsewhere
export { io, server };
