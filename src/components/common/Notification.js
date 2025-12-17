import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Notification = ({
    type = 'info', // 'success', 'error', 'warning', 'info'
    message,
    title,
    duration = 5000,
    onClose,
    position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    };

    if (!isVisible) return null;

    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <XCircleIcon className="h-6 w-6 text-red-500" />,
        warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-[100] max-w-md w-full transition-all duration-300 ${isLeaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                }`}
        >
            <div className={`flex items-start gap-4 p-4 rounded-xl border shadow-lg ${bgColors[type]}`}>
                <div className="flex-shrink-0">
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                    )}
                    <p className="text-gray-600 text-sm">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

// Toast Container for multiple notifications
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3">
            {toasts.map((toast) => (
                <Notification
                    key={toast.id}
                    {...toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Hook for using notifications
export const useNotification = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (toast) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { ...toast, id }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const notify = {
        success: (message, title) => addToast({ type: 'success', message, title }),
        error: (message, title) => addToast({ type: 'error', message, title }),
        warning: (message, title) => addToast({ type: 'warning', message, title }),
        info: (message, title) => addToast({ type: 'info', message, title }),
    };

    return { toasts, notify, removeToast };
};

export default Notification;
