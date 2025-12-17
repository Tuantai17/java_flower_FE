import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../product/ImageUploader';
import categoryApi from '../../../api/categoryApi';

const CategoryForm = ({
    initialData = null,
    onSubmit,
    loading = false,
    submitText = 'Lưu danh mục'
}) => {
    const navigate = useNavigate();
    const [parentCategories, setParentCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        parentId: '',
        sortOrder: 0,
        active: true,
        ...initialData,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchParentCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const fetchParentCategories = async () => {
        try {
            const response = await categoryApi.getParents();
            console.log('📋 Parent categories response:', response);

            // Handle different response formats
            let categoriesData = [];
            if (Array.isArray(response)) {
                categoriesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
            } else if (response && response.content && Array.isArray(response.content)) {
                categoriesData = response.content;
            }

            setParentCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching parent categories:', error);
            setParentCategories([]);
        }
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        if (name === 'name') {
            setFormData({
                ...formData,
                [name]: newValue,
                slug: generateSlug(newValue),
            });
        } else {
            setFormData({
                ...formData,
                [name]: newValue,
            });
        }

        // Clear error on change
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleImageUpload = (imageUrl) => {
        setFormData({ ...formData, imageUrl });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên danh mục';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const submitData = {
            ...formData,
            parentId: formData.parentId ? parseInt(formData.parentId) : null,
            sortOrder: parseInt(formData.sortOrder),
        };

        onSubmit?.(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin danh mục</h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục"
                                    className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Slug (URL)
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="ten-danh-muc"
                                    className="input-field"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Nhập mô tả danh mục..."
                                    className="input-field resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parent & Sort */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Phân cấp</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Parent Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Danh mục cha
                                </label>
                                <select
                                    name="parentId"
                                    value={formData.parentId}
                                    onChange={handleChange}
                                    className="input-field"
                                    disabled={initialData && parentCategories.some(p => p.id === initialData.id)}
                                >
                                    <option value="">Không có (danh mục gốc)</option>
                                    {parentCategories
                                        .filter((cat) => !initialData || cat.id !== initialData.id)
                                        .map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thứ tự hiển thị
                                </label>
                                <input
                                    type="number"
                                    name="sortOrder"
                                    value={formData.sortOrder}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Image */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Ảnh danh mục</h3>
                        <ImageUploader
                            value={formData.imageUrl}
                            onChange={handleImageUpload}
                            folder="categories"
                        />
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Trạng thái</h3>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                            />
                            <span className="text-gray-700">Hiển thị danh mục</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Đang lưu...' : submitText}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;
