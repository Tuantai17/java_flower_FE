import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CategoryForm from '../../../components/admin/category/CategoryForm';
import Loading from '../../../components/common/Loading';
import categoryApi from '../../../api/categoryApi';

const CategoryEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCategory = async () => {
        setLoading(true);
        try {
            const data = await categoryApi.getById(id);
            setCategory(data);
        } catch (error) {
            console.error('Error fetching category:', error);
            // Không sử dụng mock data - chỉ lấy từ API
            setCategory(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            await categoryApi.update(id, data);
            navigate('/admin/categories');
            // Show success notification
        } catch (error) {
            console.error('Error updating category:', error);
            // Show error notification
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loading text="Đang tải danh mục..." />;
    }

    if (!category) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy danh mục</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa danh mục</h1>
                <p className="text-gray-500">Cập nhật thông tin danh mục: {category.name}</p>
            </div>

            <CategoryForm
                initialData={category}
                onSubmit={handleSubmit}
                loading={submitting}
                submitText="Cập nhật danh mục"
            />
        </div>
    );
};

export default CategoryEdit;
