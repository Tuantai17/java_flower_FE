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

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productApi.getById(id);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            // Không sử dụng mock data - chỉ lấy từ API
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            await productApi.update(id, data);
            navigate('/admin/products');
            // Show success notification
        } catch (error) {
            console.error('Error updating product:', error);
            // Show error notification
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
                <p className="text-gray-500">Không tìm thấy sản phẩm</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
                <p className="text-gray-500">Cập nhật thông tin sản phẩm: {product.name}</p>
            </div>

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
