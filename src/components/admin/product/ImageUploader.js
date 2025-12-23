import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import uploadApi from '../../../api/uploadApi';

/**
 * ImageUploader Component
 * 
 * @param {string} value - URL hiện tại của ảnh
 * @param {function} onChange - Callback khi URL thay đổi
 * @param {'product' | 'category' | 'user'} uploadType - Loại upload (product, category, user)
 * @param {number} maxSize - Kích thước tối đa (bytes), mặc định 5MB
 * @param {string[]} acceptedTypes - Các loại file được chấp nhận
 */
const ImageUploader = ({
    value,
    onChange,
    uploadType = 'product',
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const inputRef = useRef(null);

    // Update preview when value changes
    useEffect(() => {
        if (value) {
            setPreviewUrl(uploadApi.getPreviewUrl(value));
        } else {
            setPreviewUrl('');
        }
    }, [value]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        setError('');

        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
            setError('Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP.');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File quá lớn. Kích thước tối đa là ${maxSize / 1024 / 1024}MB.`);
            return;
        }

        // Create local preview immediately for better UX
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        setUploading(true);

        try {
            // Call the correct upload endpoint based on type
            const response = await uploadApi.uploadImage(file, uploadType);

            // Extract URL from response
            let imageUrl = '';
            if (typeof response === 'string') {
                imageUrl = response;
            } else if (response?.url) {
                imageUrl = response.url;
            } else if (response?.imageUrl) {
                imageUrl = response.imageUrl;
            } else if (response?.data) {
                imageUrl = typeof response.data === 'string' ? response.data : response.data.url;
            }

            if (imageUrl) {
                // Revoke the local blob URL
                URL.revokeObjectURL(localPreview);

                // Update parent with server URL
                onChange?.(imageUrl);

                // Update preview with server URL
                setPreviewUrl(uploadApi.getPreviewUrl(imageUrl));

                console.log('✅ Upload thành công:', imageUrl);
            } else {
                console.warn('Upload response không chứa URL:', response);
                setError('Upload thành công nhưng không nhận được URL ảnh. Vui lòng thử lại hoặc nhập URL thủ công.');
                // Keep the local preview for display
            }
        } catch (err) {
            console.error('❌ Upload error:', err);

            // Revoke the local blob URL on error
            URL.revokeObjectURL(localPreview);

            // Reset preview to original value
            if (value) {
                setPreviewUrl(uploadApi.getPreviewUrl(value));
            } else {
                setPreviewUrl('');
            }

            // Show appropriate error message
            if (err.response?.status === 404) {
                setError('Endpoint upload không tồn tại. Vui lòng kiểm tra backend hoặc nhập URL ảnh thủ công.');
            } else if (err.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else if (err.response?.status === 403) {
                setError('Bạn không có quyền upload ảnh. Vui lòng đăng nhập với tài khoản Admin.');
            } else if (err.response?.status === 413) {
                setError('File quá lớn. Vui lòng chọn file nhỏ hơn.');
            } else {
                const serverMessage = err.response?.data?.message;
                setError(serverMessage || 'Lỗi khi tải ảnh lên server. Vui lòng nhập URL ảnh thủ công bên dưới.');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange?.('');
        setPreviewUrl('');
        setError('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value.trim();
        onChange?.(url);
        if (url) {
            setPreviewUrl(uploadApi.getPreviewUrl(url));
        } else {
            setPreviewUrl('');
        }
    };

    // Handle image load error
    const handleImageError = (e) => {
        console.warn('Image failed to load:', previewUrl);
        e.target.src = 'https://placehold.co/500x500/f3f4f6/9ca3af?text=Image+Not+Found';
    };

    return (
        <div className="space-y-4">
            {/* Preview */}
            {previewUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Thay đổi"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={uploading}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Xóa"
                        >
                            <XMarkIcon className="h-5 w-5 text-red-500" />
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-10 h-10 border-4 border-white border-b-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-white text-sm">Đang tải lên...</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${uploading ? 'cursor-wait' : ''
                        } ${dragActive
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
                        }`}
                >
                    {uploading ? (
                        <div className="text-center">
                            <div className="w-10 h-10 border-4 border-pink-200 border-b-pink-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Đang tải lên...</p>
                        </div>
                    ) : (
                        <>
                            <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 font-medium mb-1">
                                Kéo thả ảnh vào đây
                            </p>
                            <p className="text-xs text-gray-400">
                                hoặc click để chọn file
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                PNG, JPG, WEBP (max 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Hidden Input */}
            <input
                ref={inputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleChange}
                disabled={uploading}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                    <p className="font-medium">Lỗi:</p>
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="text-xs underline mt-1 hover:no-underline"
                    >
                        Đóng
                    </button>
                </div>
            )}

            {/* Manual URL Input */}
            <div>
                <p className="text-xs text-gray-400 mb-2">Hoặc nhập URL ảnh:</p>
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="input-field text-sm"
                    disabled={uploading}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
