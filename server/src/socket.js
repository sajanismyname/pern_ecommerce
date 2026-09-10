import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {

    io = new Server(httpServer, {
        cors: {
            origin:
                process.env.CLIENT_URL ||
                "http://localhost:5173",
            credentials: true,
        },
    });

    return io;
};

export const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized"
        );
    }

    return io;
};