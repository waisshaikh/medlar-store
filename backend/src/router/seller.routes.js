import { Router } from "express";
import { getOverview, getOrders, exportOrders, getOrderDetail, updateOrderStatus, getPayments, getCustomers } from "../controllers/seller.controller.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateSeller);

router.get("/overview", getOverview);
router.get("/orders", getOrders);
router.get("/orders/export", exportOrders);
router.get("/orders/:orderId", getOrderDetail);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/payments", getPayments);
router.get("/customers", getCustomers);

export default router;
