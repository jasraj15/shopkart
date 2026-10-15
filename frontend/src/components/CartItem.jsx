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
    <div className={`p-5 card-3d rounded-2xl transition-all ${
      isMutating ? 'opacity-50 pointer-events-none' : ''
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Product Image Frame with 3D Depth */}
        <Link 
          to={`/products/${product._id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#12161f] rounded-xl p-2.5 flex items-center justify-center overflow-hidden border border-[#232d3b] shadow-inner"
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain drop-shadow"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=ShopKart'; }}
          />
        </Link>

        {/* Product Information */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#84cc16]">
                {product.category || 'Drop'}
              </span>
              <Link to={`/products/${product._id}`}>
                <h3 className="text-sm sm:text-base font-bold text-white hover:text-[#bef264] transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-xs mt-1 text-gray-400">
                <span className="text-[#84cc16] font-bold">● Ready for Dispatch</span>
                <span>•</span>
                <span>Express Courier</span>
              </div>
            </div>

            <div className="text-left sm:text-right mt-1 sm:mt-0">
              <span className="text-base sm:text-lg font-black text-white">
                ₹{itemTotal.toLocaleString('en-IN')}
              </span>
              <p className="text-[11px] text-gray-400">
                ₹{product.price.toLocaleString('en-IN')} each
              </p>
            </div>
          </div>

          {/* 3D Stepper Controls & Delete Action */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#1c232d]">
            {/* 3D Stepper */}
            <div className="flex items-center bg-[#090b0f] border border-[#232d3b] rounded-xl overflow-hidden shadow-inner">
              <button
                onClick={handleDecrease}
                disabled={isMinQuantity || isMutating}
                className="px-3 py-1.5 text-gray-300 hover:bg-[#161c24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-black cursor-pointer"
              >
                −
              </button>
              <span className="px-3 py-1.5 text-xs font-black text-white min-w-[36px] text-center bg-[#10141a]">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                disabled={isMaxQuantity || isMutating}
                className="px-3 py-1.5 text-gray-300 hover:bg-[#161c24] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-black cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Remove Action */}
            <button
              onClick={handleRemove}
              disabled={isMutating}
              className="text-xs font-bold text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
            >
              Remove
            </button>

            <span className="text-gray-600 text-xs">|</span>

            <Link
              to={`/products/${product._id}`}
              className="text-xs text-[#84cc16] hover:underline transition-colors font-bold"
            >
              View specs ›
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
