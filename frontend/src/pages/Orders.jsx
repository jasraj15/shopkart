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

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-10 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to load orders.</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            📦
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            You have not placed any orders yet.
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
            Once you complete checkout with Razorpay, your order history and tracking updates will appear right here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 4. Orders List
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
        <Link
          to="/products"
          className="mt-3 sm:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Browse More Products →
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
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-bold tracking-wider">
                      Order Placed
                    </span>
                    <span className="font-semibold text-gray-800">{dateStr}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block uppercase font-bold tracking-wider">
                      Total
                    </span>
                    <span className="font-bold text-gray-900">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 hidden sm:inline">
                    #{order._id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {order.status || 'PLACED'} • {order.paymentStatus || 'PAID'}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      {item.image && (
                        <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 flex-shrink-0 flex items-center justify-center border border-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Img'; }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900">
                          ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address Details */}
                {order.shippingAddress && (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                    <div>
                      <span className="font-bold text-gray-700">Delivered to: </span>
                      {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </div>
                    {order.razorpayPaymentId && (
                      <div className="font-mono text-gray-400">
                        Txn: {order.razorpayPaymentId}
                      </div>
                    )}
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
