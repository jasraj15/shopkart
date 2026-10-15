import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, refreshCart, subtotal, cartCount, uniqueItemsCount } = useCart();

  // 1. Loading State
  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Syncing shopping bag...</p>
      </div>
    );
  }

  // 2. Error State
  if (cartError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-8">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-white mb-2">Unable to load bag</h2>
          <p className="text-gray-400 text-xs mb-6">{cartError}</p>
          <button
            onClick={refreshCart}
            className="btn-3d-olive px-6 py-2.5 text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-12 shadow-2xl">
          <div className="w-20 h-20 bg-[#161c24] text-[#84cc16] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_4px_0_#0f141a]">
            🛍️
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Your Express Bag is Empty
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Explore our curated catalog of streetwear, audio, and gadgets to build your haul.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/products"
              className="btn-3d-olive px-8 py-3 text-xs font-black inline-block"
            >
              Start Shopping
            </Link>
            <Link
              to="/wishlist"
              className="btn-3d-dark px-6 py-3 text-xs font-bold inline-block"
            >
              View Wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Cart Layout
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 mb-8 border-b border-[#1c232d]">
        <div>
          <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 inline-block">
            Verified Checkout
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Shopping Bag ({cartCount} pieces)
          </h1>
        </div>

        <Link to="/products" className="btn-3d-dark px-4 py-2 text-xs font-bold self-start sm:self-auto">
          ← Keep Exploring Drops
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product?._id || item._id} item={item} />
          ))}
        </div>

        {/* Right Column: 3D Bento Summary Box */}
        <div className="lg:col-span-4">
          <div className="bento-3d p-6 sm:p-7 sticky top-28 shadow-2xl">
            <h2 className="text-lg font-black text-white pb-3 mb-4 border-b border-[#232d3b] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="badge-olive px-2 py-0.5 rounded text-[10px]">
                {cartCount} items
              </span>
            </h2>

            {/* Delivery badge */}
            <div className="p-3 rounded-xl bg-[#0b0e14] border border-[#232d3b] mb-5 text-xs text-[#84cc16] flex items-center gap-2">
              <span className="text-base font-bold">⚡</span>
              <span className="font-bold">Complimentary Express Dispatch Unlocked</span>
            </div>

            {/* Cost Details */}
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="font-bold text-[#84cc16]">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes</span>
                <span className="font-bold text-white">₹0</span>
              </div>

              <div className="pt-4 border-t border-[#232d3b] flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-200">Total Payable</span>
                <span className="text-2xl font-black text-olive-gradient">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 3D Tactile Checkout Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full py-4 px-6 text-sm font-black btn-3d-olive shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </button>

            {/* Security Perks */}
            <div className="mt-6 pt-4 border-t border-[#232d3b] space-y-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-[#84cc16] font-bold">✓</span>
                <span>256-bit encrypted Razorpay sandbox</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#84cc16] font-bold">✓</span>
                <span>Direct tracking updates on dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
