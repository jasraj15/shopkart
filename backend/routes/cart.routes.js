import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart routes are protected by authentication middleware
router.use(isAuthenticated);

// GET /cart - Get authenticated user's cart (populated)
router.get("/", getCart);

// POST /cart/:productId - Add product to cart (or increment qty)
router.post("/:productId", addToCart);

// PATCH /cart/:productId - Update quantity of a product in cart
router.patch("/:productId", updateCartItem);

// DELETE /cart/:productId - Remove product from cart
router.delete("/:productId", removeFromCart);

export default router;
