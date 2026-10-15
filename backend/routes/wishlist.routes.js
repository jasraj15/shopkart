import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
} from "../controllers/wishlist.controller.js";

const router = express.Router();

// All wishlist routes are protected by auth middleware
router.use(isAuthenticated);

// GET /wishlist - Get current authenticated user's wishlist
router.get("/", getWishlist);

// POST /wishlist/:productId - Add product to wishlist
router.post("/:productId", addToWishlist);

// DELETE /wishlist/:productId - Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// Optional / Bonus: PATCH or POST /wishlist/:productId/toggle - Toggle wishlist item
router.patch("/:productId/toggle", toggleWishlist);
router.post("/:productId/toggle", toggleWishlist);

export default router;
