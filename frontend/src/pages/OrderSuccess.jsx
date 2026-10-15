import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Generating digital receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bento-3d p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
        
        {/* Animated 3D Checkmark */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#84cc16] to-[#4d7c0f] text-black text-3xl font-black flex items-center justify-center mx-auto mb-6 shadow-[0_6px_0_#2b3a1a] animate-spring">
          ✓
        </div>

        <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 inline-block">
          ⚡ Payment Cryptographically Verified
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          Haul Locked & Secured! 🎉
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mb-8 max-w-md mx-auto">
          Your order has been recorded into our fulfillment pipeline. Order ID: <span className="font-mono text-[#bef264]">{id}</span>
        </p>

        {order && (
          <div className="p-6 rounded-2xl bg-[#090b0f] border border-[#232d3b] text-left mb-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Shipment Contents
            </h3>
            <div className="divide-y divide-[#1c232d]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="text-white font-bold">
                    {item.name} <span className="text-[#84cc16]">× {item.quantity}</span>
                  </span>
                  <span className="font-black text-white">
                    ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1c232d] flex justify-between items-baseline text-sm">
              <span className="font-bold text-gray-300">Total Settled:</span>
              <span className="text-2xl font-black text-olive-gradient">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/orders"
            className="btn-3d-olive px-8 py-3 text-xs font-black"
          >
            Track in Order Vault
          </Link>
          <Link
            to="/products"
            className="btn-3d-dark px-8 py-3 text-xs font-bold"
          >
            Explore More Drops
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
