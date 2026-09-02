import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "../validators/product.validator.js";

const router = Router();

// Public — anyone can browse products
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only — create, update, delete
router.post("/", verifyToken, isAdmin, validate(createProductSchema), createProduct);
router.put("/:id", verifyToken, isAdmin, validate(updateProductSchema), updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
