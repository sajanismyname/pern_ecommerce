import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import socket, {updateSocketAuth} from "../socket.js";

const AuthContext = createContext(null);

export const AUTH_EVENTS = {
  TOKEN_REFRESHED: "token-refreshed",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const handleTokenRefresh = (event) => {
    const newAccessToken =
      event.detail.accessToken;

    updateSocketAuth(newAccessToken);

    if (socket.connected) {
      socket.disconnect();
    }

    socket.connect();
  };

  window.addEventListener(
    "token-refreshed",
    handleTokenRefresh
  );

  return () => {
    window.removeEventListener(
      "token-refreshed",
      handleTokenRefresh
    );
  };
}, []);

// 2. Initialize authentication when the app starts
useEffect(() => {
  const initializeAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");

      setUser(res.data.user);

      // Use the latest token because Axios may have refreshed it
      const latestToken = localStorage.getItem("token");

      if (latestToken) {
        updateSocketAuth(latestToken);
        socket.connect();
      }

    } catch (error) {
      console.error("Authentication initialization failed:", error);

      localStorage.removeItem("token");
      setUser(null);
      socket.disconnect();

    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);

const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  const accessToken = res.data.accessToken

  localStorage.setItem("token", accessToken);

  setUser(res.data.user);

   // Give Socket.IO the access token
  updateSocketAuth(accessToken)

  // Connect Socket.IO
  socket.connect();

  return res.data.user;
};

const register = async (name, email, password) => {
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  const accessToken = res.data.accessToken

  localStorage.setItem("token", accessToken);

  setUser(res.data.user);

  updateSocketAuth(accessToken)

  socket.connect();

  return res.data.user;
};

const updateUser = async (data) => {
    const res = await api.patch("/auth/profile", data);

    setUser(res.data.user);

    return res.data.user;
  };

  const logout = () => {
    socket.disconnect()
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
