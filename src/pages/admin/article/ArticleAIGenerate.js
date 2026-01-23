import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../../../api/articleApi';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import {
    ArrowLeftIcon,
    SparklesIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ArticleAIGenerate = () => {
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        tone: 'am ap, tu van',
        keywords: '',
        length: 'vua',
        callToAction: true,
        author: 'AI Bot',
    });
    const [generatedArticle, setGeneratedArticle] = useState(null);
    const { toasts, notify, removeToast } = useNotification();

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Generate with AI
    const handleGenerate = async () => {
        if (!formData.topic.trim()) {
            notify.error('Vui long nhap chu de bai viet', 'Loi');
            return;
        }

        setGenerating(true);
        setGeneratedArticle(null);

        try {
            const requestData = {
                topic: formData.topic,
                tone: formData.tone,
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
                length: formData.length,
                callToAction: formData.callToAction,
                author: formData.author,
            };

            const response = await articleApi.generateWithAI(requestData);
            const article = response?.data || response;

            setGeneratedArticle(article);
            notify.success('Da tao bai viet tu AI!', 'Thanh cong');
        } catch (err) {
            console.error('AI Generate error:', err);
            notify.error(
                err.response?.data?.message || 'Khong the tao bai viet. Vui long thu lai.',
                'Loi AI'
            );
        } finally {
            setGenerating(false);
        }
    };

    // Navigate to edit the generated article
    const handleEdit = () => {
        if (generatedArticle?.savedArticleId) {
            navigate(`/admin/articles/edit/${generatedArticle.savedArticleId}`);
        }
    };

    // Publish the generated article
    const handlePublish = async () => {
        if (!generatedArticle?.savedArticleId) return;

        try {
            await articleApi.publish(generatedArticle.savedArticleId);
            notify.success('Da dang bai viet!', 'Thanh cong');
            setTimeout(() => navigate('/admin/articles'), 1000);
        } catch (err) {
            notify.error('Khong the dang bai viet', 'Loi');
        }
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/articles')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <SparklesIcon className="w-7 h-7 text-purple-500" />
                            Tao bai viet bang AI
                        </h1>
                        <p className="text-gray-500">Su dung Gemini AI de tu dong tao noi dung</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thong tin bai viet</h2>

                            {/* Topic */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chu de <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    placeholder="Vi du: Y nghia hoa hong do ngay Valentine..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Tone */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giong van
                                </label>
                                <select
                                    name="tone"
                                    value={formData.tone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="am ap, tu van">Am ap, tu van</option>
                                    <option value="chuyen nghiep">Chuyen nghiep</option>
                                    <option value="tre trung, nang dong">Tre trung, nang dong</option>
                                    <option value="trang trong, lich su">Trang trong, lich su</option>
                                </select>
                            </div>

                            {/* Keywords */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tu khoa SEO
                                </label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="hoa hong, valentine, qua tang"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Phan cach bang dau phay</p>
                            </div>

                            {/* Length */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Do dai bai viet
                                </label>
                                <div className="flex gap-4">
                                    {['ngan', 'vua', 'dai'].map((len) => (
                                        <label key={len} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="length"
                                                value={len}
                                                checked={formData.length === len}
                                                onChange={handleChange}
                                                className="text-purple-500 focus:ring-purple-500"
                                            />
                                            <span className="capitalize">{len}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="callToAction"
                                        checked={formData.callToAction}
                                        onChange={handleChange}
                                        className="rounded text-purple-500 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">Them loi keu goi hanh dong (CTA)</span>
                                </label>
                            </div>

                            {/* Author */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tac gia
                                </label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 py-3"
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Dang tao bai viet...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        Tao bai viet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-soft p-6 min-h-96">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <EyeIcon className="w-5 h-5" />
                                Xem truoc
                            </h2>

                            {!generatedArticle && !generating && (
                                <div className="text-center py-12 text-gray-400">
                                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Nhap thong tin va nhan "Tao bai viet"</p>
                                    <p className="text-sm mt-2">AI se tu dong tao noi dung cho ban</p>
                                </div>
                            )}

                            {generating && (
                                <div className="text-center py-12">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                    <p className="text-gray-500 mt-6">AI dang viet bai...</p>
                                </div>
                            )}

                            {generatedArticle && (
                                <div className="space-y-4">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {generatedArticle.title}
                                    </h3>

                                    {/* Summary */}
                                    {generatedArticle.summary && (
                                        <p className="text-gray-600 italic">
                                            {generatedArticle.summary}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {generatedArticle.tagsSuggestion && (
                                        <div className="flex flex-wrap gap-2">
                                            {generatedArticle.tagsSuggestion.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Content Preview */}
                                    <div
                                        className="prose prose-sm max-w-none border-t pt-4"
                                        dangerouslySetInnerHTML={{ __html: generatedArticle.content }}
                                    />

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={handleEdit}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                            Chinh sua
                                        </button>
                                        <button
                                            onClick={handlePublish}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Dang ngay
                                        </button>
                                    </div>

                                    {/* Saved Article Info */}
                                    {generatedArticle.savedArticleId && (
                                        <p className="text-xs text-gray-500">
                                            Bai viet da luu voi ID: {generatedArticle.savedArticleId} (DRAFT)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleAIGenerate;
