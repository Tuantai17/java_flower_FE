import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import useDebounce from '../../hooks/useDebounce';
import productApi from '../../api/productApi';

const SearchBar = ({
    placeholder = 'Tìm kiếm hoa tươi, quà tặng...',
    onSearch,
    showSuggestions = true,
    className = ''
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await productApi.search(debouncedQuery, 0, 5);
                setSuggestions(response.content || response || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (showSuggestions) {
            fetchSuggestions();
        }
    }, [debouncedQuery, showSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            performSearch(query.trim());
        }
    };

    const performSearch = (searchTerm) => {
        // Save to recent searches
        const newRecent = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));

        // Close dropdown and navigate
        setIsOpen(false);
        setQuery('');

        if (onSearch) {
            onSearch(searchTerm);
        } else {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="input-search w-full"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            {isOpen && showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {/* Loading */}
                    {isLoading && (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            Đang tìm kiếm...
                        </div>
                    )}

                    {/* Suggestions */}
                    {!isLoading && suggestions.length > 0 && (
                        <div className="py-2">
                            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gợi ý</p>
                            {suggestions.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-pink-50 transition-colors text-left"
                                >
                                    <img
                                        src={product.thumbnail || '/assets/images/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-medium text-gray-800 truncate">{product.name}</p>
                                        <p className="text-sm font-semibold text-pink-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice || product.price)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!isLoading && !query && recentSearches.length > 0 && (
                        <div className="py-2 border-t border-gray-100">
                            <div className="flex items-center justify-between px-4 py-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Tìm kiếm gần đây</p>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-pink-500 hover:text-pink-600"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => performSearch(search)}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-pink-50 transition-colors text-left"
                                >
                                    <ClockIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{search}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && query && suggestions.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <p className="text-gray-500 text-sm">Không tìm thấy kết quả</p>
                            <p className="text-gray-400 text-xs mt-1">Thử từ khóa khác</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
