import React from 'react';

const Loading = ({ size = 'default', text = 'Đang tải...', fullScreen = false }) => {
    const sizeClasses = {
        small: 'w-6 h-6 border-2',
        default: 'w-12 h-12 border-4',
        large: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`${sizeClasses[size]} border-pink-200 border-b-pink-500 rounded-full animate-spin`}
            />
            {text && (
                <p className="text-gray-500 text-sm animate-pulse">{text}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            {spinner}
        </div>
    );
};

// Skeleton loading components
export const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-24" />
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-100" />
        {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="h-16 border-b border-gray-100 flex items-center px-6 gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
        ))}
    </div>
);

export default Loading;
