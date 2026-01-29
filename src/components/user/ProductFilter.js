import React, { useState, useEffect } from 'react';
import {
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import categoryApi from '../../api/categoryApi';

/**
 * ProductFilter Component
 * 
 * Component lọc sản phẩm với các tính năng:
 * - Lọc theo danh mục (category)
 * - Lọc theo khoảng giá (price range)
 * - Sắp xếp (sort)
 * - Hỗ trợ responsive (mobile modal)
 */
const ProductFilter = ({
    filters = {},
    onFilterChange,
    showCategoryFilter = true,
    showPriceFilter = true,
    showSortFilter = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        sort: true
    });

    // Lấy giá trị từ props hoặc sử dụng default
    const currentFilters = {
        categoryId: filters.categoryId || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        sortBy: filters.sortBy || 'newest',
    };

    useEffect(() => {
        if (showCategoryFilter) {
            fetchCategories();
        }
    }, [showCategoryFilter]);

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getAll();
            // Đảm bảo data là array
            const categoriesArray = Array.isArray(data) ? data : [];
            setCategories(categoriesArray);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    /**
     * Xử lý thay đổi filter
     */
    const handleChange = (key, value) => {
        onFilterChange?.({ [key]: value });
    };

    /**
     * Xử lý thay đổi khoảng giá
     */
    const handlePriceRangeChange = (minPrice, maxPrice) => {
        onFilterChange?.({ minPrice, maxPrice });
    };

    /**
     * Xóa tất cả filter
     */
    const clearFilters = () => {
        onFilterChange?.({
            categoryId: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest',
        });
    };

    /**
     * Toggle section expand/collapse
     */
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const hasActiveFilters = currentFilters.categoryId ||
        currentFilters.minPrice ||
        currentFilters.maxPrice ||
        currentFilters.sortBy !== 'newest';

    // Các options sắp xếp
    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'oldest', label: 'Cũ nhất' },
        { value: 'price_asc', label: 'Giá thấp đến cao' },
        { value: 'price_desc', label: 'Giá cao đến thấp' },
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
    ];

    // Các khoảng giá định sẵn
    const priceRanges = [
        { min: 0, max: 500000, label: 'Dưới 500.000đ' },
        { min: 500000, max: 1000000, label: '500.000đ - 1.000.000đ' },
        { min: 1000000, max: 2000000, label: '1.000.000đ - 2.000.000đ' },
        { min: 2000000, max: 5000000, label: '2.000.000đ - 5.000.000đ' },
        { min: 5000000, max: null, label: 'Trên 5.000.000đ' },
    ];

    /**
     * Kiểm tra khoảng giá có đang được chọn không
     */
    const isPriceRangeSelected = (range) => {
        return currentFilters.minPrice === range.min.toString() &&
            (range.max === null
                ? currentFilters.maxPrice === ''
                : currentFilters.maxPrice === range.max.toString());
    };

    /**
     * Component Section Header có thể collapse
     */
    const SectionHeader = ({ title, section, icon }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between py-2 text-left"
        >
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                {icon}
                {title}
            </h4>
            {expandedSections[section] ? (
                <ChevronUpIcon className="h-4 w-4 text-gray-500" />
            ) : (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            )}
        </button>
    );

    /**
     * Render nội dung filter
     */
    /**
     * Render nội dung filter
     */
    const renderFilterContent = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Category Filter */}
                {showCategoryFilter && categories.length > 0 && (
                    <div className="">
                        <SectionHeader title="Danh mục" section="category" />

                        {expandedSections.category && (
                            <div className="space-y-2 mt-3 pl-1">
                                {/* All Categories Option */}
                                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-pink-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={!currentFilters.categoryId}
                                        onChange={() => handleChange('categoryId', '')}
                                        className="w-4 h-4 text-pink-500 focus:ring-pink-500 border-gray-300"
                                    />
                                    <span className={`text-sm transition-colors ${!currentFilters.categoryId
                                            ? 'text-pink-600 font-medium'
                                            : 'text-gray-600 group-hover:text-pink-600'
                                        }`}>
                                        Tất cả
                                    </span>
                                </label>

                                {/* Category List */}
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-pink-50 transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={currentFilters.categoryId === category.id.toString()}
                                                onChange={() => handleChange('categoryId', category.id.toString())}
                                                className="w-4 h-4 text-pink-500 focus:ring-pink-500 border-gray-300"
                                            />
                                            <span className={`text-sm transition-colors ${currentFilters.categoryId === category.id.toString()
                                                    ? 'text-pink-600 font-medium'
                                                    : 'text-gray-600 group-hover:text-pink-600'
                                                }`}>
                                                {category.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showPriceFilter && (
                    <div className="">
                        <SectionHeader title="Khoảng giá" section="price" />

                        {expandedSections.price && (
                            <div className="space-y-2 mt-3 pl-1">
                                {priceRanges.map((range, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-pink-50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            checked={isPriceRangeSelected(range)}
                                            onChange={() => handlePriceRangeChange(
                                                range.min.toString(),
                                                range.max?.toString() || ''
                                            )}
                                            className="w-4 h-4 text-pink-500 focus:ring-pink-500 border-gray-300"
                                        />
                                        <span className={`text-sm transition-colors ${isPriceRangeSelected(range)
                                                ? 'text-pink-600 font-medium'
                                                : 'text-gray-600 group-hover:text-pink-600'
                                            }`}>
                                            {range.label}
                                        </span>
                                    </label>
                                ))}

                                {/* Custom Price Range */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-2">Hoặc nhập khoảng giá:</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Từ"
                                            value={currentFilters.minPrice}
                                            onChange={(e) => handleChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="Đến"
                                            value={currentFilters.maxPrice}
                                            onChange={(e) => handleChange('maxPrice', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sort Filter - Keep at bottom or top, currently keeping at bottom */}
            {showSortFilter && (
                <div>
                    <SectionHeader title="Sắp xếp" section="sort" />
                    {expandedSections.sort && (
                        <div className="mt-3">
                            <select
                                value={currentFilters.sortBy}
                                onChange={(e) => handleChange('sortBy', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm bg-white"
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
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Filter */}
            <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 text-pink-500" />
                        Bộ lọc
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pink-50 transition-colors"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Xóa lọc
                        </button>
                    )}
                </div>

                {/* Filter Content */}
                {renderFilterContent()}
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
                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* Mobile Filter Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsOpen(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="h-5 w-5 text-pink-500" />
                                Bộ lọc
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filter Content */}
                        <div className="p-6">
                            {renderFilterContent()}
                        </div>

                        {/* Footer Buttons */}
                        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => {
                                    clearFilters();
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Xóa lọc
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
                            >
                                Áp dụng ({hasActiveFilters ? '✓' : '0'})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductFilter;
