import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const WishlistCard = ({ product, onRemove, removing }) => (
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
      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2" title={product.name}>
        {product.name}
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
      </p>

      <div className="mt-auto">
        <div className="text-xl font-extrabold text-gray-900 mb-3">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={() => onRemove(product._id)}
            disabled={removing === product._id}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {removing === product._id ? '⏳ Removing...' : '♥ Remove'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null); // productId being removed
  const navigate = useNavigate();

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
        setError('We couldn\'t load your wishlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert('Failed to remove product. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-pink-500 mb-4"></div>
        <p className="text-gray-500 font-medium text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border border-red-100">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchWishlist}
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border border-gray-100">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save products you love and find them here later.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Wishlist Products ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Wishlist ❤️</h1>
          <p className="mt-1 text-gray-500 text-lg">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removing}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
