import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/customers/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/products" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] flex items-center justify-center font-black text-black text-xl shadow-[0_4px_0_#2b3a1a]">
              ⚡
            </div>
            <span className="font-black text-3xl tracking-tight text-white">
              SHOP<span className="text-[#84cc16]">KART</span>
            </span>
          </Link>
        </div>

        {/* 3D Register Card */}
        <div className="bento-3d p-8 shadow-2xl">
          <span className="badge-olive px-2.5 py-0.5 rounded text-[10px] font-black uppercase mb-2 inline-block">
            New Member
          </span>
          <h1 className="text-2xl font-black text-white mb-6">Join ShopKart</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Jasraj Singh"
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border border-[#232d3b] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border border-[#232d3b] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border border-[#232d3b] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border border-[#232d3b] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 text-xs font-black btn-3d-olive shadow-xl mt-4 cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account ⚡'}
            </button>
          </form>

          <div className="border-t border-[#1c232d] mt-6 pt-5 text-center text-xs text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="text-[#84cc16] hover:underline font-bold">
              Sign in ›
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
