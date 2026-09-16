import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { initializeSocket } from "./socket.js";
import { AppDataSource } from "./config/dataSource.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Socket authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  console.log("Authenticated socket:", socket.id);
  console.log("Authenticated user:", socket.user);

  const userId = socket.user.id;

  socket.join(`user:${userId}`);

  console.log(
    `Socket ${socket.id} joined room user:${userId}`
  );

  socket.on("test_private_message", (message) => {
    io.to(`user:${userId}`).emit(
      "private_message",
      {
        message,
        userId,
      }
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "User disconnected:",
      socket.user,
      "Reason:",
      reason
    );
  });
});

const start = async () => {
  try {
    // Existing PostgreSQL connection
    await pool.query("SELECT 1");
    console.log("PostgreSQL pool connected");

    // New TypeORM connection
    await AppDataSource.initialize();
    console.log("TypeORM connected successfully");

    // Start server ONCE
    httpServer.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  } catch (err) {
    console.error(
      "Failed to start server:",
      err.message
    );

    process.exit(1);
  }
};

start();