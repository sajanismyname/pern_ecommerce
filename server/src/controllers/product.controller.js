import { pool } from "../config/db.js";

export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, name, description, price, stock, image_url, category, created_at
       FROM products ${whereClause} ORDER BY created_at DESC`,
      values
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error("GetProducts error:", err);
    res.status(500).json({ message: "Could not fetch products." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, description, price, stock, image_url, category, created_at
       FROM products WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error("GetProductById error:", err);
    res.status(500).json({ message: "Could not fetch product." });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, price, stock, image_url, category, created_at`,
      [name, description || null, price, stock, imageUrl || null, category || null, req.user.id]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error("CreateProduct error:", err);
    res.status(500).json({ message: "Could not create product." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const columnMap = {
      name: "name",
      description: "description",
      price: "price",
      stock: "stock",
      imageUrl: "image_url",
      category: "category",
    };

    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      const column = columnMap[key];
      if (!column) continue;
      values.push(value === "" ? null : value);
      setClauses.push(`${column} = $${values.length}`);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE products SET ${setClauses.join(", ")}
       WHERE id = $${values.length}
       RETURNING id, name, description, price, stock, image_url, category, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error("UpdateProduct error:", err);
    res.status(500).json({ message: "Could not update product." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product deleted successfully.", id: result.rows[0].id });
  } catch (err) {
    console.error("DeleteProduct error:", err);
    res.status(500).json({ message: "Could not delete product." });
  }
};
