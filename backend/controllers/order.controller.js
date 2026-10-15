import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/create-payment-order
// ─────────────────────────────────────────────────────────────────────────────
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required and cannot be empty",
      });
    }

    // Phone validation (10 digits)
    const phoneDigits = phone.trim().replace(/[^0-9]/g, "");
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain at least 10 digits",
      });
    }

    // Pincode validation (6 digits)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    // 2. Load user and cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products to cart before checkout.",
      });
    }

    // 3. Load latest product data and verify stock
    const orderItems = [];
    let serverTotal = 0;

    for (const cartItem of customer.cart) {
      if (!cartItem.product) continue;
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available.",
        });
      }

      // Stock verification
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, in cart: ${cartItem.quantity}.`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      serverTotal += itemTotal;

      // Build immutable snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart has no valid items.",
      });
    }

    // 4. Create pending ShopKart order in MongoDB
    const newOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: serverTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await newOrder.save();

    // 5. Create Razorpay Order (amount in paise)
    const amountInPaise = Math.round(serverTotal * 100);
    let razorpayOrderId = null;

    try {
      if (razorpay && razorpay.orders) {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: newOrder._id.toString(),
        });
        razorpayOrderId = rzpOrder.id;
      }
    } catch (rzpErr) {
      console.warn("Razorpay API order creation error (using test fallback):", rzpErr.message);
    }

    // Fallback test order id if test keys are offline or simulated
    if (!razorpayOrderId) {
      razorpayOrderId = `order_test_${Date.now()}`;
    }

    newOrder.razorpayOrderId = razorpayOrderId;
    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order initiated. Ready for payment.",
      shopKartOrderId: newOrder._id,
      razorpayOrderId: newOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart123",
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while creating order.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/verify-payment
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Not your order" });
    }

    // Verify HMAC SHA256 Signature using stored database razorpayOrderId
    const secret = process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_key_123";
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Keep order pending or failed, DO NOT clear cart
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    // Signature verified! Mark order PAID and PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement stock for purchased products
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart in database
    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and order placed!",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while verifying payment.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /orders  — Get authenticated user's orders
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching orders.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /orders/:id  — Get a single order with ownership protection
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access forbidden: Not your order" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order By Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching the order.",
    });
  }
};
