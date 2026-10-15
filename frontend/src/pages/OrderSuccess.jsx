import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Order created, but could not load full details.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-8 sm:p-10">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-3">
          Payment Verified
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 text-base mb-8">
          Thank you for shopping with ShopKart. Your order has been placed and payment confirmed.
        </p>

        {/* Order Info Card */}
        <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-200 text-left mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-3 border-b border-gray-200 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Order ID:</span>
              <span className="font-mono font-bold text-gray-900">{id}</span>
            </div>
            <div className="mt-2 sm:mt-0 sm:text-right">
              <span className="text-gray-500 block text-xs">Status:</span>
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                {order?.status || 'PLACED'}
              </span>
            </div>
          </div>

          {order && (
            <>
              {/* Items snapshot */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Items Purchased:
                </span>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-800">
                        {item.name} <span className="text-gray-500 font-medium">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {order.shippingAddress && (
                <div className="pt-3 border-t border-gray-200 text-xs text-gray-600">
                  <span className="font-bold text-gray-700 block mb-1">Delivering to:</span>
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
                  <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-800">Total Paid:</span>
                <span className="text-2xl font-black text-gray-900">
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            View My Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
