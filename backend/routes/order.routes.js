import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

// All order routes require authentication
router.use(isAuthenticated);

// POST /orders/create-payment-order — Validate cart, create ShopKart order & Razorpay order
router.post("/create-payment-order", createPaymentOrder);

// POST /orders/verify-payment — Verify HMAC SHA256 signature, mark PAID, clear cart
router.post("/verify-payment", verifyPayment);

// GET /orders — Get current authenticated user's order history
router.get("/", getMyOrders);

// GET /orders/:id — Get a single order (ownership checked)
router.get("/:id", getOrderById);

export default router;
