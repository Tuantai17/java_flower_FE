import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    createBanner, 
    updateBanner, 
    getBannerById 
} from '../../../api/bannerApi';
import { uploadImage } from '../../../api/uploadApi';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useNotification, ToastContainer } from '../../../components/common/Notification';

const BannerForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const { toasts, notify, removeToast } = useNotification();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        buttonText: 'Xem Ngay',
        sortOrder: 0,
        active: true,
        startDate: '',
        endDate: '',
        backgroundColor: '',
        textColor: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchBanner();
        }
    }, [id]);

    const fetchBanner = async () => {
        try {
            setLoading(true);
            const response = await getBannerById(id);
            if (response.success) {
                const banner = response.data;
                setFormData({
                    title: banner.title || '',
                    subtitle: banner.subtitle || '',
                    description: banner.description || '',
                    imageUrl: banner.imageUrl || '',
                    linkUrl: banner.linkUrl || '',
                    buttonText: banner.buttonText || 'Xem Ngay',
                    sortOrder: banner.sortOrder || 0,
                    active: banner.active !== undefined ? banner.active : true,
                    startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
                    endDate: banner.endDate ? banner.endDate.slice(0, 16) : '',
                    backgroundColor: banner.backgroundColor || '',
                    textColor: banner.textColor || ''
                });
                setImagePreview(banner.imageUrl);
            }
        } catch (error) {
            notify.error('Lỗi khi tải thông tin banner');
            console.error('Error fetching banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            notify.error('Vui lòng chọn file hình ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            notify.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        try {
            setUploading(true);
            const uploadResponse = await uploadImage(file, 'banners');
            
            // Extract URL from response (uploadResponse is an object with url, originalName, etc.)
            const imageUrl = uploadResponse?.url || uploadResponse;
            
            setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
            setImagePreview(imageUrl);
            notify.success('Upload ảnh thành công');
        } catch (error) {
            notify.error('Lỗi khi upload ảnh');
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setImagePreview(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề không được để trống';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Tiêu đề tối đa 200 ký tự';
        }

        if (!formData.imageUrl) {
            newErrors.imageUrl = 'Vui lòng upload hình ảnh';
        }

        if (formData.subtitle && formData.subtitle.length > 200) {
            newErrors.subtitle = 'Phụ đề tối đa 200 ký tự';
        }

        if (formData.buttonText && formData.buttonText.length > 50) {
            newErrors.buttonText = 'Text nút tối đa 50 ký tự';
        }

        if (formData.backgroundColor && !/^#[0-9A-Fa-f]{6}$/.test(formData.backgroundColor)) {
            newErrors.backgroundColor = 'Màu nền phải theo định dạng hex (#RRGGBB)';
        }

        if (formData.textColor && !/^#[0-9A-Fa-f]{6}$/.test(formData.textColor)) {
            newErrors.textColor = 'Màu chữ phải theo định dạng hex (#RRGGBB)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notify.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);
            
            // Prepare data - only include non-empty values
            const submitData = {
                title: formData.title,
                imageUrl: formData.imageUrl,
                sortOrder: formData.sortOrder,
                active: formData.active
            };

            // Add optional fields only if they have values
            if (formData.subtitle && formData.subtitle.trim()) {
                submitData.subtitle = formData.subtitle.trim();
            }
            if (formData.description && formData.description.trim()) {
                submitData.description = formData.description.trim();
            }
            if (formData.linkUrl && formData.linkUrl.trim()) {
                submitData.linkUrl = formData.linkUrl.trim();
            }
            if (formData.buttonText && formData.buttonText.trim()) {
                submitData.buttonText = formData.buttonText.trim();
            }
            if (formData.backgroundColor && formData.backgroundColor.trim()) {
                submitData.backgroundColor = formData.backgroundColor.trim();
            }
            if (formData.textColor && formData.textColor.trim()) {
                submitData.textColor = formData.textColor.trim();
            }
            if (formData.startDate) {
                submitData.startDate = formData.startDate;
            }
            if (formData.endDate) {
                submitData.endDate = formData.endDate;
            }

            let response;
            if (isEditMode) {
                response = await updateBanner(id, submitData);
            } else {
                response = await createBanner(submitData);
            }

            if (response.success) {
                notify.success(isEditMode ? 'Cập nhật banner thành công' : 'Tạo banner thành công');
                navigate('/admin/banners');
            }
        } catch (error) {
            notify.error(isEditMode ? 'Lỗi khi cập nhật banner' : 'Lỗi khi tạo banner');
            console.error('Error submitting banner:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/banners')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <FiArrowLeft /> Quay lại
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode ? 'Cập nhật thông tin banner' : 'Tạo banner mới cho trang chủ'}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình Ảnh <span className="text-red-500">*</span>
                    </label>
                    {imagePreview ? (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-w-2xl h-64 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            >
                                <FiX />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-pink-600 hover:text-pink-700">
                                        {uploading ? 'Đang upload...' : 'Upload hình ảnh'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    PNG, JPG, GIF tới 5MB
                                </p>
                            </div>
                        </div>
                    )}
                    {errors.imageUrl && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu Đề <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="VD: HOA CƯỚI CẦM TAY"
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                </div>

                {/* Subtitle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phụ Đề
                    </label>
                    <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                            errors.subtitle ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="VD: Bộ Sưu Tập Mới"
                    />
                    {errors.subtitle && (
                        <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô Tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="VD: FREESHIP & Tặng hoa cài áo cho chú rể"
                    />
                </div>

                {/* Link URL and Button Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link URL
                        </label>
                        <input
                            type="text"
                            name="linkUrl"
                            value={formData.linkUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="/shop"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Text Nút
                        </label>
                        <input
                            type="text"
                            name="buttonText"
                            value={formData.buttonText}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                errors.buttonText ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Xem Ngay"
                        />
                        {errors.buttonText && (
                            <p className="mt-1 text-sm text-red-600">{errors.buttonText}</p>
                        )}
                    </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Màu Nền (Hex)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleInputChange}
                                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                    errors.backgroundColor ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="#FF6B9D"
                            />
                            <input
                                type="color"
                                value={formData.backgroundColor || '#ffffff'}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        {errors.backgroundColor && (
                            <p className="mt-1 text-sm text-red-600">{errors.backgroundColor}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Màu Chữ (Hex)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="textColor"
                                value={formData.textColor}
                                onChange={handleInputChange}
                                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                                    errors.textColor ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="#FFFFFF"
                            />
                            <input
                                type="color"
                                value={formData.textColor || '#000000'}
                                onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                        </div>
                        {errors.textColor && (
                            <p className="mt-1 text-sm text-red-600">{errors.textColor}</p>
                        )}
                    </div>
                </div>

                {/* Sort Order and Active */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thứ Tự Hiển Thị
                        </label>
                        <input
                            type="number"
                            name="sortOrder"
                            value={formData.sortOrder}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Số càng nhỏ hiển thị càng trước
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng Thái
                        </label>
                        <label className="flex items-center gap-3 mt-2">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                            />
                            <span className="text-sm text-gray-700">
                                Kích hoạt banner
                            </span>
                        </label>
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày Bắt Đầu
                        </label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày Kết Thúc
                        </label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/banners')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSave />
                        {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </form>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default BannerForm;
