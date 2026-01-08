import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getAllBanners, 
    deleteBanner, 
    toggleBannerActive 
} from '../../../api/bannerApi';
import { 
    FiEdit2, 
    FiTrash2, 
    FiEye, 
    FiEyeOff, 
    FiPlus,
    FiImage,
    FiCalendar,
    FiLink
} from 'react-icons/fi';
import { useNotification, ToastContainer } from '../../../components/common/Notification';

const BannerList = () => {
    const navigate = useNavigate();
    const { toasts, notify, removeToast } = useNotification();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await getAllBanners();
            if (response.success) {
                setBanners(response.data);
            }
        } catch (error) {
            notify.error('Lỗi khi tải danh sách banner');
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            const response = await toggleBannerActive(id);
            if (response.success) {
                notify.success('Cập nhật trạng thái thành công');
                fetchBanners();
            }
        } catch (error) {
            notify.error('Lỗi khi cập nhật trạng thái');
            console.error('Error toggling banner:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await deleteBanner(deleteModal.id);
            if (response.success) {
                notify.success('Xóa banner thành công');
                setDeleteModal({ show: false, id: null });
                fetchBanners();
            }
        } catch (error) {
            notify.error('Lỗi khi xóa banner');
            console.error('Error deleting banner:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không giới hạn';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Banner</h1>
                    <p className="text-gray-600 mt-1">Quản lý banner hiển thị trên trang chủ</p>
                </div>
                <button
                    onClick={() => navigate('/admin/banners/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                    <FiPlus /> Thêm Banner
                </button>
            </div>

            {/* Banners List */}
            {banners.length === 0 ? (
                <div className="text-center py-12">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có banner</h3>
                    <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo banner mới.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/admin/banners/create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                        >
                            <FiPlus className="mr-2" />
                            Thêm Banner
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Banner Image */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        banner.active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {banner.active ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                </div>
                            </div>

                            {/* Banner Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                                    {banner.title}
                                </h3>
                                
                                {banner.subtitle && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                        {banner.subtitle}
                                    </p>
                                )}

                                <div className="space-y-1 text-sm text-gray-500 mb-4">
                                    {banner.linkUrl && (
                                        <div className="flex items-center gap-2">
                                            <FiLink className="w-4 h-4" />
                                            <span className="truncate">{banner.linkUrl}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>
                                            {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Thứ tự:</span>
                                        <span>{banner.sortOrder}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/banners/edit/${banner.id}`)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(banner.id)}
                                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                                            banner.active
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                        title={banner.active ? 'Tạm dừng' : 'Kích hoạt'}
                                    >
                                        {banner.active ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ show: true, id: banner.id })}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                        title="Xóa"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default BannerList;
