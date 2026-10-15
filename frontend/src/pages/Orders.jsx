import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Opening order vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-8">
          <h2 className="text-lg font-bold text-white mb-2">{error}</h2>
          <button onClick={fetchOrders} className="btn-3d-olive px-6 py-2 text-xs mt-3">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bento-3d p-12 shadow-2xl">
          <div className="w-20 h-20 bg-[#161c24] text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_4px_0_#0f141a]">
            📦
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            No Orders in Vault
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Your haul history will appear here once you complete checkout with Razorpay.
          </p>
          <Link to="/products" className="btn-3d-olive px-8 py-3 text-xs font-black inline-block">
            Start Exploring Drops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-6 mb-8 border-b border-[#1c232d]">
        <div>
          <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 inline-block">
            Archived Deliveries
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">Order Vault</h1>
          <p className="text-xs text-gray-400 mt-1">{orders.length} hauls placed & verified</p>
        </div>

        <Link to="/products" className="btn-3d-dark px-4 py-2 text-xs font-bold">
          Shop Fresh Drops ›
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={order._id}
              className="card-3d rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Top Meta Strip */}
              <div className="bg-[#12161f] px-6 py-4 border-b border-[#1c232d] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">ORDER DATE</span>
                    <span className="text-white font-bold">{dateStr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">AMOUNT</span>
                    <span className="text-[#84cc16] font-black text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {order.shippingAddress && (
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">DELIVER TO</span>
                      <span className="text-white font-medium">{order.shippingAddress.fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="badge-olive px-2.5 py-1 rounded text-[10px] font-black">
                    ● {order.status || 'VERIFIED'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="divide-y divide-[#1c232d]">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <div className="w-16 h-16 bg-[#12161f] rounded-xl p-2 flex-shrink-0 flex items-center justify-center border border-[#232d3b]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Qty: <strong className="text-white">{item.quantity}</strong> • ₹{item.price?.toLocaleString('en-IN')} each
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/products"
                        className="btn-3d-olive px-4 py-2 text-xs font-black self-end sm:self-auto"
                      >
                        Buy Again ⚡
                      </Link>
                    </div>
                  ))}
                </div>

                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-[#1c232d] text-[11px] text-gray-400">
                    <span className="font-bold text-gray-300">Destination: </span>
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
