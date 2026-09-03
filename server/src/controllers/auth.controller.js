import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";

const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM users");
    const role = countResult.rows[0].count === 0 ? "admin" : "user";

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong while registering." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      [email]
    );
    const userRow = result.rows[0];

    if (!userRow) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, userRow.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { password: _omit, ...user } = userRow;
    const token = generateToken(user);

    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong while logging in." });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const updateProfile= async(req,res)=>{
  try {
    const {name,email}=req.body
    const result = await pool.query(
      `UPDATE users 
      SET name =$1, email=$2 
      WHERE id = $3
      RETURNING name, email, id ,role, created_at`,
      [name, email, req.user.id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }


    res.json({user: result.rows[0]})
  } catch (error) {
    console.error(error)
    res.status(500).json({message: "Something went wrong"})
  }
}
