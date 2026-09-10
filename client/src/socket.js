import { io } from "socket.io-client";

const socket = io(
    import.meta.env.VITE_API_URL || "http://localhost:5000",
    {
        autoConnect: false,
        withCredentials: true,
    }
);
socket.on("private_message", (data) => {

  console.log(
    "🔒 Private message:",
    data
  );

});
export default socket;