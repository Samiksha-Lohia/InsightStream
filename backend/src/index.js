// src/index.js
import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDb from "./config/db.js";
import { app } from "./app.js";
import { initSocketListeners } from "./utils/socketListeners.js";

dotenv.config();

app.get('/', (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "InsightStream Backend API is active"
  });
});

const server = http.createServer(app);

// Initialize IO
export const io = new Server(server, {
  cors: { origin: "*" },
});

// Setup listeners after IO is initialized
initSocketListeners(io);

io.on("connection", (socket) => {
  console.log(`[🔌 WebSocket] Client connected: ${socket.id}`);
});

connectDb().then(() => {
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
});