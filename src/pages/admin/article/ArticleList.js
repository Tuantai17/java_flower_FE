import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import articleApi from '../../../api/articleApi';
import Pagination from '../../../components/common/Pagination';
import { ConfirmModal } from '../../../components/common/Modal';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    DocumentTextIcon,
    SparklesIcon,
    CloudArrowDownIcon,
} from '@heroicons/react/24/outline';


// Status badge component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        DRAFT: { label: 'Nhap', color: 'bg-gray-100 text-gray-700', icon: DocumentTextIcon },
        SCHEDULED: { label: 'Dat lich', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
        PUBLISHED: { label: 'Da dang', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
        ARCHIVED: { label: 'Luu tru', color: 'bg-purple-100 text-purple-700', icon: ArchiveBoxIcon },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
};

const ArticleList = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, articleId: null, title: '' });
    const { toasts, notify, removeToast } = useNotification();

    // Fetch articles
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await articleApi.getAdminArticles(
                pagination.page,
                pagination.size,
                statusFilter,
                searchQuery
            );

            console.log('Admin articles response:', response);

            let articlesData = [];
            let totalPages = 1;
            let totalElements = 0;

            // Handle nested ApiResponse wrapper: response.data.data.content
            let pageData = null;
            
            if (response?.data?.data?.content) {
                // ApiResponse wrapper: { data: { data: { content: [...], totalPages, totalElements } } }
                pageData = response.data.data;
            } else if (response?.data?.content) {
                // Direct axios response: { data: { content: [...], totalPages, totalElements } }
                pageData = response.data;
            } else if (response?.content) {
                // Already unwrapped: { content: [...], totalPages, totalElements }
                pageData = response;
            }

            if (pageData) {
                articlesData = pageData.content || [];
                totalPages = pageData.totalPages || 1;
                totalElements = pageData.totalElements || 0;
            } else if (Array.isArray(response?.data?.data)) {
                // Non-paginated array: { data: { data: [...] } }
                articlesData = response.data.data;
                totalElements = articlesData.length;
            } else if (Array.isArray(response?.data)) {
                // Non-paginated array: { data: [...] }
                articlesData = response.data;
                totalElements = articlesData.length;
            }

            console.log('Extracted articles:', articlesData, 'Total:', totalElements);

            setArticles(articlesData);
            setPagination(prev => ({
                ...prev,
                totalPages,
                totalElements,
            }));
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError(err.response?.data?.message || 'Khong the tai danh sach bai viet');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size, statusFilter, searchQuery]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchArticles();
    };

    // Handle status change
    const handleStatusChange = async (id, newStatus, scheduledAt = null) => {
        try {
            if (newStatus === 'SCHEDULED' && !scheduledAt) {
                notify.error('Vui long chon thoi gian dat lich', 'Loi');
                return;
            }

            await articleApi.updateStatus(id, { status: newStatus, scheduledAt });
            notify.success(`Cap nhat trang thai thanh cong`, 'Thanh cong');
            fetchArticles();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Khong the cap nhat trang thai', 'Loi');
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            await articleApi.delete(deleteModal.articleId);
            notify.success('Da xoa bai viet', 'Thanh cong');
            setDeleteModal({ isOpen: false, articleId: null, title: '' });
            fetchArticles();
        } catch (err) {
            notify.error(err.response?.data?.message || 'Khong the xoa bai viet', 'Loi');
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page: page - 1 }));
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quan ly Tin tuc</h1>
                        <p className="text-gray-500">Tong cong {pagination.totalElements} bai viet</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/articles/import')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <CloudArrowDownIcon className="h-5 w-5" />
                            Import URL
                        </button>
                        <button
                            onClick={() => navigate('/admin/articles/ai-generate')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <SparklesIcon className="h-5 w-5" />
                            Tao bai bang AI
                        </button>
                        <Link to="/admin/articles/create" className="btn-primary flex items-center gap-2">
                            <PlusIcon className="h-5 w-5" />
                            Them bai viet
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tim kiem bai viet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, page: 0 }));
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">Tat ca trang thai</option>
                            <option value="DRAFT">Ban nhap</option>
                            <option value="SCHEDULED">Dat lich</option>
                            <option value="PUBLISHED">Da dang</option>
                            <option value="ARCHIVED">Luu tru</option>
                        </select>

                        <button type="submit" className="btn-primary">
                            Tim kiem
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-red-700 mb-2">Loi ket noi API</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchArticles} className="btn-primary">
                            Thu lai
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Dang tai...</p>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Bai viet
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Trang thai
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ngay tao
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ngay dang
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Thao tac
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {articles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>Chua co bai viet nao</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        articles.map((article) => (
                                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        {article.thumbnail ? (
                                                            <img
                                                                src={article.thumbnail}
                                                                alt={article.title}
                                                                className="w-16 h-12 object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-gray-900 truncate max-w-xs">
                                                                {article.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 truncate max-w-xs">
                                                                {article.summary || 'Chua co tom tat'}
                                                            </p>
                                                            {article.aiGenerated && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
                                                                    <SparklesIcon className="w-3 h-3" />
                                                                    AI Generated
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={article.status} />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(article.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {article.status === 'SCHEDULED' && article.scheduledAt ? (
                                                        <span className="text-yellow-600">
                                                            {formatDate(article.scheduledAt)}
                                                        </span>
                                                    ) : (
                                                        formatDate(article.publishedAt)
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Quick actions based on status */}
                                                        {article.status === 'DRAFT' && (
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'PUBLISHED')}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Dang ngay"
                                                            >
                                                                <CheckCircleIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {article.status === 'PUBLISHED' && (
                                                            <button
                                                                onClick={() => handleStatusChange(article.id, 'ARCHIVED')}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Luu tru"
                                                            >
                                                                <ArchiveBoxIcon className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        {/* View Detail */}
                                                        <Link
                                                            to={`/admin/articles/detail/${article.id}`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Xem chi tiet"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </Link>

                                                        {/* Edit */}
                                                        <Link
                                                            to={`/admin/articles/edit/${article.id}`}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Chinh sua"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                isOpen: true,
                                                                articleId: article.id,
                                                                title: article.title
                                                            })}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xoa"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.page + 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalElements}
                        pageSize={pagination.size}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Delete Modal */}
                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, articleId: null, title: '' })}
                    onConfirm={handleDelete}
                    title="Xoa bai viet"
                    message={`Ban co chac chan muon xoa bai viet "${deleteModal.title}"?`}
                    confirmText="Xoa"
                    variant="danger"
                />
            </div>
        </>
    );
};

export default ArticleList;
