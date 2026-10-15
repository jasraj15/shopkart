/**
 * Dynamically loads the Razorpay checkout script into the document.
 * Returns a promise that resolves to true if loaded, false otherwise.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded in window
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('Failed to load official Razorpay SDK script (possibly offline or blocked).');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
