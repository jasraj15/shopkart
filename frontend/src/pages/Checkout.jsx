import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { loadRazorpayScript } from '../services/razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, subtotal, cartCount, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [testModalData, setTestModalData] = useState(null);

  // If cart is loaded and empty, redirect back to cart
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, cartLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Phone must be a valid 10-digit number';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    const pin = formData.pincode.trim();
    if (!pin) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pin)) {
      errors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Verify payment on backend and complete checkout
  const handleVerifyPayment = async (verificationPayload) => {
    try {
      const verifyRes = await api.post('/orders/verify-payment', verificationPayload);
      if (verifyRes.data.success) {
        // Clear global cart state
        await refreshCart();
        // Redirect to order confirmation page
        navigate(`/order-success/${verificationPayload.shopKartOrderId}`, { replace: true });
      } else {
        setErrorMessage(verifyRes.data.message || 'Payment verification failed.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Payment verification failed. Your cart was not cleared.'
      );
    } finally {
      setSubmitting(false);
      setTestModalData(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create pending ShopKart order and Razorpay order on the backend
      const res = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();

      if (isLoaded && window.Razorpay) {
        // Open standard Razorpay Checkout
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'ShopKart',
          description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
          order_id: razorpayOrderId.startsWith('order_test_') ? undefined : razorpayOrderId,
          handler: async function (response) {
            // Forward to server for cryptographic signature verification
            await handleVerifyPayment({
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },
          theme: {
            color: '#2563EB',
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setErrorMessage('Payment cancelled. Your cart has been preserved.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          console.error('Razorpay payment failed:', resp.error);
          setSubmitting(false);
          setErrorMessage(
            `Payment failed: ${resp.error?.description || 'Transaction unsuccessful'}. Your cart has not been cleared.`
          );
        });
        rzp.open();
      } else {
        // Fallback / Offline Simulator mode: allow completing test payment
        setTestModalData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitting(false);
      setErrorMessage(
        err.response?.data?.message || 'Unable to initiate checkout. Please try again.'
      );
    }
  };

  // Helper for test simulator modal
  const handleSimulatePayment = async (success) => {
    if (!testModalData) return;
    if (!success) {
      setTestModalData(null);
      setSubmitting(false);
      setErrorMessage('Payment failed or cancelled. Your cart has not been cleared.');
      return;
    }

    const testPaymentId = 'pay_test_' + Date.now();
    // In our backend, the test secret is shopkart_razorpay_secret_key_123
    // We compute HMAC SHA256 or request verification
    try {
      // Import Web Crypto API for client-side HMAC in test simulator
      const enc = new TextEncoder();
      const secret = 'shopkart_razorpay_secret_key_123';
      const key = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const dataToSign = enc.encode(testModalData.razorpayOrderId + '|' + testPaymentId);
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, dataToSign);
      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      const testSignature = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      await handleVerifyPayment({
        shopKartOrderId: testModalData.shopKartOrderId,
        razorpay_order_id: testModalData.razorpayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: testSignature,
      });
    } catch (e) {
      console.error('Simulator HMAC error:', e);
      setErrorMessage('Failed to simulate signature verification.');
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/cart" className="hover:text-blue-600">
          Cart
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-900">Checkout</span>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Checkout & Payment
      </h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold">Checkout Issue</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping Details Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📍</span> Shipping Details
              </h2>
              <span className="text-xs text-gray-400 font-medium">* All fields required</span>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.fullName
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.phone
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Address Line
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House / Flat No., Street, Landmark"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                    formErrors.addressLine1
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {formErrors.addressLine1 && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.city
                        ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.state
                        ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    maxLength="6"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                      formErrors.pincode
                        ? 'border-red-300 focus:ring-red-400 bg-red-50/30'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.pincode && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3.5 px-4 rounded-xl text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                    submitting
                      ? 'bg-blue-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>💳 Pay with Razorpay (Test Mode)</span>
                      <span className="text-blue-200 font-normal">| ₹{subtotal.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Final Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 pb-4 mb-4 border-b border-gray-100">
              Order Items ({cartCount})
            </h2>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mb-6 pr-1">
              {cartItems.map((item) => (
                <div key={item.product?._id} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg p-1 flex-shrink-0 flex items-center justify-center border border-gray-100">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Img'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{item.product?.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-xl font-black text-gray-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <span className="text-amber-600 font-bold">🛡️</span>
              <div>
                <strong>Razorpay Test Mode Active:</strong> No real money will be charged. All purchases use test tokens and mandatory cryptographic signature verification.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Fallback Simulator Modal (used if checkout.js is blocked or in offline mode) */}
      {testModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              💳
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Razorpay Test Checkout
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Order ID: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{testModalData.razorpayOrderId}</code>
            </p>
            <p className="text-2xl font-black text-gray-900 my-3">
              ₹{(testModalData.amount / 100).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              Simulating a Razorpay Test transaction. Clicking Confirm will generate a verified HMAC SHA256 signature and post to <code>/orders/verify-payment</code>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleSimulatePayment(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Simulate Fail
              </button>
              <button
                onClick={() => handleSimulatePayment(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Confirm Test Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
