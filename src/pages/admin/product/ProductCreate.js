import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../../components/admin/product/ProductForm';
import productApi from '../../../api/productApi';

const ProductCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            await productApi.create(data);
            navigate('/admin/products');
            // Show success notification
        } catch (error) {
            console.error('Error creating product:', error);
            // Show error notification
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

            <ProductForm
                onSubmit={handleSubmit}
                loading={loading}
                submitText="Tạo sản phẩm"
            />
        </div>
    );
};

export default ProductCreate;
