import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../../../api/articleApi';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import {
    ArrowLeftIcon,
    LinkIcon,
    CloudArrowDownIcon,
    EyeIcon,
    PencilIcon,
    CheckCircleIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';

const ArticleImport = () => {
    const navigate = useNavigate();
    const [importing, setImporting] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        defaultAuthor: 'FlowerCorner Team',
        defaultTags: '',
        customThumbnail: '',
    });
    const [importedArticle, setImportedArticle] = useState(null);
    const { toasts, notify, removeToast } = useNotification();

    // Supported sources
    const supportedSources = [
        { name: 'VnExpress', domain: 'vnexpress.net', color: 'text-red-600' },
        { name: 'Kenh14', domain: 'kenh14.vn', color: 'text-orange-500' },
        { name: 'Dan Tri', domain: 'dantri.com.vn', color: 'text-blue-600' },
        { name: 'Tuoi Tre', domain: 'tuoitre.vn', color: 'text-green-600' },
        { name: '24h', domain: '24h.com.vn', color: 'text-purple-600' },
    ];

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Import from URL
    const handleImport = async () => {
        if (!formData.url.trim()) {
            notify.error('Vui long nhap URL bai viet', 'Loi');
            return;
        }

        // Validate URL format
        try {
            new URL(formData.url);
        } catch {
            notify.error('URL khong hop le', 'Loi');
            return;
        }

        setImporting(true);
        setImportedArticle(null);

        try {
            const response = await articleApi.importFromUrl(formData);
            console.log('Import response:', response);
            
            // Handle nested response structure: response.data.data or response.data or response
            let article = null;
            if (response?.data?.data) {
                article = response.data.data;
            } else if (response?.data) {
                article = response.data;
            } else {
                article = response;
            }
            
            console.log('Extracted article:', article);
            setImportedArticle(article);
            notify.success('Da import bai viet thanh cong!', 'Thanh cong');
        } catch (err) {
            console.error('Import error:', err);
            notify.error(
                err.response?.data?.message || 'Khong the import bai viet. Vui long kiem tra URL.',
                'Loi Import'
            );
        } finally {
            setImporting(false);
        }
    };

    // Navigate to edit the imported article
    const handleEdit = () => {
        if (importedArticle?.id) {
            navigate(`/admin/articles/edit/${importedArticle.id}`);
        }
    };

    // Publish the imported article
    const handlePublish = async () => {
        if (!importedArticle?.id) return;

        try {
            await articleApi.publish(importedArticle.id);
            notify.success('Da dang bai viet!', 'Thanh cong');
            setTimeout(() => navigate('/admin/articles'), 1000);
        } catch (err) {
            notify.error('Khong the dang bai viet', 'Loi');
        }
    };

    // Detect source from URL
    const detectSource = (url) => {
        if (!url) return null;
        for (const source of supportedSources) {
            if (url.includes(source.domain)) {
                return source;
            }
        }
        return { name: 'Website khac', domain: '', color: 'text-gray-600' };
    };

    const detectedSource = detectSource(formData.url);

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
                            <CloudArrowDownIcon className="w-7 h-7 text-blue-500" />
                            Import bai viet tu website khac
                        </h1>
                        <p className="text-gray-500">Tu dong crawl noi dung tu cac trang tin tuc</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Form */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nhap URL bai viet</h2>

                            {/* Supported Sources */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-2">Ho tro cac nguon:</p>
                                <div className="flex flex-wrap gap-2">
                                    {supportedSources.map((source) => (
                                        <span
                                            key={source.domain}
                                            className={`px-2 py-1 bg-gray-100 rounded-full text-xs font-medium ${source.color}`}
                                        >
                                            {source.name}
                                        </span>
                                    ))}
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                                        + Website khac
                                    </span>
                                </div>
                            </div>

                            {/* URL */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL bai viet <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleChange}
                                        placeholder="https://vnexpress.net/bai-viet-abc-123.html"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {detectedSource && formData.url && (
                                    <p className={`text-xs mt-1 ${detectedSource.color}`}>
                                        <GlobeAltIcon className="w-3 h-3 inline mr-1" />
                                        Nguon: {detectedSource.name}
                                    </p>
                                )}
                            </div>

                            {/* Default Author */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tac gia mac dinh
                                </label>
                                <input
                                    type="text"
                                    name="defaultAuthor"
                                    value={formData.defaultAuthor}
                                    onChange={handleChange}
                                    placeholder="FlowerCorner Team"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Su dung neu khong lay duoc tu bai goc</p>
                            </div>

                            {/* Default Tags */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags mac dinh
                                </label>
                                <input
                                    type="text"
                                    name="defaultTags"
                                    value={formData.defaultTags}
                                    onChange={handleChange}
                                    placeholder="tin tuc, hoa, su kien"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Phan cach bang dau phay</p>
                            </div>

                            {/* Custom Thumbnail */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL hinh anh thay the (optional)
                                </label>
                                <input
                                    type="url"
                                    name="customThumbnail"
                                    value={formData.customThumbnail}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">De trong de lay hinh tu bai goc</p>
                            </div>

                            {/* Import Button */}
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="w-full btn-primary bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex items-center justify-center gap-2 py-3"
                            >
                                {importing ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Dang import...
                                    </>
                                ) : (
                                    <>
                                        <CloudArrowDownIcon className="w-5 h-5" />
                                        Import bai viet
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-medium text-blue-800 mb-2">Luu y:</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Bai viet se duoc luu dang DRAFT de ban xem lai truoc khi dang</li>
                                <li>• Nen chinh sua noi dung de phu hop voi website cua ban</li>
                                <li>• Nhung bai lien quan den hoa, qua tang se phu hop hon</li>
                                <li>• Kiem tra ban quyen truoc khi su dung</li>
                            </ul>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-soft p-6 min-h-96">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <EyeIcon className="w-5 h-5" />
                                Xem truoc
                            </h2>

                            {!importedArticle && !importing && (
                                <div className="text-center py-12 text-gray-400">
                                    <CloudArrowDownIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Nhap URL va nhan "Import bai viet"</p>
                                    <p className="text-sm mt-2">Noi dung se duoc tu dong lay ve</p>
                                </div>
                            )}

                            {importing && (
                                <div className="text-center py-12">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                    <p className="text-gray-500 mt-6">Dang crawl noi dung...</p>
                                </div>
                            )}

                            {importedArticle && (
                                <div className="space-y-4">
                                    {/* Thumbnail */}
                                    {importedArticle.thumbnail && (
                                        <div className="rounded-lg overflow-hidden">
                                            <img
                                                src={importedArticle.thumbnail}
                                                alt={importedArticle.title || 'Thumbnail'}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {importedArticle.title || 'Chua co tieu de'}
                                    </h3>

                                    {/* Summary */}
                                    {importedArticle.summary && (
                                        <p className="text-gray-600 italic">
                                            {importedArticle.summary}
                                        </p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                        <span>Tac gia: {importedArticle.author || 'Chua ro'}</span>
                                        {importedArticle.tags && (
                                            <span>Tags: {importedArticle.tags}</span>
                                        )}
                                    </div>

                                    {/* Content Preview */}
                                    {importedArticle.content ? (
                                        <div
                                            className="prose prose-sm max-w-none border-t pt-4 max-h-64 overflow-y-auto"
                                            dangerouslySetInnerHTML={{
                                                __html: importedArticle.content.length > 1000 
                                                    ? importedArticle.content.substring(0, 1000) + '...'
                                                    : importedArticle.content
                                            }}
                                        />
                                    ) : (
                                        <p className="text-gray-400 italic border-t pt-4">Khong lay duoc noi dung</p>
                                    )}

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

                                    {/* Saved Info */}
                                    <p className="text-xs text-gray-500">
                                        Bai viet da luu voi ID: {importedArticle.id || 'N/A'} (DRAFT)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ArticleImport;
