import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import uploadApi from '../../../api/uploadApi';

/**
 * ============================================
 * IMAGE UPLOADER COMPONENT
 * ============================================
 * 
 * Component upload ảnh với hỗ trợ:
 * - Drag & Drop
 * - Click để chọn file
 * - Preview ảnh trước/sau upload
 * - Progress indicator
 * - Nhập URL thủ công
 * 
 * @param {string} value - URL hiện tại của ảnh
 * @param {function} onChange - Callback khi URL thay đổi
 * @param {'product' | 'category' | 'user'} uploadType - Loại upload
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

    // Clear success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

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

    /**
     * Xử lý upload file
     */
    const handleFile = async (file) => {
        setError('');
        setSuccess('');
        setUploadProgress(0);

        // Validate file trước khi upload
        const validation = uploadApi.validateFile(file, { maxSize, acceptedTypes });
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        // Create local preview immediately for better UX
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setUploading(true);

        try {
            // Upload với progress tracking
            const response = await uploadApi.uploadWithProgress(
                file,
                uploadType,
                (progress) => setUploadProgress(progress)
            );

            // Trích xuất URL từ response
            const imageUrl = uploadApi.extractUrl(response);

            if (imageUrl) {
                // Revoke the local blob URL
                URL.revokeObjectURL(localPreview);

                // Update parent với server URL
                onChange?.(imageUrl);

                // Update preview với server URL
                setPreviewUrl(uploadApi.getPreviewUrl(imageUrl));

                // Hiển thị thông báo thành công
                setSuccess(`Upload thành công! URL: ${imageUrl.substring(0, 50)}...`);

                console.log('✅ Upload thành công:', imageUrl);
            } else {
                console.warn('Upload response không chứa URL:', response);
                setError('Upload thành công nhưng không nhận được URL. Vui lòng nhập URL thủ công.');
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

            // Hiển thị error message phù hợp
            handleUploadError(err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Xử lý lỗi upload
     */
    const handleUploadError = (err) => {
        const status = err.response?.status;
        const serverMessage = err.response?.data?.message;

        switch (status) {
            case 401:
                setError('⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                break;
            case 403:
                setError('🔒 Bạn cần đăng nhập với tài khoản Admin để upload ảnh.');
                break;
            case 404:
                setError('❌ Endpoint upload không tồn tại. Vui lòng kiểm tra backend.');
                break;
            case 413:
                setError('📦 File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
                break;
            case 415:
                setError('📄 Định dạng file không được hỗ trợ.');
                break;
            case 500:
                setError('🔧 Lỗi server. Vui lòng thử lại sau hoặc nhập URL thủ công.');
                break;
            default:
                setError(serverMessage || '❌ Lỗi khi tải ảnh. Vui lòng thử lại hoặc nhập URL thủ công.');
        }
    };

    const handleRemove = () => {
        onChange?.('');
        setPreviewUrl('');
        setError('');
        setSuccess('');
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
            {/* Preview with Image */}
            {previewUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={uploading}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Thay đổi ảnh"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={uploading}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title="Xóa ảnh"
                        >
                            <XMarkIcon className="h-5 w-5 text-red-500" />
                        </button>
                    </div>

                    {/* Upload progress overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 relative mb-3">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="white"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={175.93}
                                        strokeDashoffset={175.93 - (175.93 * uploadProgress) / 100}
                                        className="transition-all duration-300"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                                    {uploadProgress}%
                                </span>
                            </div>
                            <p className="text-white text-sm">Đang tải lên...</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Drop zone when no image */
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center 
                        ${uploading ? 'cursor-wait' : ''} 
                        ${dragActive
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/50'
                        }`}
                >
                    {uploading ? (
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-pink-200 border-b-pink-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-600 font-medium">Đang tải lên...</p>
                            <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
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

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Thành công!</p>
                        <p className="text-xs text-green-600 mt-1 break-all">{success}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                    <p className="font-medium">Lỗi upload:</p>
                    <p className="mt-1">{error}</p>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="text-xs underline mt-2 hover:no-underline"
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
                    placeholder="https://res.cloudinary.com/..."
                    className="input-field text-sm"
                    disabled={uploading}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
