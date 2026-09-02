import { pool } from "../config/db.js";

export const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = $1
        ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    res.json({ items, total: Number(total.toFixed(2)) });
  } catch (err) {
    console.error("GetCart error:", err);
    res.status(500).json({ message: "Could not fetch cart." });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const productResult = await pool.query(
      "SELECT id, stock FROM products WHERE id = $1",
      [productId]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    if (productResult.rows[0].stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available." });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING id, product_id, quantity`,
      [req.user.id, productId, quantity]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error("AddToCart error:", err);
    res.status(500).json({ message: "Could not add item to cart." });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1
        WHERE id = $2 AND user_id = $3
        RETURNING id, product_id, quantity`,
      [quantity, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error("UpdateCartItem error:", err);
    res.status(500).json({ message: "Could not update cart item." });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.json({ message: "Item removed from cart.", id: result.rows[0].id });
  } catch (err) {
    console.error("RemoveCartItem error:", err);
    res.status(500).json({ message: "Could not remove cart item." });
  }
};
