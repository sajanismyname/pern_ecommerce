import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./config/db.js";
import { initializeDatabase } from "./config/Initialdatabse.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query("SELECT 1"); // fail fast if DB is unreachable
    await initializeDatabase()
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
};

start();
