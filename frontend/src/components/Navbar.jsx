import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, subtotal } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
      setIsLoggedIn(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e2e6f0] shadow-sm">
      {/* ── Main Top Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo with 3D Tactile Styling */}
          <Link to="/products" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e78f0] to-[#3232a0] flex items-center justify-center font-black text-white text-xl shadow-[0_4px_0_#1f1f7a] group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-[#1a1d2e] flex items-center">
                SHOP<span className="text-[#6069ef]">KART</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#6069ef] font-bold -mt-1">
                Curated Drops
              </span>
            </div>
          </Link>

          {/* 3D Search Input */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search kicks, tech, audio, room aesthetic..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-[#f0f4ff] text-[#1a1d2e] pl-11 pr-4 py-2.5 rounded-xl border border-[#dde4f8] focus:outline-none focus:border-[#6069ef] focus:ring-1 focus:ring-[#6069ef] text-sm shadow-[inset_0_2px_4px_rgba(96,105,239,0.07)] placeholder-slate-400 transition-all"
              />
              <span className="absolute left-3.5 top-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </form>

          {/* Right Action 3D Boxes */}
          <div className="flex items-center gap-3">
            
            {/* Wishlist 3D Button */}
            <Link
              to="/wishlist"
              className="btn-3d-dark px-3.5 py-2 flex items-center gap-2 text-xs font-bold"
              title="View Wishlist"
            >
              <span className="text-[#e55a8a] text-sm">♥</span>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {/* Cart 3D Button */}
            <Link
              to="/cart"
              className="btn-3d-olive px-4 py-2 flex items-center gap-2 text-xs font-black"
              title="View Cart"
            >
              <span>🛍️ Bag</span>
              <span className="bg-white text-[#4a4cdf] px-1.5 py-0.5 rounded-md text-[11px] font-black min-w-[20px] text-center">
                {cartCount}
              </span>
            </Link>

            {/* Account Profile / Login */}
            {isLoggedIn ? (
              <div className="relative group">
                <Link
                  to="/home"
                  className="btn-3d-dark px-3.5 py-2 flex items-center gap-1.5 text-xs font-bold"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6069ef] animate-pulse"></span>
                  <span className="hidden sm:inline">Account</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </Link>

                <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                  <div className="w-44 bg-white border border-[#e2e6f0] rounded-xl shadow-xl p-2 text-xs text-slate-700 space-y-1">
                    <Link to="/home" className="block px-3 py-2 rounded-lg hover:bg-[#f0f4ff] hover:text-[#4a4cdf]">Profile Hub</Link>
                    <Link to="/orders" className="block px-3 py-2 rounded-lg hover:bg-[#f0f4ff] hover:text-[#4a4cdf]">Order Vault</Link>
                    <Link to="/wishlist" className="block px-3 py-2 rounded-lg hover:bg-[#f0f4ff] hover:text-[#4a4cdf]">Saved Moodboard</Link>
                    <div className="border-t border-[#e2e6f0] my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-3d-white px-4 py-2 text-xs font-black"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg bg-[#f0f4ff] border border-[#dde4f8] text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#e2e6f0] p-4 text-xs space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="flex-1 bg-[#f0f4ff] text-[#1a1d2e] px-3 py-2 rounded-lg border border-[#dde4f8] focus:outline-none focus:border-[#6069ef]"
            />
            <button type="submit" className="btn-3d-olive px-4 py-2">Go</button>
          </form>

          <Link to="/products" onClick={() => setMobileOpen(false)} className="block py-2 text-[#1a1d2e] font-bold">Explore All Drops</Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-500">Saved Wishlist</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-500">Bag ({cartCount})</Link>
          <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-500">Order Vault</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-500">Sign Out</button>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-[#6069ef] font-bold">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
