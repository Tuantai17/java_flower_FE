import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    showInfo = true,
    showFirstLast = true,
    maxVisiblePages = 5,
}) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pages = getPageNumbers();
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            {/* Info */}
            {showInfo && (
                <p className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-700">{startItem}</span>
                    {' - '}
                    <span className="font-medium text-gray-700">{endItem}</span>
                    {' trên '}
                    <span className="font-medium text-gray-700">{totalItems}</span> kết quả
                </p>
            )}

            {/* Pagination Controls */}
            <nav className="flex items-center gap-1">
                {/* First Page */}
                {showFirstLast && currentPage > 2 && (
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                        Đầu
                    </button>
                )}

                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {pages[0] > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="w-10 h-10 text-sm rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            >
                                1
                            </button>
                            {pages[0] > 2 && (
                                <span className="px-2 text-gray-400">...</span>
                            )}
                        </>
                    )}

                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 text-sm rounded-lg transition-all duration-200 ${currentPage === page
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {pages[pages.length - 1] < totalPages && (
                        <>
                            {pages[pages.length - 1] < totalPages - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="w-10 h-10 text-sm rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>

                {/* Last Page */}
                {showFirstLast && currentPage < totalPages - 1 && (
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                        Cuối
                    </button>
                )}
            </nav>
        </div>
    );
};

export default Pagination;
