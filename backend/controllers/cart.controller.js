import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// ── Helper: populate the cart and return it ──────────────────────────────────
const getPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name price image category stock description",
    });
    if (!customer || !Array.isArray(customer.cart)) return [];
    return customer.cart.filter((item) => item.product !== null);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /cart/:productId  —  Add product (or increase qty by 1)
// ─────────────────────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
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

        // Find existing cart entry for this product
        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            // Increase quantity by 1 — validate against stock
            const newQty = existingItem.quantity + 1;
            if (newQty > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available in stock`,
                });
            }
            existingItem.quantity = newQty;
        } else {
            // New item — add with quantity 1
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();
        const cart = await getPopulatedCart(customer._id);

        return res.status(200).json({ success: true, message: "Cart updated", cart });
    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /cart  —  Get authenticated user's cart (populated)
// ─────────────────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
    try {
        const cart = await getPopulatedCart(req.user._id);
        // Filter out items whose product was deleted
        const validCart = cart.filter((item) => item.product !== null);
        return res.status(200).json({ success: true, cart: validCart });
    } catch (error) {
        console.error("Get Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /cart/:productId  —  Update quantity of a specific cart item
// ─────────────────────────────────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const qty = Number(quantity);
        if (!qty || qty < 1 || !Number.isInteger(qty)) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number ≥ 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (qty > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available in stock`,
            });
        }

        const customer = await Customer.findById(req.user._id);
        const item = customer.cart.find((i) => i.product.toString() === productId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        item.quantity = qty;
        await customer.save();

        const cart = await getPopulatedCart(customer._id);
        return res.status(200).json({ success: true, message: "Quantity updated", cart });
    } catch (error) {
        console.error("Update Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /cart/:productId  —  Remove a product from cart
// ─────────────────────────────────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        const itemExists = customer.cart.some((i) => i.product.toString() === productId);

        if (!itemExists) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        customer.cart = customer.cart.filter((i) => i.product.toString() !== productId);
        await customer.save();

        const cart = await getPopulatedCart(customer._id);
        return res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
        console.error("Remove Cart Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
