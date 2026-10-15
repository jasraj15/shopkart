import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError("Unable to load moodboard.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      setFeedback('Piece removed from your moodboard.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback('Failed to remove piece.');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    if (product.stock === 0) return;
    setMovingId(product._id);
    try {
      const res = await addToCart(product._id);
      if (res.success) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlist((prev) => prev.filter((p) => p._id !== product._id));
        setFeedback(`⚡ Moved ${product.name.slice(0, 20)}... directly to Bag!`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  const totalValue = useMemo(() => {
    return wishlist.reduce((acc, curr) => acc + (curr.price || 0), 0);
  }, [wishlist]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Opening saved moodboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-8">
          <h2 className="text-lg font-bold text-white mb-2">{error}</h2>
          <button onClick={fetchWishlist} className="btn-3d-olive px-6 py-2 text-xs mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-12 shadow-2xl">
          <div className="w-20 h-20 bg-[#161c24] text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_4px_0_#0f141a]">
            ♥
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Your Moodboard is Empty
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Discover new drops, kicks, and tech. Hit the heart icon on any card to save it here.
          </p>
          <Link
            to="/products"
            className="btn-3d-olive px-8 py-3 text-xs font-black inline-block"
          >
            Explore Drop Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {feedback && (
        <div className="mb-6 bg-[#84cc16]/15 border border-[#84cc16]/40 text-[#bef264] px-4 py-3 rounded-xl text-xs font-black flex items-center gap-2">
          <span>✨</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 mb-8 border-b border-[#1c232d]">
        <div>
          <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 inline-block">
            Curated Grails
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Saved Moodboard ❤️
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'piece' : 'pieces'} saved • Moodboard value: <strong className="text-[#84cc16]">₹{totalValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <Link to="/products" className="btn-3d-dark px-4 py-2 text-xs font-bold self-start sm:self-auto">
          Add More Pieces ›
        </Link>
      </div>

      {/* 3D Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const isOutOfStock = product.stock === 0;
          const isMoving = movingId === product._id;
          const isRemoving = removingId === product._id;

          return (
            <div
              key={product._id}
              className={`card-3d rounded-2xl overflow-hidden flex flex-col h-full ${
                isRemoving ? 'opacity-40 scale-95' : ''
              }`}
            >
              {/* Product Image Frame with 3D Depth */}
              <Link to={`/products/${product._id}`} className="bg-[#12161f] p-6 h-52 flex items-center justify-center overflow-hidden border-b border-[#1c232d]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform hover:scale-105 drop-shadow-xl"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=ShopKart'; }}
                />
              </Link>

              {/* Details */}
              <div className="p-5 flex flex-col flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#84cc16] mb-1">
                  {product.category}
                </span>

                <Link
                  to={`/products/${product._id}`}
                  className="text-sm font-bold text-white hover:text-[#bef264] line-clamp-2 leading-snug mb-2"
                >
                  {product.name}
                </Link>

                <div className="text-lg font-black text-white mb-3">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>

                {/* Tactile 3D Actions */}
                <div className="mt-auto space-y-2 pt-3 border-t border-[#1c232d]">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isMoving || isOutOfStock}
                    className={`w-full py-2.5 px-3 text-xs font-black transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-[#18202b] text-gray-500 border border-[#232d3b] cursor-not-allowed'
                        : isMoving
                        ? 'btn-3d-olive opacity-80 cursor-wait'
                        : 'btn-3d-olive'
                    }`}
                  >
                    {isMoving ? 'Moving...' : isOutOfStock ? 'Sold Out' : 'Move to Bag ⚡'}
                  </button>

                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={isRemoving}
                    className="w-full py-1.5 text-[11px] font-bold text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    Remove from moodboard
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
