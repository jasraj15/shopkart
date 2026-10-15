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

  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, cartLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setErrorMessage(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Enter full name';
    const cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) errors.phone = 'Enter valid 10-digit number';
    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Enter address line';
    if (!formData.city.trim()) errors.city = 'Enter city';
    if (!formData.state.trim()) errors.state = 'Enter state';
    const pin = formData.pincode.trim();
    if (!pin || !/^\d{6}$/.test(pin)) errors.pincode = 'Enter 6-digit PIN';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerifyPayment = async (verificationPayload) => {
    try {
      const verifyRes = await api.post('/orders/verify-payment', verificationPayload);
      if (verifyRes.data.success) {
        await refreshCart();
        navigate(`/order-success/${verificationPayload.shopKartOrderId}`, { replace: true });
      } else {
        setErrorMessage(verifyRes.data.message || 'Payment verification failed.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setErrorMessage(err.response?.data?.message || 'Payment verification failed.');
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
      const isLoaded = await loadRazorpayScript();

      if (isLoaded && window.Razorpay) {
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'ShopKart Drops',
          description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
          order_id: razorpayOrderId.startsWith('order_test_') ? undefined : razorpayOrderId,
          handler: async function (response) {
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
            color: '#84cc16',
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setErrorMessage('Payment cancelled. Your bag has been preserved.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setSubmitting(false);
          setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction unsuccessful'}.`);
        });
        rzp.open();
      } else {
        setTestModalData({ shopKartOrderId, razorpayOrderId, amount });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setSubmitting(false);
      setErrorMessage(err.response?.data?.message || 'Unable to initiate checkout.');
    }
  };

  const handleSimulatePayment = async (success) => {
    if (!testModalData) return;
    if (!success) {
      setTestModalData(null);
      setSubmitting(false);
      setErrorMessage('Payment cancelled.');
      return;
    }

    const testPaymentId = 'pay_test_' + Date.now();
    try {
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
      console.error(e);
      setErrorMessage('Failed to simulate signature verification.');
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#252e3b] border-t-[#84cc16] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Securing checkout gateway...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs font-bold text-gray-400 flex items-center gap-2">
        <Link to="/cart" className="hover:text-white">Bag</Link>
        <span>›</span>
        <span className="text-[#84cc16]">Checkout</span>
      </div>

      <div className="mb-8">
        <span className="badge-olive px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2 inline-block">
          Step 2 of 2
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Dispatch Address & Payment
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800 rounded-2xl text-red-300 text-xs flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 3D Form Card */}
        <div className="lg:col-span-7">
          <div className="bento-3d p-6 sm:p-8">
            <h2 className="text-base font-black text-white mb-6 pb-3 border-b border-[#232d3b] flex items-center gap-2">
              <span>📍</span> Delivery Credentials
            </h2>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Jasraj Singh"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                    formErrors.fullName ? 'border-red-500' : 'border-[#232d3b]'
                  }`}
                />
                {formErrors.fullName && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  maxLength="10"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                    formErrors.phone ? 'border-red-500' : 'border-[#232d3b]'
                  }`}
                />
                {formErrors.phone && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">
                  Street Address (House no., Apartment, Landmark)
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Flat/House No., Street address"
                  className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                    formErrors.addressLine1 ? 'border-red-500' : 'border-[#232d3b]'
                  }`}
                />
                {formErrors.addressLine1 && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.addressLine1}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                      formErrors.city ? 'border-red-500' : 'border-[#232d3b]'
                    }`}
                  />
                  {formErrors.city && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                      formErrors.state ? 'border-red-500' : 'border-[#232d3b]'
                    }`}
                  />
                  {formErrors.state && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-1.5">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    maxLength="6"
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#090b0f] border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#84cc16] shadow-inner ${
                      formErrors.pincode ? 'border-red-500' : 'border-[#232d3b]'
                    }`}
                  />
                  {formErrors.pincode && <p className="mt-1 text-xs text-red-400 font-bold">{formErrors.pincode}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 text-sm font-black btn-3d-olive shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? 'Connecting Razorpay...' : `Confirm & Pay ₹${subtotal.toLocaleString('en-IN')} ⚡`}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Summary Box */}
        <div className="lg:col-span-5">
          <div className="bento-3d p-6 sticky top-28 shadow-xl">
            <h2 className="text-base font-black text-white pb-3 mb-4 border-b border-[#232d3b]">
              Summary ({cartCount} pieces)
            </h2>

            <div className="divide-y divide-[#1c232d] max-h-60 overflow-y-auto mb-4 pr-1">
              {cartItems.map((item) => (
                <div key={item.product?._id} className="py-2.5 flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#12161f] rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center border border-[#232d3b]">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.product?.name}</p>
                    <p className="text-[11px] text-[#84cc16]">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-xs font-black text-white">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-gray-300 pt-3 border-t border-[#232d3b]">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-[#84cc16] font-bold">FREE 24H</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#232d3b] text-sm font-black text-white">
                <span>Total Payable:</span>
                <span className="text-xl text-olive-gradient">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {testModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bento-3d max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#1e2816] text-[#84cc16] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-[#3b5025]">
              💳
            </div>
            <h3 className="text-xl font-black text-white mb-1">Razorpay Sandbox Vault</h3>
            <p className="text-xs text-gray-400 mb-4">Order Ref: {testModalData.razorpayOrderId}</p>
            <div className="text-3xl font-black text-olive-gradient mb-6">
              ₹{(testModalData.amount / 100).toLocaleString('en-IN')}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSimulatePayment(false)}
                className="btn-3d-dark flex-1 py-3 text-xs"
              >
                Simulate Fail
              </button>
              <button
                onClick={() => handleSimulatePayment(true)}
                className="btn-3d-olive flex-1 py-3 text-xs"
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
