import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import categoryApi from '../../api/categoryApi';

const CategoryMenu = ({ activeId }) => {
    const [categories, setCategories] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryApi.getMenu();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex gap-2 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
                ))}
            </div>
        );
    }

    return (
        <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
                <li>
                    <Link
                        to="/shop"
                        className={`nav-link ${!activeId ? 'active' : ''}`}
                    >
                        Tất cả
                    </Link>
                </li>
                {categories.map((category) => (
                    <li
                        key={category.id}
                        className="relative group"
                        onMouseEnter={() => setOpenMenu(category.id)}
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                        <Link
                            to={`/category/${category.id}`}
                            className={`nav-link flex items-center gap-1 ${activeId === category.id ? 'active' : ''
                                }`}
                        >
                            {category.name}
                            {category.children && category.children.length > 0 && (
                                <ChevronDownIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                            )}
                        </Link>

                        {/* Dropdown */}
                        {category.children && category.children.length > 0 && openMenu === category.id && (
                            <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl py-2 min-w-[220px] border border-gray-100 z-50 animate-fade-in">
                                {category.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        to={`/category/${child.id}`}
                                        className={`block px-6 py-2.5 text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors ${activeId === child.id ? 'text-pink-600 bg-pink-50' : ''
                                            }`}
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryMenu;
