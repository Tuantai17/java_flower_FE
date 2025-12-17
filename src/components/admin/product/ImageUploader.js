import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import uploadApi from '../../../api/uploadApi';

const ImageUploader = ({
    value,
    onChange,
    folder = 'products',
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

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

        setUploading(true);

        try {
            const response = await uploadApi.uploadImage(file, folder);
            onChange?.(response.url || response);
        } catch (err) {
            console.error('Upload error:', err);
            // For demo, use object URL
            const objectUrl = URL.createObjectURL(file);
            onChange?.(objectUrl);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange?.('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Preview */}
            {value ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Thay đổi"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Xóa"
                        >
                            <XMarkIcon className="h-5 w-5 text-red-500" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${dragActive
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
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Manual URL Input */}
            <div>
                <p className="text-xs text-gray-400 mb-2">Hoặc nhập URL ảnh:</p>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="input-field text-sm"
                />
            </div>
        </div>
    );
};

export default ImageUploader;
