import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";

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

    const accessToken = generateToken(user);

    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      SALT_ROUNDS
    );

    await pool.query(
      `INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshTokenHash]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user,
      accessToken,
    });
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

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body
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


    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const refreshAccessToken = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          message: "Refresh token required.",
        });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const result = await pool.query(
        `SELECT id, token_hash
        FROM refresh_tokens
        WHERE user_id = $1
        AND expires_at > NOW()`,
        [decoded.id]
      );

      let storedToken = null;

      for (const row of result.rows) {
        const matches = await bcrypt.compare(
          refreshToken,
          row.token_hash
        );

        if (matches) {
          storedToken = row;
          break;
        }
      }

      if (!storedToken) {
        return res.status(401).json({
          message: "Invalid refresh token.",
        });
      }

      // Remove old refresh token
      await pool.query(
        `DELETE FROM refresh_tokens
        WHERE id = $1`,
        [storedToken.id]
      );

      // Get user
      const userResult = await pool.query(
        `SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1`,
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const user = userResult.rows[0];

      // Generate new access token
      const accessToken = generateToken(user);

      // Generate new refresh token
      const newRefreshToken = generateRefreshToken(user);

      // Hash new refresh token
      const newRefreshTokenHash = await bcrypt.hash(
        newRefreshToken,
        SALT_ROUNDS
      );

      // Store new refresh token
      await pool.query(
        `INSERT INTO refresh_tokens
        (user_id, token_hash, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, newRefreshTokenHash]
      );

      // Replace cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        accessToken,
      });
    } catch (error) {
      console.error("Refresh token error:", error);

      return res.status(401).json({
        message: "Invalid or expired refresh token.",
      });
    }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const result = await pool.query(
        `SELECT id, token_hash
        FROM refresh_tokens`
      );

      for (const row of result.rows) {
        const matches = await bcrypt.compare(
          refreshToken,
          row.token_hash
        );

        if (matches) {
          await pool.query(
            `DELETE FROM refresh_tokens
            WHERE id = $1`,
            [row.id]
          );

          break;
        }
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      message: "Something went wrong while logging out.",
    });
  }
};