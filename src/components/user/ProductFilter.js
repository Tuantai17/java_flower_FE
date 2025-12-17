import React, { useState, useEffect } from 'react';
import {
    AdjustmentsHorizontalIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import categoryApi from '../../api/categoryApi';

const ProductFilter = ({
    onFilterChange,
    initialFilters = {},
    showCategoryFilter = true,
    showPriceFilter = true,
    showSortFilter = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt',
        sortDir: 'desc',
        ...initialFilters,
    });

    useEffect(() => {
        if (showCategoryFilter) {
            fetchCategories();
        }
    }, [showCategoryFilter]);

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'createdAt',
            sortDir: 'desc',
        };
        setFilters(clearedFilters);
        onFilterChange?.(clearedFilters);
    };

    const hasActiveFilters = filters.categoryId || filters.minPrice || filters.maxPrice;

    const sortOptions = [
        { value: 'createdAt-desc', label: 'Mới nhất' },
        { value: 'createdAt-asc', label: 'Cũ nhất' },
        { value: 'price-asc', label: 'Giá thấp đến cao' },
        { value: 'price-desc', label: 'Giá cao đến thấp' },
        { value: 'name-asc', label: 'Tên A-Z' },
        { value: 'name-desc', label: 'Tên Z-A' },
    ];

    const priceRanges = [
        { min: 0, max: 500000, label: 'Dưới 500.000đ' },
        { min: 500000, max: 1000000, label: '500.000đ - 1.000.000đ' },
        { min: 1000000, max: 2000000, label: '1.000.000đ - 2.000.000đ' },
        { min: 2000000, max: 5000000, label: '2.000.000đ - 5.000.000đ' },
        { min: 5000000, max: null, label: 'Trên 5.000.000đ' },
    ];

    return (
        <>
            {/* Desktop Filter */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-soft p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg font-semibold">Bộ lọc</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Xóa lọc
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                {showCategoryFilter && categories.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Danh mục</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="category"
                                    checked={!filters.categoryId}
                                    onChange={() => handleChange('categoryId', '')}
                                    className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                                />
                                <span className="text-gray-600 group-hover:text-pink-600 transition-colors">
                                    Tất cả
                                </span>
                            </label>
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.categoryId === category.id.toString()}
                                        onChange={() => handleChange('categoryId', category.id.toString())}
                                        className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-gray-600 group-hover:text-pink-600 transition-colors">
                                        {category.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Filter */}
                {showPriceFilter && (
                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Khoảng giá</h4>
                        <div className="space-y-2">
                            {priceRanges.map((range, index) => (
                                <label
                                    key={index}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="radio"
                                        name="priceRange"
                                        checked={
                                            filters.minPrice === range.min.toString() &&
                                            filters.maxPrice === (range.max?.toString() || '')
                                        }
                                        onChange={() => {
                                            handleChange('minPrice', range.min.toString());
                                            handleChange('maxPrice', range.max?.toString() || '');
                                        }}
                                        className="w-4 h-4 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-gray-600 group-hover:text-pink-600 transition-colors text-sm">
                                        {range.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sort Filter */}
                {showSortFilter && (
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Sắp xếp</h4>
                        <select
                            value={`${filters.sortBy}-${filters.sortDir}`}
                            onChange={(e) => {
                                const [sortBy, sortDir] = e.target.value.split('-');
                                handleChange('sortBy', sortBy);
                                handleChange('sortDir', sortDir);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-soft border border-gray-200 hover:border-pink-300 transition-colors"
                >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Bộ lọc</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                </button>
            </div>

            {/* Mobile Filter Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-auto animate-slide-up">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-display text-lg font-semibold">Bộ lọc</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Category Filter */}
                            {showCategoryFilter && categories.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-3">Danh mục</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleChange('categoryId', '')}
                                            className={`px-4 py-2 rounded-full text-sm transition-colors ${!filters.categoryId
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Tất cả
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleChange('categoryId', category.id.toString())}
                                                className={`px-4 py-2 rounded-full text-sm transition-colors ${filters.categoryId === category.id.toString()
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Filter */}
                            {showPriceFilter && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-3">Khoảng giá</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {priceRanges.map((range, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    handleChange('minPrice', range.min.toString());
                                                    handleChange('maxPrice', range.max?.toString() || '');
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm transition-colors ${filters.minPrice === range.min.toString()
                                                    ? 'bg-pink-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sort Filter */}
                            {showSortFilter && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-3">Sắp xếp</h4>
                                    <select
                                        value={`${filters.sortBy}-${filters.sortDir}`}
                                        onChange={(e) => {
                                            const [sortBy, sortDir] = e.target.value.split('-');
                                            handleChange('sortBy', sortBy);
                                            handleChange('sortDir', sortDir);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Xóa lọc
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-lg"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductFilter;
