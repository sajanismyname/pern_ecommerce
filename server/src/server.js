import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";
import {createServer} from "http"
import {Server} from "socket.io"
import { initializeDatabase } from "./config/Initialdatabse.js";
import jwt from "jsonwebtoken"
import { initializeSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;


const httpServer = createServer(app);//this creates an http server using express app
const io = initializeSocket(httpServer);

//socket authentication
io.use((socket, next)=>{
  try {
    const token = socket.handshake.auth.token;

    if(!token){
          return next(
        new Error("Authentication required")
      );
    }

    const decoded =jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    )

    socket.user = decoded
    next()
  } catch (error) {
    next(
      new Error("Invalid authentication token")
    );
  }
})

io.on("connection", (socket) => {

  console.log(
    "Authenticated socket:",
    socket.id
  );

  console.log(
    "Authenticated user:",
    socket.user
  );

  const userId = socket.user.id
  socket.join(`user:${userId}`)

  console.log(
    `Socket ${socket.id} joined room user:${userId}`
  );

  socket.on("test_private_message",(message)=>{

    io.to(`user:${userId}`).emit(
      "private_message",
      {
        message: message,
        userId:userId,
      }
    )
  })


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

    await pool.query("SELECT 1");

    await initializeDatabase();


    httpServer.listen(PORT, () => {

      console.log(
        `Server running on http://localhost:${PORT}`
      );

    });

  } catch (err) {

    console.error(
      "Failed to connect to PostgreSQL:",
      err.message
    );

    process.exit(1);

  }

};

start();
