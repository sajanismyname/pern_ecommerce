import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addToCartSchema, updateCartItemSchema } from "../validators/cart.validator.js";

const router = Router();

router.use(verifyToken); // every cart route requires a logged-in user

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.put("/:id", validate(updateCartItemSchema), updateCartItem);
router.delete("/:id", removeCartItem);

export default router;
