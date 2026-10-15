import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Task 2: Add Product to Wishlist (POST /wishlist/:productId)
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // 2. Find Product in database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 3. Find authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" });
        }

        // 4. Check for duplicate
        const isAlreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );
        if (isAlreadyWishlisted) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        // 5. Add product reference and save
        customer.wishlist.push(productId);
        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ success: false, message: "Server error adding to wishlist" });
    }
};

// Task 3: Get Current User's Wishlist (GET /wishlist)
export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock description"
        });

        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" });
        }

        // Filter out null values in case a referenced product was deleted
        const validWishlist = (customer.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ success: false, message: "Server error fetching wishlist" });
    }
};

// Task 4: Remove Product from Wishlist (DELETE /wishlist/:productId)
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        // 2. Find authenticated customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" });
        }

        // 3. Check if product is in wishlist
        const isWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );
        if (!isWishlisted) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        // 4. Remove reference and save
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({ success: false, message: "Server error removing from wishlist" });
    }
};

// Bonus: Toggle Wishlist (PATCH /wishlist/:productId/toggle)
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" });
        }

        const isWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isWishlisted) {
            customer.wishlist = customer.wishlist.filter(
                (id) => id.toString() !== productId
            );
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        return res.status(500).json({ success: false, message: "Server error toggling wishlist" });
    }
};
