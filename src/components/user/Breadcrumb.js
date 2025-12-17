import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumb = ({ items = [] }) => {
    return (
        <nav className="flex items-center gap-2 text-sm py-4">
            <Link
                to="/"
                className="flex items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors"
            >
                <HomeIcon className="h-4 w-4" />
                <span>Trang chủ</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    {index === items.length - 1 ? (
                        <span className="text-gray-800 font-medium">{item.label}</span>
                    ) : (
                        <Link
                            to={item.path}
                            className="text-gray-500 hover:text-pink-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
