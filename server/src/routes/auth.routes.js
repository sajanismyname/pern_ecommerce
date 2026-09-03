import { Router } from "express";
import { register, login, getMe, updateProfile } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema, updateSchema } from "../validators/auth.validator.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", verifyToken, getMe);
router.patch("/profile",verifyToken, validate(updateSchema), updateProfile)

export default router;
