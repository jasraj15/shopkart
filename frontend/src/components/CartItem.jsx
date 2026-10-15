import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, mutatingItemId } = useCart();
  const product = item.product;

  if (!product) return null;

  const isMutating = mutatingItemId === product._id;
  const isMinQuantity = item.quantity <= 1;
  const isMaxQuantity = item.quantity >= product.stock;

  const handleDecrease = () => {
    if (isMinQuantity || isMutating) return;
    updateQuantity(product._id, item.quantity - 1);
  };

  const handleIncrease = () => {
    if (isMaxQuantity || isMutating) return;
    updateQuantity(product._id, item.quantity + 1);
  };

  const handleRemove = () => {
    if (isMutating) return;
    removeFromCart(product._id);
  };

  const itemTotal = (product.price || 0) * (item.quantity || 1);

  return (
    <div className={`p-4 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 ${
      isMutating ? 'opacity-60 pointer-events-none' : 'hover:shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Product Image */}
        <Link 
          to={`/products/${product._id}`}
          className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 overflow-hidden group"
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {product.category || 'Product'}
              </span>
              <Link to={`/products/${product._id}`}>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
            </div>
            
            {/* Line Item Total */}
            <div className="text-right sm:text-right">
              <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                ₹{itemTotal.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-gray-500">
                ₹{product.price.toLocaleString('en-IN')} each
              </p>
            </div>
          </div>

          {/* Stock limit warning if applicable */}
          <div className="mt-2 text-xs">
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="text-orange-600 font-medium">
                ⚠️ Only {product.stock} left in stock
              </span>
            ) : product.stock === 0 ? (
              <span className="text-red-600 font-medium">
                ❌ Out of stock
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                ✓ In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* Controls: Quantity [-] Qty [+] and [Remove] */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 mr-1">Qty:</span>
              <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={isMinQuantity || isMutating}
                  title={isMinQuantity ? "Quantity cannot be less than 1 (use Remove button)" : "Decrease quantity"}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-base"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold text-gray-900 bg-white py-1">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={isMaxQuantity || isMutating}
                  title={isMaxQuantity ? `Cannot exceed stock limit of ${product.stock}` : "Increase quantity"}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-base"
                >
                  +
                </button>
              </div>

              {isMaxQuantity && (
                <span className="text-xs text-amber-600 font-medium ml-2">
                  Max stock reached
                </span>
              )}
            </div>

            {/* Remove Action */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={isMutating}
              className="inline-flex items-center text-sm text-red-500 hover:text-red-700 font-medium transition-colors p-1 hover:bg-red-50 rounded"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
