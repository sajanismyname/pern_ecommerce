import { Router } from "express";
import {
    createOrder,
    getAdminOrders,
} from "../controllers/order.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", createOrder);
router.get("/admin", getAdminOrders);

export default router;