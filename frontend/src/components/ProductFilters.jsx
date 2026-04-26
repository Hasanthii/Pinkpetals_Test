import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['All', 'Skincare', 'Toner', 'Body Care', 'Hair Care', 'Serum', 'Moisturizer', 'Cleanser', 'Oil', 'Sunscreen', 'Mask', 'Other'];

const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
];

const ProductFilters = ({ onSearch, onCategoryChange, onSortChange, activeCategory, searchQuery, sortBy }) => {
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(localSearch);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, onSearch]);

    const handleClearSearch = () => {
        setLocalSearch('');
        if (onSearch) {
            onSearch('');
        }
    };

    const handleCategoryClick = (category) => {
        if (onCategoryChange) {
            onCategoryChange(category === 'All' ? '' : category);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full text-sm pl-11 pr-10 py-3 rounded-full border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#B76E79] transition-all duration-200"
                        style={{
                            borderColor: '#f5d5d8',
                            fontFamily: 'Jost, sans-serif',
                            boxShadow: '0 2px 8px rgba(183,110,121,0.06)',
                        }}
                    />
                    {localSearch && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-pink-50 transition-colors"
                        >
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(f => !f)}
                        className="flex items-center gap-2 text-sm px-5 py-3 rounded-full border transition-all duration-200 hover:border-[#B76E79] hover:text-[#B76E79]"
                        style={{
                            borderColor: '#f5d5d8',
                            color: '#6b3040',
                            background: '#fff',
                            fontFamily: 'Jost, sans-serif',
                        }}
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                    </button>

                    <select
                        value={sortBy || 'name-asc'}
                        onChange={e => onSortChange && onSortChange(e.target.value)}
                        className="text-sm px-4 py-3 rounded-full border bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#B76E79] cursor-pointer transition-all duration-200 appearance-none pr-8"
                        style={{
                            borderColor: '#f5d5d8',
                            fontFamily: 'Jost, sans-serif',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b3040' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                        }}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {showFilters && (
                <div
                    className="p-5 rounded-2xl border"
                    style={{
                        background: '#fff',
                        borderColor: '#f5d5d8',
                        boxShadow: '0 4px 20px rgba(183,110,121,0.08)',
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-[0.15em] text-[#B76E79] mb-3"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                                    (cat === 'All' && !activeCategory) || activeCategory === cat
                                        ? 'bg-[#B76E79] text-white border-[#B76E79]'
                                        : 'bg-white text-gray-600 border-[#f5d5d8] hover:border-[#B76E79] hover:text-[#B76E79]'
                                }`}
                                style={{ fontFamily: 'Jost, sans-serif' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!showFilters && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCategoryClick('All')}
                        className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                            !activeCategory ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-white text-gray-500 border-[#f5d5d8] hover:border-[#B76E79] hover:text-[#B76E79]'
                        }`}
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        All
                    </button>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                                activeCategory === cat ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-white text-gray-500 border-[#f5d5d8] hover:border-[#B76E79] hover:text-[#B76E79]'
                            }`}
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export { SORT_OPTIONS };
export default ProductFilters;
