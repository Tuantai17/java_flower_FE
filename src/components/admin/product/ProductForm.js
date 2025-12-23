import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from './ImageUploader';
import categoryApi from '../../../api/categoryApi';

const ProductForm = ({
    initialData = null,
    onSubmit,
    loading = false,
    submitText = 'Lưu sản phẩm'
}) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: '',
        salePrice: '',
        stockQuantity: 0,
        categoryId: '',
        thumbnail: '',
        active: true,
        status: 1,
    });
    const [errors, setErrors] = useState({});

    // Initialize form with initialData when it changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                description: initialData.description || '',
                price: initialData.price || '',
                salePrice: initialData.salePrice || '',
                stockQuantity: initialData.stockQuantity || 0,
                categoryId: initialData.categoryId || '',
                thumbnail: initialData.thumbnail || '',
                active: initialData.active !== undefined ? initialData.active : true,
                status: initialData.status || 1,
            });
        }
    }, [initialData]);


    useEffect(() => {
        fetchCategories();
    }, []);


    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            console.log('📋 Categories response for product form:', response);

            // Handle different response formats
            let categoriesData = [];
            if (Array.isArray(response)) {
                categoriesData = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                categoriesData = response.data;
            } else if (response && response.content && Array.isArray(response.content)) {
                categoriesData = response.content;
            }

            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const generateSlug = (name) => {
        const baseSlug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Add random suffix if creating new product (no initialData) to ensure uniqueness
        if (!initialData) {
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            return `${baseSlug}-${randomSuffix}`;
        }
        return baseSlug;
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
        setFormData({ ...formData, thumbnail: imageUrl });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên sản phẩm';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Vui lòng nhập giá hợp lệ';
        }

        if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price)) {
            newErrors.salePrice = 'Giá sale phải nhỏ hơn giá gốc';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Vui lòng chọn danh mục';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const submitData = {
            ...formData,
            price: parseFloat(formData.price),
            salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
            stockQuantity: parseInt(formData.stockQuantity),
            categoryId: parseInt(formData.categoryId),
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin cơ bản</h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm"
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
                                    placeholder="ten-san-pham"
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
                                    rows={5}
                                    placeholder="Nhập mô tả sản phẩm..."
                                    className="input-field resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Giá & Tồn kho</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá gốc (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className={`input-field ${errors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                            </div>

                            {/* Sale Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá sale (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    name="salePrice"
                                    value={formData.salePrice}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className={`input-field ${errors.salePrice ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.salePrice && <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>}
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số lượng tồn kho
                                </label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    value={formData.stockQuantity}
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Ảnh sản phẩm</h3>
                        <ImageUploader
                            value={formData.thumbnail}
                            onChange={handleImageUpload}
                            uploadType="product"
                        />
                    </div>


                    {/* Category */}
                    <div className="bg-white rounded-xl shadow-soft p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Phân loại</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className={`input-field ${errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}`}
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                        </div>
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
                            <span className="text-gray-700">Hiển thị sản phẩm</span>
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

export default ProductForm;
