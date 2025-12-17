import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'default',
    showCloseButton = true,
    closeOnOverlayClick = true
}) => {
    const sizeClasses = {
        small: 'max-w-md',
        default: 'max-w-lg',
        large: 'max-w-2xl',
        xlarge: 'max-w-4xl',
        full: 'max-w-6xl',
    };

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal-backdrop"
            onClick={handleOverlayClick}
        >
            <div className={`modal-content ${sizeClasses[size]} relative`}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        {title && (
                            <h2 className="text-xl font-display font-semibold text-gray-900">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Confirm Modal
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger' // 'danger', 'warning', 'success'
}) => {
    const variantClasses = {
        danger: 'bg-red-500 hover:bg-red-600',
        warning: 'bg-yellow-500 hover:bg-yellow-600',
        success: 'bg-green-500 hover:bg-green-600',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="small">
            <div className="text-center">
                <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 text-red-500' :
                        variant === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                            'bg-green-100 text-green-500'
                    }`}>
                    <span className="text-3xl">
                        {variant === 'danger' ? '⚠️' : variant === 'warning' ? '❓' : '✓'}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2.5 text-white rounded-lg transition-colors ${variantClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default Modal;
