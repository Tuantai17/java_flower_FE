import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import articleApi from '../../../api/articleApi';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import {
    ArrowLeftIcon,
    PhotoIcon,
    ClockIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

const ArticleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        thumbnail: '',
        tags: '',
        author: '',
    });
    const [currentStatus, setCurrentStatus] = useState('DRAFT');
    const [scheduledAt, setScheduledAt] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const { toasts, notify, removeToast } = useNotification();

    // Load article data if editing
    useEffect(() => {
        if (isEdit) {
            loadArticle();
        }
    }, [id]);

    const loadArticle = async () => {
        setLoading(true);
        try {
            const response = await articleApi.getById(id);
            const article = response?.data || response;

            setFormData({
                title: article.title || '',
                summary: article.summary || '',
                content: article.content || '',
                thumbnail: article.thumbnail || '',
                tags: article.tags || '',
                author: article.author || '',
            });
            setCurrentStatus(article.status || 'DRAFT');
            if (article.scheduledAt) {
                setScheduledAt(article.scheduledAt.slice(0, 16));
            }
        } catch (err) {
            notify.error('Khong the tai bai viet', 'Loi');
            navigate('/admin/articles');
        } finally {
            setLoading(false);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save as Draft
    const handleSaveDraft = async () => {
        if (!formData.title.trim()) {
            notify.error('Vui long nhap tieu de', 'Loi');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await articleApi.update(id, formData);
                notify.success('Da cap nhat bai viet', 'Thanh cong');
            } else {
                const response = await articleApi.create(formData);
                const newId = response?.data?.id || response?.id;
                notify.success('Da tao bai viet nhap', 'Thanh cong');
                if (newId) {
                    navigate(`/admin/articles/edit/${newId}`);
                }
            }
        } catch (err) {
            notify.error(err.response?.data?.message || 'Khong the luu bai viet', 'Loi');
        } finally {
            setSaving(false);
        }
    };

    // Publish Now
    const handlePublish = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            notify.error('Vui long nhap tieu de va noi dung', 'Loi');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                // Update then publish
                await articleApi.update(id, formData);
                await articleApi.publish(id);
            } else {
                // Create then publish
                const response = await articleApi.create(formData);
                const newId = response?.data?.id || response?.id;
                if (newId) {
                    await articleApi.publish(newId);
                }
            }
            notify.success('Da dang bai viet', 'Thanh cong');
            setTimeout(() => navigate('/admin/articles'), 1000);
        } catch (err) {
            notify.error(err.response?.data?.message || 'Khong the dang bai viet', 'Loi');
        } finally {
            setSaving(false);
        }
    };

    // Schedule
    const handleSchedule = async () => {
        if (!scheduledAt) {
            notify.error('Vui long chon thoi gian dat lich', 'Loi');
            return;
        }

        const scheduleDateTime = new Date(scheduledAt);
        if (scheduleDateTime <= new Date()) {
            notify.error('Thoi gian dat lich phai lon hon hien tai', 'Loi');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await articleApi.update(id, formData);
                await articleApi.schedule(id, scheduledAt);
            } else {
                const response = await articleApi.create(formData);
                const newId = response?.data?.id || response?.id;
                if (newId) {
                    await articleApi.schedule(newId, scheduledAt);
                }
            }
            notify.success('Da dat lich dang bai', 'Thanh cong');
            setShowScheduleModal(false);
            setTimeout(() => navigate('/admin/articles'), 1000);
        } catch (err) {
            notify.error(err.response?.data?.message || 'Khong the dat lich', 'Loi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

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
                            <h1 className="text-2xl font-bold text-gray-800">
                                {isEdit ? 'Chinh sua bai viet' : 'Tao bai viet moi'}
                            </h1>
                            {isEdit && (
                                <p className="text-sm text-gray-500">
                                    Trang thai: <span className="font-medium">{currentStatus}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveDraft}
                            disabled={saving}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <DocumentTextIcon className="w-5 h-5" />
                            Luu nhap
                        </button>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            disabled={saving}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <ClockIcon className="w-5 h-5" />
                            Dat lich
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Dang ngay
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tieu de <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Nhap tieu de bai viet..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg"
                            />
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tom tat
                            </label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                placeholder="Mo ta ngan gon noi dung bai viet..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            />
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Noi dung <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Nhap noi dung bai viet (ho tro HTML)..."
                                rows={15}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Ho tro HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Thumbnail */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <PhotoIcon className="w-5 h-5 inline mr-1" />
                                Hinh anh dai dien
                            </label>
                            <input
                                type="text"
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleChange}
                                placeholder="URL hinh anh..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            {formData.thumbnail && (
                                <img
                                    src={formData.thumbnail}
                                    alt="Preview"
                                    className="mt-3 w-full h-40 object-cover rounded-lg"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                        </div>

                        {/* Tags */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <TagIcon className="w-5 h-5 inline mr-1" />
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="tag1, tag2, tag3"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Phan cach bang dau phay
                            </p>
                        </div>

                        {/* Author */}
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tac gia
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                placeholder="Ten tac gia..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Dat lich dang bai</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thoi gian dang
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="btn-secondary"
                            >
                                Huy
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={saving}
                                className="btn-primary"
                            >
                                Xac nhan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ArticleForm;
