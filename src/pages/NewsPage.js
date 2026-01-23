import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import articleApi from '../api/articleApi';
import { UserIcon, MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

const NewsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 9,
        totalPages: 0,
        totalElements: 0,
    });
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

    // Fetch articles
    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await articleApi.getPublicArticles(
                pagination.page,
                pagination.size,
                searchQuery,
                selectedTag
            );

            console.log('Public articles response:', response);

            // Handle response structure
            let articlesData = [];
            let totalPages = 1;
            let totalElements = 0;

            // Handle nested ApiResponse wrapper
            let pageData = null;
            
            if (response?.data?.data?.content) {
                // ApiResponse wrapper: { data: { data: { content: [...] } } }
                pageData = response.data.data;
            } else if (response?.data?.content) {
                // Direct axios response: { data: { content: [...] } }
                pageData = response.data;
            } else if (response?.content) {
                // Already unwrapped: { content: [...] }
                pageData = response;
            }

            if (pageData) {
                articlesData = pageData.content || [];
                totalPages = pageData.totalPages || 1;
                totalElements = pageData.totalElements || 0;
            } else if (Array.isArray(response?.data?.data)) {
                articlesData = response.data.data;
                totalElements = articlesData.length;
            } else if (Array.isArray(response?.data)) {
                articlesData = response.data;
                totalElements = articlesData.length;
            } else if (Array.isArray(response)) {
                articlesData = response;
                totalElements = articlesData.length;
            }

            console.log('Extracted articles:', articlesData);

            setArticles(articlesData);
            setPagination(prev => ({
                ...prev,
                totalPages,
                totalElements,
            }));
        } catch (error) {
            console.error("Failed to fetch articles", error);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.size, searchQuery, selectedTag]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 0 }));
        setSearchParams({ q: searchQuery, tag: selectedTag });
    };

    // Handle tag click
    const handleTagClick = (tag) => {
        setSelectedTag(tag);
        setPagination(prev => ({ ...prev, page: 0 }));
        setSearchParams({ q: searchQuery, tag });
    };

    // Clear filters
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag('');
        setPagination(prev => ({ ...prev, page: 0 }));
        setSearchParams({});
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (loading && articles.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 py-16 mb-12">
                <div className="container-custom text-center">
                    <h1 className="text-4xl font-display font-bold text-gray-800 mb-4">
                        Goc Cam Hung & Tin Tuc
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Kham pha nhung cau chuyen thu vi ve hoa, y nghia cac loai hoa va xu huong qua tang moi nhat.
                    </p>
                </div>
            </div>

            <div className="container-custom">
                {/* Search & Filter */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tim kiem bai viet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                        <button type="submit" className="btn-primary px-6">
                            Tim kiem
                        </button>
                        {(searchQuery || selectedTag) && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn-secondary px-6"
                            >
                                Xoa bo loc
                            </button>
                        )}
                    </form>

                    {/* Active filters */}
                    {selectedTag && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-500">Loc theo tag:</span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                                <TagIcon className="w-3 h-3" />
                                {selectedTag}
                                <button
                                    onClick={() => handleTagClick('')}
                                    className="ml-1 hover:text-rose-900"
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                    )}
                </div>

                {/* Results count */}
                {pagination.totalElements > 0 && (
                    <p className="text-gray-500 mb-6">
                        Tim thay {pagination.totalElements} bai viet
                    </p>
                )}

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">📰</div>
                        <p className="text-gray-500 text-lg">Chua co bai viet nao.</p>
                        {(searchQuery || selectedTag) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-rose-500 hover:underline"
                            >
                                Xoa bo loc de xem tat ca
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map(article => (
                                <Link
                                    to={`/news/${article.slug}`}
                                    key={article.id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="h-56 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                                        <img
                                            src={article.thumbnail || 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=800&auto=format&fit=crop&q=60'}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        />
                                        {article.publishedAt && (
                                            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-rose-600 shadow-sm">
                                                {formatDate(article.publishedAt)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h2 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-rose-600 line-clamp-2 transition-colors">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                                            {article.summary}
                                        </p>

                                        {/* Tags */}
                                        {article.tags && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {article.tags.split(',').slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleTagClick(tag.trim());
                                                        }}
                                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-rose-100 hover:text-rose-600 cursor-pointer transition-colors"
                                                    >
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
                                            <span className="flex items-center gap-1">
                                                <UserIcon className="w-3 h-3" />
                                                {article.author || 'FlowerCorner'}
                                            </span>
                                            <span className="text-rose-500 font-medium group-hover:translate-x-1 transition-transform">
                                                Doc tiep →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pagination.totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPagination(prev => ({ ...prev, page: i }))}
                                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                                            pagination.page === i
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-white text-gray-600 hover:bg-rose-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
