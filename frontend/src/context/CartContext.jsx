import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children, isLoggedIn }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  // Track specific product action in progress (e.g. adding, updating qty, removing)
  const [mutatingItemId, setMutatingItemId] = useState(null);

  // Fetch cart from backend
  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      setCartError(null);
      const res = await api.get('/cart');
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // If 401, not logged in
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setCartError(err.response?.data?.message || 'Unable to load your cart.');
      }
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn]);

  // Load cart whenever login status becomes true
  useEffect(() => {
    if (isLoggedIn) {
      refreshCart();
    } else {
      setCartItems([]);
      setCartError(null);
    }
  }, [isLoggedIn, refreshCart]);

  // Add product to cart (or increment quantity)
  const addToCart = async (productId) => {
    try {
      setMutatingItemId(productId);
      const res = await api.post(`/cart/${productId}`);
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true, message: res.data.message || 'Added to cart' };
      }
      return { success: false, message: 'Could not update cart' };
    } catch (err) {
      console.error('Add to cart error:', err);
      const message = err.response?.data?.message || 'Failed to add item to cart.';
      return { success: false, message, status: err.response?.status };
    } finally {
      setMutatingItemId(null);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return { success: false, message: 'Quantity must be at least 1' };
    try {
      setMutatingItemId(productId);
      const res = await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true, message: res.data.message || 'Quantity updated' };
      }
      return { success: false, message: 'Could not update quantity' };
    } catch (err) {
      console.error('Update quantity error:', err);
      const message = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, message, status: err.response?.status };
    } finally {
      setMutatingItemId(null);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setMutatingItemId(productId);
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        return { success: true, message: res.data.message || 'Item removed from cart' };
      }
      return { success: false, message: 'Could not remove item' };
    } catch (err) {
      console.error('Remove from cart error:', err);
      const message = err.response?.data?.message || 'Failed to remove item from cart.';
      return { success: false, message, status: err.response?.status };
    } finally {
      setMutatingItemId(null);
    }
  };

  // Derived values
  // cartCount = Total number of units (e.g. 2 keyboards + 1 mouse = 3)
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [cartItems]);

  // subtotal = Sum of (price * quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  // Total unique product lines
  const uniqueItemsCount = cartItems.length;

  // Helper: check if a product is in cart
  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((i) => (i.product?._id || i.product) === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const isItemInCart = useCallback(
    (productId) => {
      return cartItems.some((i) => (i.product?._id || i.product) === productId);
    },
    [cartItems]
  );

  const value = {
    cartItems,
    cartLoading,
    cartError,
    mutatingItemId,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    cartCount,
    subtotal,
    uniqueItemsCount,
    getItemQuantity,
    isItemInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
