import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import articleApi from '../../../api/articleApi';
import {
    ArrowLeftIcon,
    PencilIcon,
    CheckCircleIcon,
    EyeIcon,
    CalendarIcon,
    UserIcon,
    TagIcon,
    ClockIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';

const ArticleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const response = await articleApi.getById(id);
                
                // Handle nested response
                let articleData = null;
                if (response?.data?.data) {
                    articleData = response.data.data;
                } else if (response?.data) {
                    articleData = response.data;
                } else {
                    articleData = response;
                }

                setArticle(articleData);
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(err.response?.data?.message || 'Không thể tải bài viết');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            DRAFT: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700' },
            SCHEDULED: { label: 'Đặt lịch', color: 'bg-yellow-100 text-yellow-700' },
            PUBLISHED: { label: 'Đã đăng', color: 'bg-green-100 text-green-700' },
            ARCHIVED: { label: 'Lưu trữ', color: 'bg-purple-100 text-purple-700' },
        };
        const { label, color } = config[status] || config.DRAFT;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                {label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-red-700 mb-2">Lỗi tải bài viết</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => navigate('/admin/articles')} className="btn-secondary">
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Không tìm thấy bài viết</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/articles')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Chi tiết bài viết</h1>
                        <p className="text-gray-500">ID: {article.id}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {article.status === 'PUBLISHED' && (
                        <a
                            href={`/news/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <GlobeAltIcon className="w-5 h-5" />
                            Xem công khai
                        </a>
                    )}
                    <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PencilIcon className="w-5 h-5" />
                        Chỉnh sửa
                    </Link>
                </div>
            </div>

            {/* Meta Info Card */}
            <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status */}
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                        {getStatusBadge(article.status)}
                    </div>

                    {/* Author */}
                    <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            Tác giả
                        </div>
                        <div className="font-medium text-gray-900">{article.author || 'Chưa rõ'}</div>
                    </div>

                    {/* Created */}
                    <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            Ngày tạo
                        </div>
                        <div className="font-medium text-gray-900">{formatDate(article.createdAt)}</div>
                    </div>

                    {/* Published */}
                    <div>
                        <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {article.status === 'SCHEDULED' ? 'Đặt lịch' : 'Ngày đăng'}
                        </div>
                        <div className="font-medium text-gray-900">
                            {article.status === 'SCHEDULED' && article.scheduledAt
                                ? formatDate(article.scheduledAt)
                                : formatDate(article.publishedAt)}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                {article.tags && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <TagIcon className="w-4 h-4" />
                            Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.split(',').map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Generated */}
                {article.aiGenerated && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-purple-600">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Bài viết được tạo bằng AI</span>
                        </div>
                        {article.aiPrompt && (
                            <p className="text-sm text-gray-600 mt-2">Prompt: {article.aiPrompt}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Content Preview */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {/* Thumbnail */}
                {article.thumbnail && (
                    <div className="w-full h-96 bg-gray-100">
                        <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                <div className="p-8">
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>

                    {/* Slug */}
                    <div className="text-sm text-gray-500 mb-4">
                        <span className="font-medium">Slug:</span> {article.slug}
                    </div>

                    {/* Summary */}
                    {article.summary && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-gray-700 italic text-lg">{article.summary}</p>
                        </div>
                    )}

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/admin/articles')}
                    className="btn-secondary"
                >
                    Quay lại danh sách
                </button>

                <Link
                    to={`/admin/articles/edit/${article.id}`}
                    className="btn-primary flex items-center gap-2"
                >
                    <PencilIcon className="w-5 h-5" />
                    Chỉnh sửa bài viết
                </Link>
            </div>
        </div>
    );
};

export default ArticleDetail;
