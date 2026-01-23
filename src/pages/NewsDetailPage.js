import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articleApi from '../api/articleApi';
import { CalendarDaysIcon, UserCircleIcon, ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline';

const NewsDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await articleApi.getBySlug(slug);
                const data = res.data || res;
                // Check if wrapped in ApiResponse
                setArticle(data.data || data);
            } catch (err) {
                console.error("Failed to fetch article", err);
                if (err.response?.status === 404) {
                    setError('Bai viet khong ton tai hoac chua duoc dang');
                } else {
                    setError('Khong the tai bai viet');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        // Scroll to top
        window.scrollTo(0, 0);
    }, [slug]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle tag click
    const handleTagClick = (tag) => {
        navigate(`/news?tag=${encodeURIComponent(tag.trim())}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">📰</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {error || 'Bai viet khong ton tai'}
                </h2>
                <Link to="/news" className="text-rose-600 hover:underline">
                    Quay lai trang tin tuc
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Breadcrumb / Back Navigation */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container-custom py-4">
                    <Link
                        to="/news"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Quay lai tin tuc
                    </Link>
                </div>
            </div>

            <article className="container-custom max-w-4xl mx-auto pt-10">
                {/* Header Info */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* Summary */}
                    {article.summary && (
                        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                            {article.summary}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5 text-rose-500" />
                            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserCircleIcon className="w-5 h-5 text-rose-500" />
                            <span>{article.author || 'FlowerCorner'}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    {article.tags && (
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {article.tags.split(',').map((tag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleTagClick(tag)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm hover:bg-rose-200 transition-colors"
                                >
                                    <TagIcon className="w-3 h-3" />
                                    {tag.trim()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnail */}
                {article.thumbnail && (
                    <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-full h-auto object-cover max-h-[600px]"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-lg prose-rose max-w-none prose-headings:font-display prose-headings:font-bold prose-img:rounded-xl prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 italic">Cam on ban da doc bai viet nay.</p>
                        <Link
                            to="/news"
                            className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Xem them bai viet khac
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default NewsDetailPage;
