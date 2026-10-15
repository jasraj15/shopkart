import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, refreshCart, subtotal, cartCount, uniqueItemsCount } = useCart();

  // 1. Loading State
  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading your cart...</p>
      </div>
    );
  }

  // 2. Error State
  if (cartError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-10 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to load your cart.</h2>
          <p className="text-red-600 mb-6">{cartError}</p>
          <button
            onClick={refreshCart}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🛒
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Your cart is empty 🛒
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Looks like you haven't added anything yet. Explore our top products and start shopping!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all duration-200"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 4. Cart List + Order Summary
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            My Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {uniqueItemsCount} unique {uniqueItemsCount === 1 ? 'item' : 'items'} ({cartCount} total units)
          </p>
        </div>
        <Link
          to="/products"
          className="mt-3 sm:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          ← Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product?._id || item._id} item={item} />
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900">{cartCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-gray-900">₹0</span>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-gray-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full py-3.5 px-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
