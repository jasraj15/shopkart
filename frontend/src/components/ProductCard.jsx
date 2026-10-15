import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, mutatingItemId, getItemQuantity } = useCart();
  const [wishlistState, setWishlistState] = useState('idle');
  const [cartFeedback, setCartFeedback] = useState(null);

  const cartQty = getItemQuantity(product._id);
  const isAddingToCart = mutatingItemId === product._id;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (isAddingToCart || isOutOfStock) return;
    setCartFeedback(null);
    const result = await addToCart(product._id);
    if (!result.success) {
      setCartFeedback({ type: 'error', message: result.message });
      setTimeout(() => setCartFeedback(null), 3000);
    } else {
      setCartFeedback({ type: 'success', message: '✓ Locked into Bag' });
      setTimeout(() => setCartFeedback(null), 2500);
    }
  };

  const handleWishlist = async () => {
    if (wishlistState === 'loading') return;
    setWishlistState('loading');
    try {
      const res = await api.patch(`/wishlist/${product._id}/toggle`);
      setWishlistState(res.data.saved ? 'added' : 'idle');
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistState('added');
      } else {
        setWishlistState('error');
      }
    }
  };

  return (
    <div className="card-3d rounded-2xl overflow-hidden flex flex-col h-full relative group">
      
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        {product.stock <= 8 && product.stock > 0 ? (
          <span className="bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#f87171] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            🔥 Low Stock
          </span>
        ) : (
          <span className="badge-olive px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            Verified Drop
          </span>
        )}
      </div>

      {/* Floating 3D Wishlist Heart */}
      <button
        onClick={handleWishlist}
        aria-label="Wishlist"
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          wishlistState === 'added'
            ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_3px_0_#7f1d1d]'
            : 'bg-[#151a23] border border-[#273243] text-gray-400 hover:text-white shadow-[0_3px_0_#0d1117] hover:scale-105'
        }`}
      >
        <svg className={`w-4 h-4 ${wishlistState === 'added' ? 'fill-current animate-spring' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Product Image Frame with 3D Depth */}
      <Link 
        to={`/products/${product._id}`} 
        className="bg-[#12161f] p-6 h-56 flex items-center justify-center overflow-hidden cursor-pointer relative border-b border-[#1c232d]"
      >
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=ShopKart'; }}
        />
      </Link>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[10px] font-black uppercase tracking-wider text-[#84cc16] mb-1">
          {product.category}
        </span>

        {/* Product Title */}
        <Link
          to={`/products/${product._id}`}
          className="text-sm font-bold text-white hover:text-[#bef264] line-clamp-2 leading-snug mb-3 transition-colors"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price & Currency Display */}
        <div className="flex items-baseline justify-between mb-4 mt-auto">
          <div>
            <span className="text-xl font-black text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-gray-400 block -mt-0.5">
              free 24h dispatch
            </span>
          </div>

          {cartQty > 0 && (
            <span className="badge-olive px-2 py-0.5 rounded-md text-[10px] font-bold">
              {cartQty} in bag
            </span>
          )}
        </div>

        {/* Feedback message */}
        {cartFeedback && (
          <div className={`mb-2 text-[11px] font-bold text-center py-1 rounded-lg ${
            cartFeedback.type === 'error' ? 'bg-red-950/50 text-red-300' : 'bg-[#84cc16]/20 text-[#bef264]'
          }`}>
            {cartFeedback.message}
          </div>
        )}

        {/* Tactile 3D Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart || cartQty >= product.stock}
          className={`w-full py-2.5 px-4 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isOutOfStock || cartQty >= product.stock
              ? 'bg-[#161c24] text-gray-500 border border-[#232c3a] cursor-not-allowed'
              : isAddingToCart
              ? 'btn-3d-olive opacity-80 cursor-wait'
              : 'btn-3d-olive'
          }`}
        >
          {isOutOfStock ? (
            'Sold Out'
          ) : isAddingToCart ? (
            'Securing Piece...'
          ) : cartQty >= product.stock ? (
            'Max Stock in Bag'
          ) : cartQty > 0 ? (
            `Add One More (${cartQty})`
          ) : (
            'Bag It ⚡'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
