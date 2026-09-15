import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js"
import { AppDataSource } from "./config/dataSource.js";
import { User } from "./entities/user.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/test-typeorm-user/:id", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "TypeORM test failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal server error." });
});

export default app;
