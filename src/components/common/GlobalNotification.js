import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

/**
 * GlobalNotification Component
 * 
 * Hiển thị thông báo toast từ global state (AppContext)
 * Tự động auto-dismiss sau 5 giây
 */
const GlobalNotification = () => {
    const { state, clearNotification } = useApp();
    const { notification } = state;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    if (!notification) return null;

    const iconMap = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
        warning: <ExclamationCircleIcon className="h-6 w-6 text-amber-500" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
    };

    const bgMap = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200',
    };

    const textMap = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-amber-800',
        info: 'text-blue-800',
    };

    const type = notification.type || 'info';

    return (
        <div
            className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${bgMap[type]} max-w-sm`}>
                {/* Icon */}
                <div className="flex-shrink-0">
                    {iconMap[type]}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {notification.title && (
                        <h4 className={`font-semibold ${textMap[type]}`}>
                            {notification.title}
                        </h4>
                    )}
                    <p className={`text-sm ${textMap[type]}`}>
                        {notification.message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={clearNotification}
                    className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default GlobalNotification;
