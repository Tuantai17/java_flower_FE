import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryForm from '../../../components/admin/category/CategoryForm';
import categoryApi from '../../../api/categoryApi';

const CategoryCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            await categoryApi.create(data);
            navigate('/admin/categories');
            // Show success notification
        } catch (error) {
            console.error('Error creating category:', error);
            // Show error notification
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Thêm danh mục mới</h1>
                <p className="text-gray-500">Điền thông tin để tạo danh mục mới</p>
            </div>

            <CategoryForm
                onSubmit={handleSubmit}
                loading={loading}
                submitText="Tạo danh mục"
            />
        </div>
    );
};

export default CategoryCreate;
