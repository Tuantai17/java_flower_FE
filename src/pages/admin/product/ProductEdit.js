import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../../components/admin/product/ProductForm';
import Loading from '../../../components/common/Loading';
import productApi from '../../../api/productApi';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productApi.getById(id);
            console.log('📦 Product data loaded:', data);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setNotification({
                show: true,
                type: 'error',
                message: 'Không thể tải thông tin sản phẩm. ' + (error.response?.data?.message || error.message)
            });
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        setSubmitting(true);
        setNotification({ show: false, type: '', message: '' });

        try {
            await productApi.update(id, data);
            setNotification({
                show: true,
                type: 'success',
                message: 'Cập nhật sản phẩm thành công!'
            });

            // Redirect after short delay to show success message
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);
        } catch (error) {
            console.error('Error updating product:', error);
            setNotification({
                show: true,
                type: 'error',
                message: 'Lỗi khi cập nhật sản phẩm: ' + (error.response?.data?.message || error.message)
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loading text="Đang tải sản phẩm..." />;
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
                <button
                    onClick={() => navigate('/admin/products')}
                    className="btn-primary"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
                <p className="text-gray-500">Cập nhật thông tin sản phẩm: {product.name}</p>
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
                initialData={product}
                onSubmit={handleSubmit}
                loading={submitting}
                submitText="Cập nhật sản phẩm"
            />
        </div>
    );
};

export default ProductEdit;
