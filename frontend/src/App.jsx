import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import api from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check initial login status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/customers/me');
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0b0f17]">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-[#f59e0b] rounded-full animate-spin mb-4"></div>
        <div className="text-white font-black text-xl tracking-tight">
          Shop<span className="text-[#f59e0b]">Kart</span>
          <span className="text-xs text-gray-400 font-normal">.in</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <CartProvider isLoggedIn={isLoggedIn}>
        <div className="min-h-screen bg-[#0b0f17] font-sans text-gray-100 flex flex-col">
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              
              <Route 
                path="/register" 
                element={isLoggedIn ? <Navigate to="/products" replace /> : <Register />} 
              />
              
              <Route 
                path="/login" 
                element={isLoggedIn ? <Navigate to="/products" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />} 
              />
              
              <Route 
                path="/home" 
                element={isLoggedIn ? <Home setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" replace />} 
              />

              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />

              <Route 
                path="/wishlist" 
                element={isLoggedIn ? <Wishlist /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/cart" 
                element={isLoggedIn ? <Cart /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/checkout" 
                element={isLoggedIn ? <Checkout /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/order-success/:id" 
                element={isLoggedIn ? <OrderSuccess /> : <Navigate to="/login" replace />} 
              />

              <Route 
                path="/orders" 
                element={isLoggedIn ? <Orders /> : <Navigate to="/login" replace />} 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>

          {/* Modern 3D Tactile Footer */}
          <footer className="mt-20 bg-[#08090c] border-t border-[#1c232d] text-xs text-gray-400">
            {/* 3D Back to top button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
              <button
                onClick={scrollToTop}
                className="btn-3d-dark px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
              >
                <span>↑ Back to top</span>
                <span className="text-[#84cc16]">⚡</span>
              </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#141a22]">
              <div>
                <h4 className="font-black text-white mb-3 text-xs uppercase tracking-wider">The Drop Terminal</h4>
                <ul className="space-y-2 text-xs">
                  <li className="hover:text-white cursor-pointer">About ShopKart</li>
                  <li className="hover:text-white cursor-pointer">Release Calendar</li>
                  <li className="hover:text-white cursor-pointer">Verified Authenticity</li>
                  <li className="hover:text-white cursor-pointer">Creator Collabs</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-white mb-3 text-xs uppercase tracking-wider">Community & Vibe</h4>
                <ul className="space-y-2 text-xs">
                  <li className="hover:text-white cursor-pointer">Discord Channel</li>
                  <li className="hover:text-white cursor-pointer">Instagram (@shopkart)</li>
                  <li className="hover:text-white cursor-pointer">X / Twitter Drops</li>
                  <li className="hover:text-white cursor-pointer">TikTok Showcase</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-white mb-3 text-xs uppercase tracking-wider">Customer Care</h4>
                <ul className="space-y-2 text-xs">
                  <li className="hover:text-white cursor-pointer">Track Shipment</li>
                  <li className="hover:text-white cursor-pointer">7-Day Free Returns</li>
                  <li className="hover:text-white cursor-pointer">Razorpay Protection</li>
                  <li className="hover:text-white cursor-pointer">FAQ & Help Desk</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-white mb-3 text-xs uppercase tracking-wider">Weekly Grails</h4>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                  Join 40,000+ collectors receiving secret restock drops and private coupons.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email..."
                    className="bg-[#11161e] border border-[#232c3a] px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#84cc16] flex-1"
                  />
                  <button className="btn-3d-olive px-3 py-2 text-xs font-black">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#141a22] py-6 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2 mb-2 font-black text-white text-base">
                <span className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
                <span>SHOP<span className="text-[#84cc16]">KART</span></span>
              </div>
              <p className="text-[11px]">
                Built for collectors, creators, and modern essentials. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
