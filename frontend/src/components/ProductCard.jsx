import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, mutatingItemId, getItemQuantity } = useCart();
  const [wishlistState, setWishlistState] = useState('idle'); // idle | loading | added | error
  const [wishlistMsg, setWishlistMsg] = useState('');
  const [cartFeedback, setCartFeedback] = useState(null);

  const cartQty = getItemQuantity(product._id);
  const isAddingToCart = mutatingItemId === product._id;

  const handleAddToCart = async () => {
    if (isAddingToCart || product.stock === 0) return;
    setCartFeedback(null);
    const result = await addToCart(product._id);
    if (!result.success) {
      setCartFeedback({ type: 'error', message: result.message });
      setTimeout(() => setCartFeedback(null), 3000);
    } else {
      setCartFeedback({ type: 'success', message: 'Added!' });
      setTimeout(() => setCartFeedback(null), 2000);
    }
  };

  const handleWishlist = async () => {
    if (wishlistState === 'loading') return;
    setWishlistState('loading');
    setWishlistMsg('');
    try {
      const res = await api.patch(`/wishlist/${product._id}/toggle`);
      if (res.data.saved) {
        setWishlistState('added');
        setWishlistMsg('♥ Added to Wishlist');
      } else {
        setWishlistState('idle');
        setWishlistMsg('♡ Add to Wishlist');
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 409) {
        setWishlistState('added');
        setWishlistMsg('♥ Already in Wishlist');
      } else if (err.response?.status === 401) {
        setWishlistState('error');
        setWishlistMsg('Login to save');
      } else {
        setWishlistState('error');
        setWishlistMsg('Unable to save. Try again.');
      }
    }
  };

  const wishlistLabel = () => {
    if (wishlistState === 'loading') return '⏳ Saving...';
    if (wishlistState === 'added') return wishlistMsg || '♥ Saved';
    if (wishlistState === 'error') return wishlistMsg || 'Error';
    return '♡ Wishlist';
  };

  const wishlistClass = () => {
    if (wishlistState === 'added') return 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200';
    if (wishlistState === 'error') return 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200';
    if (wishlistState === 'loading') return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
    return 'bg-white text-gray-600 border-gray-300 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-110"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full border border-red-200">
            Out of Stock
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.category}
        </div>
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-3">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-xl font-extrabold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {cartQty > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                In Cart ({cartQty})
              </span>
            )}
          </div>

          {cartFeedback && (
            <div className={`text-xs font-medium mb-2 px-2 py-1 rounded ${
              cartFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {cartFeedback.message}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {/* Task 7: Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0 || cartQty >= product.stock}
              className={`w-full inline-flex justify-center items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 ${
                product.stock === 0
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : cartQty >= product.stock
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed'
                  : isAddingToCart
                  ? 'bg-blue-400 text-white cursor-wait'
                  : cartQty > 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-600 hover:text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Adding...
                </span>
              ) : product.stock === 0 ? (
                'Out of Stock'
              ) : cartQty >= product.stock ? (
                'Max in Cart'
              ) : cartQty > 0 ? (
                'Add Another'
              ) : (
                'Add to Cart'
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link 
                to={`/products/${product._id}`}
                className="inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors text-center"
              >
                Details
              </Link>
              <button
                onClick={handleWishlist}
                disabled={wishlistState === 'loading'}
                className={`inline-flex justify-center items-center px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all duration-200 text-center ${wishlistClass()}`}
              >
                {wishlistLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
