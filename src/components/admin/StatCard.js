import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const StatCard = ({
    title,
    value,
    icon,
    change,
    changeType = 'increase', // 'increase' or 'decrease'
    color = 'pink', // 'pink', 'green', 'blue', 'purple', 'orange'
    prefix = '',
    suffix = '',
}) => {
    const colorClasses = {
        pink: {
            bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
            icon: 'bg-gradient-to-br from-pink-500 to-rose-500',
            text: 'text-pink-600',
        },
        green: {
            bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
            icon: 'bg-gradient-to-br from-green-500 to-emerald-500',
            text: 'text-green-600',
        },
        blue: {
            bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            icon: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            text: 'text-blue-600',
        },
        purple: {
            bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
            icon: 'bg-gradient-to-br from-purple-500 to-violet-500',
            text: 'text-purple-600',
        },
        orange: {
            bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
            icon: 'bg-gradient-to-br from-orange-500 to-amber-500',
            text: 'text-orange-600',
        },
    };

    const colors = colorClasses[color] || colorClasses.pink;

    return (
        <div className={`stat-card ${colors.bg}`}>
            <div className="flex items-start justify-between">
                {/* Icon */}
                <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>

                {/* Change Indicator */}
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-500'
                        }`}>
                        {changeType === 'increase' ? (
                            <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                        <span>{change}%</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className={`text-2xl font-bold ${colors.text}`}>
                    {prefix}{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
                </p>
            </div>
        </div>
    );
};

export default StatCard;
