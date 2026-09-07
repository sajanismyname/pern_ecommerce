import { pool } from "./db.js";

export const initializeDatabase = async () => {
  // Create enum
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
      ) THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      END IF;
    END
    $$;
  `);

  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role user_role NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Products
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image_url VARCHAR(500),
      category VARCHAR(100),
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Cart items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, product_id)
    );
  `);

  // Orders
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total NUMERIC(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      payment_status VARCHAR(30) NOT NULL DEFAULT 'paid',
      order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Order items
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price NUMERIC(10, 2) NOT NULL
    );
  `);

  console.log("Database initialized successfully");
};