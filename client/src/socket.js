import { io } from "socket.io-client";

const socket = io(
    import.meta.env.VITE_API_URL || "http://localhost:5000",
    {
        autoConnect: false,
        withCredentials: true,
    }
);

export const updateSocketAuth = (token) => {
    socket.auth = {
        token,
    }
}

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.error("🔴 Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
        console.log("🟡 Socket disconnected:", reason);
    });

    socket.on("private_message", (data) => {
        console.log("🔒 Private message:", data);
    });
    
export default socket;