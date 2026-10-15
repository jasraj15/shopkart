import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let razorpay = null;

try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart123",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkart_razorpay_secret_key_123",
  });
} catch (error) {
  console.warn("Razorpay initialization warning:", error.message);
}

export default razorpay;
