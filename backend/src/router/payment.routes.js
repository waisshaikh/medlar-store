import { Router } from "express";
import {
  verifyPaymentController,
  getPaymentByIdController,
  getUserPaymentsController,
  getPaymentByOrderIdController,
  razorpayWebhookController,
  markPaymentFailedController,
} from "../controllers/payment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/webhook", razorpayWebhookController);
router.post("/verify", authenticateUser, verifyPaymentController);
router.post("/failed", authenticateUser, markPaymentFailedController);
router.get("/my-orders", authenticateUser, getUserPaymentsController);
router.get("/order/:orderId", authenticateUser, getPaymentByOrderIdController);
router.get("/detail/:paymentId", authenticateUser, getPaymentByIdController);
router.get("/", authenticateUser, getUserPaymentsController);

export default router;
