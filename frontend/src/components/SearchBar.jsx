import React from 'react';

const SearchBar = ({ search, setSearch, category, setCategory, categories }) => {
  return (
    <div className="bg-[#151c28] border border-[#243044] rounded-xl p-3 sm:p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by brand, keyword or model..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f17] border border-[#243044] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="md:w-64">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0b0f17] border border-[#243044] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] cursor-pointer"
        >
          <option value="All Categories">All Departments</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
