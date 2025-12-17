import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    UserIcon,
    PhoneIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import categoryApi from '../../api/categoryApi';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getMenu();
                // Data từ API đã có cấu trúc đúng với children
                console.log('Categories loaded:', data);
                setCategories(data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Không sử dụng mock data - chỉ lấy từ API
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    // Kiểm tra category đang active
    const isActiveCategory = (categoryId) => {
        return location.pathname === `/category/${categoryId}`;
    };

    // Kiểm tra trang hiện tại
    const isActivePage = (path) => {
        return location.pathname === path;
    };

    // Toggle mobile category dropdown
    const toggleMobileCategory = (categoryId) => {
        setMobileOpenCategory(mobileOpenCategory === categoryId ? null : categoryId);
    };

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'
            }`}>
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-sm py-2">
                <div className="container-custom flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        <span>HOTLINE: <strong>1900 633 045</strong> | 0865 160 360</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="#" className="hover:text-pink-200 transition-colors">
                            <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                Tài khoản
                            </span>
                        </Link>
                        <Link to="#" className="hover:text-pink-200 transition-colors">
                            Giỏ hàng
                        </Link>
                        <Link to="#" className="hover:text-pink-200 transition-colors">
                            Thanh toán
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container-custom py-4">
                <div className="flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">🌸</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gradient">
                                FlowerCorner
                            </h1>
                            <p className="text-xs text-gray-500 italic">Say it with Flowers</p>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl">
                        <div className="relative w-full">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm hoa tươi, quà tặng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-search"
                            />
                        </div>
                    </form>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <Link to="#" className="relative p-2 hover:bg-pink-50 rounded-full transition-colors">
                            <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                0
                            </span>
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-pink-50 rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-700" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation - Desktop với Menu 2 lớp */}
            <nav className="border-t border-gray-100 hidden lg:block bg-white">
                <div className="container-custom">
                    <ul className="flex items-center justify-center">
                        {/* Trang Chủ */}
                        <li>
                            <Link
                                to="/"
                                className={`
                                    flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                    transition-all duration-300 border-b-2
                                    ${isActivePage('/')
                                        ? 'text-rose-600 border-rose-500'
                                        : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                    }
                                `}
                            >
                                Trang Chủ
                            </Link>
                        </li>
                        {/* Sản Phẩm */}
                        <li>
                            <Link
                                to="/shop"
                                className={`
                                    flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                    transition-all duration-300 border-b-2
                                    ${isActivePage('/shop') || location.pathname.startsWith('/shop')
                                        ? 'text-rose-600 border-rose-500'
                                        : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                    }
                                `}
                            >
                                Sản Phẩm
                            </Link>
                        </li>
                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="relative group"
                                onMouseEnter={() => setOpenDropdown(category.id)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    to={`/category/${category.id}`}
                                    className={`
                                        flex items-center gap-1 px-4 py-3.5 font-semibold text-sm uppercase tracking-wide
                                        transition-all duration-300 border-b-2
                                        ${isActiveCategory(category.id) || openDropdown === category.id
                                            ? 'text-rose-600 border-rose-500'
                                            : 'text-gray-700 border-transparent hover:text-rose-600 hover:border-rose-400'
                                        }
                                    `}
                                >
                                    {category.name}
                                    {category.children && category.children.length > 0 && (
                                        <ChevronDownIcon
                                            className={`h-4 w-4 transition-transform duration-300 ${openDropdown === category.id ? 'rotate-180' : ''
                                                }`}
                                        />
                                    )}
                                </Link>

                                {/* Dropdown Menu con - 2 lớp */}
                                {category.children && category.children.length > 0 && (
                                    <div
                                        className={`
                                            absolute top-full left-0 bg-white shadow-2xl rounded-b-xl py-3 min-w-[280px] 
                                            border border-gray-100 border-t-2 border-t-rose-500 z-50
                                            transition-all duration-300 origin-top
                                            ${openDropdown === category.id
                                                ? 'opacity-100 visible transform scale-100'
                                                : 'opacity-0 invisible transform scale-95'
                                            }
                                        `}
                                    >
                                        {category.children.map((child, index) => (
                                            <Link
                                                key={child.id}
                                                to={`/category/${child.id}`}
                                                className={`
                                                    flex items-center px-5 py-3 text-gray-600 
                                                    hover:text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50
                                                    transition-all duration-200 group/item
                                                    ${index !== category.children.length - 1 ? 'border-b border-gray-50' : ''}
                                                    ${isActiveCategory(child.id) ? 'text-rose-600 bg-rose-50' : ''}
                                                `}
                                            >
                                                <span className="flex-1 text-sm font-medium">{child.name}</span>
                                                <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover/item:opacity-100 transform translate-x-0 group-hover/item:translate-x-1 transition-all duration-200" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Hotline Bar */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 py-2 text-center hidden lg:block">
                <p className="text-rose-600 font-medium text-sm">
                    HOTLINE ĐẶT HOA NHANH - TP HCM: <strong>1900 633 045</strong> - Hà Nội: <strong>094 200 7921</strong>
                </p>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-search"
                            />
                        </div>
                    </form>

                    {/* Mobile Navigation với 2 lớp */}
                    <ul className="py-2">
                        {/* Trang Chủ */}
                        <li className="border-b border-gray-50">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    block px-6 py-3.5 font-semibold text-sm uppercase
                                    ${isActivePage('/') ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                `}
                            >
                                Trang Chủ
                            </Link>
                        </li>
                        {/* Sản Phẩm */}
                        <li className="border-b border-gray-50">
                            <Link
                                to="/shop"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    block px-6 py-3.5 font-semibold text-sm uppercase
                                    ${isActivePage('/shop') || location.pathname.startsWith('/shop') ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                `}
                            >
                                Sản Phẩm
                            </Link>
                        </li>
                        {/* Dynamic Categories */}
                        {categories.map((category) => (
                            <li key={category.id} className="border-b border-gray-50">
                                {/* Parent Category */}
                                <div className="flex items-center">
                                    <Link
                                        to={`/category/${category.id}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex-1 px-6 py-3.5 font-semibold text-sm uppercase
                                            ${isActiveCategory(category.id) ? 'text-rose-600 bg-rose-50' : 'text-gray-700'}
                                        `}
                                    >
                                        {category.name}
                                    </Link>
                                    {category.children && category.children.length > 0 && (
                                        <button
                                            onClick={() => toggleMobileCategory(category.id)}
                                            className="px-4 py-3.5 text-gray-500 hover:text-rose-600 transition-colors"
                                        >
                                            <ChevronDownIcon
                                                className={`h-5 w-5 transition-transform duration-300 ${mobileOpenCategory === category.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Children Categories cho Mobile */}
                                {category.children && category.children.length > 0 && mobileOpenCategory === category.id && (
                                    <div className="bg-gray-50 border-t border-gray-100">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                to={`/category/${child.id}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`
                                                    block pl-10 pr-6 py-3 text-sm border-b border-gray-100 last:border-b-0
                                                    ${isActiveCategory(child.id)
                                                        ? 'text-rose-600 bg-rose-50 font-medium'
                                                        : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                                                    }
                                                `}
                                            >
                                                • {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Mobile Hotline */}
                    <div className="p-4 bg-rose-50 text-center">
                        <p className="text-rose-600 font-medium text-sm">
                            📞 Hotline: <strong>1900 633 045</strong>
                        </p>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
