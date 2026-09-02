import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setItems(res.data.items);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post("/cart", { productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{ items, total, loading, addToCart, updateQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
