import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Home = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setIsLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Opening account hub...</p>
      </div>
    );
  }

  const firstName = customer?.fullName?.split(' ')[0] || 'Member';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 3D Profile Header Box */}
      <div className="bento-3d p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="text-center sm:text-left">
          <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 inline-block">
            VIP Collector
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-olive-gradient">{firstName}</span> ⚡
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md">
            Your personal drop terminal. Track pending dispatches, access saved grails, and manage your account.
          </p>
        </div>

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] flex items-center justify-center font-black text-black text-3xl shadow-[0_6px_0_#2b3a1a]">
          {customer?.fullName?.charAt(0) || 'S'}
        </div>
      </div>

      {/* 3D Bento Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link
          to="/orders"
          className="bento-3d p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#151a23] border border-[#232d3b] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-[0_3px_0_#0d1117]">
            📦
          </div>
          <h3 className="text-base font-black text-white group-hover:text-[#bef264] transition-colors">
            Order Vault
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Track active shipments, verify transaction IDs, and inspect past hauls.
          </p>
        </Link>

        <Link
          to="/wishlist"
          className="bento-3d p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#151a23] border border-[#232d3b] flex items-center justify-center text-2xl mb-4 text-red-400 group-hover:scale-110 transition-transform shadow-[0_3px_0_#0d1117]">
            ♥
          </div>
          <h3 className="text-base font-black text-white group-hover:text-red-300 transition-colors">
            Saved Moodboard
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Access grails you saved from catalog releases. 1-click move to bag.
          </p>
        </Link>

        <Link
          to="/products"
          className="bento-3d p-6 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#151a23] border border-[#232d3b] flex items-center justify-center text-2xl mb-4 text-[#84cc16] group-hover:scale-110 transition-transform shadow-[0_3px_0_#0d1117]">
            ⚡
          </div>
          <h3 className="text-base font-black text-white group-hover:text-[#bef264] transition-colors">
            Browse All Drops
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Explore 41+ pieces across Streetwear, Tech, Studio, Fragrance & Gear.
          </p>
        </Link>
      </div>

      {/* Account Info Details */}
      <div className="bento-3d p-6 sm:p-8">
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-300 mb-4 pb-3 border-b border-[#232d3b]">
          Verified Credentials
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#090b0f] border border-[#232d3b]">
            <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Full Name</span>
            <p className="text-sm font-bold text-white">{customer?.fullName}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#090b0f] border border-[#232d3b]">
            <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Email Address</span>
            <p className="text-sm font-bold text-white">{customer?.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#090b0f] border border-[#232d3b]">
            <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Mobile Phone</span>
            <p className="text-sm font-bold text-white">{customer?.phone}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#090b0f] border border-[#232d3b]">
            <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Account Tier</span>
            <p className="text-sm font-bold text-[#84cc16]">● Active VIP Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
