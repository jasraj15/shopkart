import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'Streetwear & Kicks',
  'Tech & Gaming',
  'Room & Studio',
  'Fragrance & Care',
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Sports & Fitness',
  'Books'
];

const ProductSkeleton = () => (
  <div className="card-3d rounded-2xl p-4 flex flex-col h-[400px] animate-pulse">
    <div className="h-52 rounded-xl bg-[#161c24] mb-4"></div>
    <div className="h-3 w-1/4 rounded bg-[#161c24] mb-2"></div>
    <div className="h-5 w-3/4 rounded bg-[#161c24] mb-2"></div>
    <div className="h-3 w-1/2 rounded bg-[#161c24] mb-4"></div>
    <div className="h-6 w-1/3 rounded bg-[#161c24] mb-auto"></div>
    <div className="h-10 rounded-xl bg-[#161c24] mt-4"></div>
  </div>
);

const Products = () => {
  const navigate = useNavigate();
  const { cartCount, subtotal } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All Drops';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const urlCat = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    if (urlCat) setCategory(urlCat);
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append('search', search.trim());
      if (category !== 'All Drops' && category !== 'All Categories') queryParams.append('category', category);
      
      const response = await api.get(`/products?${queryParams.toString()}`);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Unable to load drops. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, sortBy, inStockOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ── 3D Bento Box Interactive Hub (Clickable shopping boxes) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        
        {/* Box 1: Drop Vault (Clickable Catalog Box) */}
        <div
          onClick={() => {
            setCategory('All Drops');
            setSearchParams({});
          }}
          className="bento-3d p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="badge-olive px-3 py-1 rounded-full text-[10px] uppercase">
              ⚡ Live Vault
            </span>
            <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white group-hover:text-[#bef264] transition-colors tracking-tight">
              Curated Catalog
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Browse {products.length} exclusive drops from Tokyo, NYC & London streetwear to audio setups.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#232d3b] flex items-center justify-between text-xs font-bold text-[#84cc16]">
            <span>Explore All Pieces</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Box 2: 3D Wishlist Moodboard Box (Clickable Wishlist Box) */}
        <Link
          to="/wishlist"
          className="bento-3d p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#f87171] px-3 py-1 rounded-full text-[10px] font-black uppercase">
              ♥ Moodboard
            </span>
            <span className="text-2xl group-hover:scale-120 transition-transform text-[#ef4444]">❤️</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white group-hover:text-red-300 transition-colors tracking-tight">
              Saved Wishlist
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Keep your grails saved in one interactive board. Move items directly to bag with 1 click.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#232d3b] flex items-center justify-between text-xs font-bold text-red-400">
            <span>Open Saved Items</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Box 3: 3D Cart Haul Box (Clickable Cart Box) */}
        <Link
          to="/cart"
          className="bento-3d p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden border-[#84cc16]/40"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="bg-[#84cc16]/20 border border-[#84cc16]/40 text-[#a3e635] px-3 py-1 rounded-full text-[10px] font-black uppercase">
              🛍️ Active Bag
            </span>
            <span className="bg-[#84cc16] text-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
              {cartCount} items
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white group-hover:text-[#bef264] transition-colors tracking-tight">
              Express Bag
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Current Subtotal: <strong className="text-white text-sm">₹{subtotal.toLocaleString('en-IN')}</strong>. Free express dispatch enabled.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#232d3b] flex items-center justify-between text-xs font-bold text-[#84cc16]">
            <span>Proceed to Checkout</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>

      {/* ── 3D Tactile Department Pills ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-400">
            Select Category Filter
          </span>
          {category !== 'All Drops' && (
            <button
              onClick={() => { setCategory('All Drops'); setSearchParams({}); }}
              className="text-[#84cc16] hover:underline font-bold"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar">
          <button
            onClick={() => {
              setCategory('All Drops');
              setSearchParams({});
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              category === 'All Drops' || category === 'All Categories'
                ? 'btn-3d-olive'
                : 'btn-3d-dark text-gray-300'
            }`}
          >
            🔥 All Drops
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSearchParams({ category: cat });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                category === cat
                  ? 'btn-3d-olive'
                  : 'btn-3d-dark text-gray-300'
              }`}
            >
              {cat === 'Streetwear & Kicks' && '👟 '}
              {cat === 'Tech & Gaming' && '🎮 '}
              {cat === 'Room & Studio' && '🪴 '}
              {cat === 'Fragrance & Care' && '✨ '}
              {cat === 'Electronics' && '⚡ '}
              {cat === 'Clothing' && '👕 '}
              {cat === 'Home & Kitchen' && '🏡 '}
              {cat === 'Sports & Fitness' && '🏃 '}
              {cat === 'Books' && '📚 '}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subheader: Results count & Sort control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#1c232d] text-xs">
        <div className="text-gray-300">
          Showing <span className="font-bold text-[#84cc16]">{sortedProducts.length}</span> pieces in{' '}
          <strong className="text-white">"{category}"</strong>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[#84cc16] rounded"
            />
            <span className="text-xs font-semibold">In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#11161e] border border-[#232c3a] rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-[#84cc16]"
            >
              <option value="featured">Featured Drops</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bento-3d p-8 text-center max-w-lg mx-auto">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-white mb-2">Error loading drops</h3>
          <p className="text-gray-400 text-xs mb-4">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="btn-3d-olive px-6 py-2.5 text-xs"
          >
            Retry Fetch
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bento-3d p-12 text-center max-w-lg mx-auto">
          <div className="text-4xl mb-3 animate-float-3d">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">No vibe matches found</h3>
          <p className="text-gray-400 text-xs mb-6">
            We couldn't find any drops matching "{search || category}". Try resetting filters or search something else.
          </p>
          <button 
            onClick={() => { setSearch(''); setCategory('All Drops'); setSearchParams({}); }} 
            className="btn-3d-olive px-6 py-2.5 text-xs"
          >
            Reset Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
