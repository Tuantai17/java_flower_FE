/**
 * QuickActionCard Component
 * 
 * Card hiển thị hành động nhanh trong Dashboard
 */

import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({
    icon: Icon,
    label,
    path,
    color = 'pink',
    count = null,
    onClick = null,
}) => {
    const colorClasses = {
        pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-200',
        blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
        green: 'bg-green-100 text-green-600 group-hover:bg-green-200',
        purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
        orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
        red: 'bg-red-100 text-red-600 group-hover:bg-red-200',
        gray: 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
        yellow: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200',
        indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200',
        cyan: 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200',
    };

    const Content = () => (
        <>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${colorClasses[color] || colorClasses.pink}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {label}
                </span>
            </div>
            {count !== null && count > 0 && (
                <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                    {count > 99 ? '99+' : count}
                </div>
            )}
        </>
    );

    const baseClasses = "flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 group border border-transparent hover:border-gray-100";

    if (onClick) {
        return (
            <button onClick={onClick} className={baseClasses}>
                <Content />
            </button>
        );
    }

    return (
        <Link to={path} className={baseClasses}>
            <Content />
        </Link>
    );
};

export default QuickActionCard;
