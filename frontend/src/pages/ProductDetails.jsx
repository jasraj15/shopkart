import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, mutatingItemId, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMsg, setCartMsg] = useState(null);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError(err.response?.status === 404 ? "Piece not found." : "Something went wrong loading details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!product || wishlistLoading) return;
    try {
      setWishlistLoading(true);
      const res = await api.patch(`/wishlist/${product._id}/toggle`);
      setWishlistSaved(Boolean(res.data.saved));
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading drop specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-8">
          <h2 className="text-xl font-bold text-white mb-2">{error || "Product not found"}</h2>
          <p className="text-gray-400 text-xs mb-6">This piece may have ended its release window.</p>
          <Link to="/products" className="btn-3d-olive px-6 py-2.5 text-xs inline-block">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const inCartQty = getItemQuantity(product._id);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="btn-3d-dark px-4 py-2 text-xs font-bold inline-flex items-center gap-2"
        >
          <span>←</span> Back to drops
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: 3D Product Image Showcase */}
        <div className="lg:col-span-6">
          <div className="bento-3d p-8 sm:p-12 flex flex-col items-center justify-center relative min-h-[460px]">
            <div className="absolute top-4 left-4">
              <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {product.category}
              </span>
            </div>

            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-[380px] max-w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=ShopKart'; }}
            />
          </div>
        </div>

        {/* Right: Specifications & 3D Purchase Action */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="bento-3d p-6 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#84cc16]">
                  Drop Release • Authentic
                </span>
                
                {/* 3D Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`btn-3d-dark p-2.5 flex items-center justify-center ${
                    wishlistSaved ? 'text-red-500 border-red-500/40' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className={`w-5 h-5 ${wishlistSaved ? 'fill-current animate-spring' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price display */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-olive-gradient">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#232d3b] text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                <p>{product.description}</p>
              </div>

              {/* Stock Urgency Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                  <span className="text-gray-400">Vault Availability</span>
                  <span className={product.stock > 0 ? 'text-[#84cc16]' : 'text-red-400'}>
                    {product.stock > 0 ? `${product.stock} units ready to ship` : 'Sold Out'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#18202b] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#65a30d] to-[#84cc16]"
                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Notification */}
            {cartMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-black text-center ${
                cartMsg.type === 'error' ? 'bg-red-950/40 text-red-300 border border-red-800' : 'bg-[#84cc16]/20 text-[#bef264] border border-[#84cc16]/40'
              }`}>
                {cartMsg.text}
              </div>
            )}

            {/* Tactile 3D Action Strip */}
            <div className="space-y-3 pt-4 border-t border-[#232d3b]">
              <button
                onClick={async () => {
                  if (mutatingItemId === product._id || isOutOfStock) return;
                  setCartMsg(null);
                  const res = await addToCart(product._id);
                  if (res.success) {
                    setCartMsg({ type: 'success', text: '✓ Secured into your shopping bag' });
                    setTimeout(() => setCartMsg(null), 3000);
                  } else {
                    setCartMsg({ type: 'error', text: res.message });
                    setTimeout(() => setCartMsg(null), 4000);
                  }
                }}
                disabled={isOutOfStock || mutatingItemId === product._id || inCartQty >= product.stock}
                className={`w-full py-4 px-6 text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isOutOfStock || inCartQty >= product.stock
                    ? 'bg-[#18202b] text-gray-500 border border-[#232d3b] cursor-not-allowed'
                    : 'btn-3d-olive'
                }`}
              >
                {mutatingItemId === product._id ? 'Securing...' : isOutOfStock ? 'Sold Out' : 'Secure This Piece ⚡'}
              </button>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400 font-bold pt-2">
                <div className="p-2 rounded-lg bg-[#0c1017] border border-[#232d3b]">⚡ 24h Dispatch</div>
                <div className="p-2 rounded-lg bg-[#0c1017] border border-[#232d3b]">🛡️ Authentic Grail</div>
                <div className="p-2 rounded-lg bg-[#0c1017] border border-[#232d3b]">🔒 Razorpay Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
