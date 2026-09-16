import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/dataSource.js";
import { User } from "../entities/user.js";
import { RefreshToken } from "../entities/refreshToken.js";
import { generateToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateRefreshToken.js";

const SALT_ROUNDS = 10;


// ==================== REGISTER ====================

export const register = async (req, res) => {
      try {
    const { name, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const refreshTokenRepository =
      AppDataSource.getRepository(RefreshToken);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

    // Check whether this is the first user
    const userCount = await userRepository.count();

    const role = userCount === 0 ? "admin" : "user";

    // Create user
    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save user
    const savedUser = await userRepository.save(user);

    // Remove password
    const { password: _omit, ...safeUser } = savedUser;

    // Generate tokens
    const accessToken = generateToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    // Hash refresh token
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      SALT_ROUNDS
    );

    // Create refresh token record
    const refreshTokenEntity = refreshTokenRepository.create({
      user_id: safeUser.id,
      token_hash: refreshTokenHash,
      expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    await refreshTokenRepository.save(refreshTokenEntity);

    // Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: safeUser,
      accessToken,
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Something went wrong while registering.",
    });
  }
};


// ==================== LOGIN ====================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const refreshTokenRepository =
      AppDataSource.getRepository(RefreshToken);

    // Find user
    const userRow = await userRepository.findOne({
      where: { email },
    });

    if (!userRow) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(
      password,
      userRow.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Remove password
    const { password: _omit, ...user } = userRow;

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      SALT_ROUNDS
    );

    // Create refresh token record
    const refreshTokenEntity = refreshTokenRepository.create({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    await refreshTokenRepository.save(refreshTokenEntity);

    // Store refresh token in cookie
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

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Something went wrong while logging in.",
    });
  }
};


// ==================== GET ME ====================

export const getMe = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const { password, ...safeUser } = user;

    res.json({
      user: safeUser,
    });

  } catch (error) {
    console.error("GetMe error:", error);

    res.status(500).json({
      message: "Something went wrong.",
    });
  }
};


// ==================== UPDATE PROFILE ====================

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.name = name;
    user.email = email;

    const updatedUser = await userRepository.save(user);

    const { password, ...safeUser } = updatedUser;

    res.json({
      user: safeUser,
    });

  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Something went wrong.",
    });
  }
};


// ==================== REFRESH ACCESS TOKEN ====================

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const refreshTokenRepository =
      AppDataSource.getRepository(RefreshToken);

    const userRepository =
      AppDataSource.getRepository(User);

    // Find all valid refresh tokens for this user
    const storedTokens = await refreshTokenRepository.find({
      where: {
        user_id: decoded.id,
      },
    });

    let storedToken = null;

    // Compare actual token against stored hashes
    for (const row of storedTokens) {
      if (
        row.expires_at > new Date() &&
        await bcrypt.compare(
          refreshToken,
          row.token_hash
        )
      ) {
        storedToken = row;
        break;
      }
    }

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token.",
      });
    }

    // Delete old refresh token
    await refreshTokenRepository.delete(
      storedToken.id
    );

    // Get user
    const user = await userRepository.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const { password, ...safeUser } = user;

    // Generate new tokens
    const accessToken = generateToken(safeUser);
    const newRefreshToken =
      generateRefreshToken(safeUser);

    // Hash new refresh token
    const newRefreshTokenHash =
      await bcrypt.hash(
        newRefreshToken,
        SALT_ROUNDS
      );

    // Store new refresh token
    const newRefreshTokenEntity =
      refreshTokenRepository.create({
        user_id: safeUser.id,
        token_hash: newRefreshTokenHash,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      });

    await refreshTokenRepository.save(
      newRefreshTokenEntity
    );

    // Replace cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
    });

  } catch (error) {
    console.error("Refresh token error:", error);

    res.status(401).json({
      message: "Invalid or expired refresh token.",
    });
  }
};


// ==================== LOGOUT ====================

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const refreshTokenRepository =
        AppDataSource.getRepository(RefreshToken);

      const storedTokens =
        await refreshTokenRepository.find();

      for (const row of storedTokens) {
        const matches = await bcrypt.compare(
          refreshToken,
          row.token_hash
        );

        if (matches) {
          await refreshTokenRepository.delete(
            row.id
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