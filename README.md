# 🛒 ShopKart — Full-Stack E-Commerce Platform

A full-stack e-commerce web application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Razorpay Test Payment Gateway** covering customer authentication, product catalog, wishlist, shopping cart, checkout, payment signature verification, and order management.

---

## 🚀 Features

- **Customer Authentication**: Secure registration, login, and logout using JWT stored in `HttpOnly` cookies.
- **Product Catalog**: Live search, category filtering, and product details with stock tracking.
- **Wishlist**: Save and toggle favorite products with persistent backend state.
- **Shopping Cart**: Real-time cart calculations, quantity increment/decrement, stock validation, and derived subtotals with global Context API state management.
- **Checkout & Shipping**: Multi-field delivery address validation and order review.
- **Razorpay Payment Integration**: Server-side Razorpay order generation and mandatory HMAC SHA-256 signature verification.
- **Order Management**: Purchase-time product snapshots, order confirmation screens, and order history tracking (`/orders`).

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router v6, Tailwind CSS, Context API, Axios
- **Backend**: Node.js, Express.js, Mongoose, Razorpay SDK, Crypto
- **Database**: MongoDB Atlas

---

## 📦 Getting Started & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/jasraj15/shopkart.git
cd shopkart
```

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file (refer to `backend/.env.example`):
```env
dburl="your_mongodb_atlas_connection_string"
JWT_SECRET="your_jwt_secret"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### 3. Start the Backend Server
```bash
cd backend
npm install
node index.js
```
The backend server runs on `http://localhost:8082`.

### 4. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The client application runs on `http://localhost:5173`.

---

## 🧪 Testing Credentials (Razorpay Test Mode)

To complete a test payment on checkout:
- **Card**: `4111 1111 1111 1111` | Any future expiry date (e.g., `12/28`) | CVV: `123` | OTP: `1234`
- **Netbanking**: Select any bank (SBI, HDFC, ICICI) and click **Success**.
