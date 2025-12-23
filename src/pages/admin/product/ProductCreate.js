import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../../components/admin/product/ProductForm';
import productApi from '../../../api/productApi';

const ProductCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    const handleSubmit = async (data) => {
        setLoading(true);
        setNotification({ show: false, type: '', message: '' });

        try {
            console.log('📤 Submitting product data:', data);
            await productApi.create(data);
            setNotification({
                show: true,
                type: 'success',
                message: 'Tạo sản phẩm thành công!'
            });

            // Redirect after short delay to show success message
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);
        } catch (error) {
            console.error('Error creating product:', error);

            // Extract detailed error message
            let errorMessage = 'Dữ liệu không hợp lệ';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle validation errors array
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    errorMessage = errors.map(e => e.defaultMessage || e.message || e).join(', ');
                } else if (typeof errors === 'object') {
                    errorMessage = Object.values(errors).join(', ');
                }
            }

            setNotification({
                show: true,
                type: 'error',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
                <p className="text-gray-500">Điền thông tin để tạo sản phẩm mới</p>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`mb-6 p-4 rounded-lg border ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <ProductForm
                onSubmit={handleSubmit}
                loading={loading}
                submitText="Tạo sản phẩm"
            />
        </div>
    );
};

export default ProductCreate;
