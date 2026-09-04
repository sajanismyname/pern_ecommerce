import { Router } from "express";
import {
    createOrder,
    getAdminOrders,
    getMyOrders,
    updateOrderStatus,
} from "../controllers/order.controller.js";

import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", createOrder);


router.get("/", getMyOrders);


router.get("/admin",isAdmin, getAdminOrders);

router.patch("/:id/status",isAdmin, updateOrderStatus)

export default router;