import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { XMarkIcon, UserIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

/**
 * LoginRequiredModal Component
 * 
 * Modal hiển thị khi user chưa đăng nhập và cố gắng thực hiện hành động yêu cầu đăng nhập
 * (ví dụ: thêm vào giỏ hàng)
 * 
 * Sử dụng React Portal để render modal ở ngoài DOM tree, tránh vấn đề z-index
 */
const LoginRequiredModal = ({ isOpen, onClose, message = "Vui lòng đăng nhập để tiếp tục" }) => {
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

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"></div>
            
            {/* Modal */}
            <div 
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-slideUp"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                        <ShoppingBagIcon className="w-10 h-10 text-pink-500" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Chào mừng bạn đến với FlowerCorner!
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 mb-8">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="space-y-3">
                        <Link 
                            to="/login"
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
                        >
                            <UserIcon className="w-5 h-5" />
                            Đăng nhập
                        </Link>
                        
                        <Link 
                            to="/register"
                            onClick={onClose}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-pink-600 font-semibold rounded-full border-2 border-pink-500 hover:bg-pink-50 transition-all"
                        >
                            Đăng ký tài khoản
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-sm text-gray-500">
                        Đăng nhập để lưu giỏ hàng và nhận nhiều ưu đãi hấp dẫn!
                    </p>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );

    // Use Portal to render modal at document body level
    return createPortal(modalContent, document.body);
};

export default LoginRequiredModal;
