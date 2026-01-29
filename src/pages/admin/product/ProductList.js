import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ProductTable from '../../../components/admin/product/ProductTable';
import Pagination from '../../../components/common/Pagination';
import { ConfirmModal } from '../../../components/common/Modal';
import { useNotification, ToastContainer } from '../../../components/common/Notification';
import { StockAdjustModal } from '../../../components/admin/stock';
import productApi from '../../../api/productApi';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';
import uploadApi from '../../../api/uploadApi';
import categoryApi from '../../../api/categoryApi';

const ProductList = () => {

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importImages, setImportImages] = useState([]);
    const [importStatus, setImportStatus] = useState('idle'); // idle, processing, done
    const [importLogs, setImportLogs] = useState([]);

    const excelInputRef = useRef(null);
    const imageInputRef = useRef(null);

    // Initial Image Upload Logic (now part of modal flow)
    const handleImportClick = () => {
        setImportModalOpen(true);
        setImportStatus('idle');
        setImportFile(null);
        setImportImages([]);
        setImportLogs([]);
    };

    const handleExcelSelect = (e) => {
        const file = e.target.files[0];
        if (file) setImportFile(file);
    };

    const handleImagesSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImportImages(prev => [...prev, ...newFiles]);
        }
        // Reset input so same files can be selected again if needed
        e.target.value = '';
    };

    const runImportProcess = async () => {
        if (!importFile) {
            notify.error('Vui lòng chọn file Excel', 'Thiếu file');
            return;
        }

        setImportStatus('processing');
        setImportLogs(prev => [...prev, '⏳ Đang đọc file Excel...']);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                await processImportedData(data, importImages);
            } catch (error) {
                console.error('Error parsing Excel:', error);
                setImportLogs(prev => [...prev, `❌ Lỗi đọc file: ${error.message}`]);
                setImportStatus('done');
            }
        };
        reader.readAsBinaryString(importFile);
    };

    const processImportedData = async (data, images) => {
        if (!data || data.length === 0) {
            setImportLogs(prev => [...prev, '⚠️ File Excel trống']);
            setImportStatus('done');
            return;
        }

        setImportLogs(prev => [...prev, `📦 Tìm thấy ${data.length} dòng dữ liệu`]);
        let successCount = 0;
        let failCount = 0;

        const mapDataToProduct = (row) => {
            return {
                name: row['name'] || row['Name'] || row['Tên sản phẩm'] || '',
                slug: row['slug'] || row['Slug'] || null,
                description: row['description'] || row['Description'] || row['Mô tả'] || '',
                price: row['price'] || row['Price'] || row['Giá gốc'] || 0,
                salePrice: row['sale_price'] || row['Sale Price'] || row['Giá sale'] || null,
                stockQuantity: row['stock_quantity'] || row['Stock'] || row['Số lượng'] || row['Số lượng kho'] || 0,
                categoryId: row['category_id'] || row['Category ID'] || row['Danh mục'] || null, 
                thumbnail: row['thumbnail'] || row['Thumbnail'] || row['Ảnh'] || null,
                active: true
            };
        };

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowIndex = i + 1;
            let productData = mapDataToProduct(row);

            // Validate
            if (!productData.name || !productData.price || !productData.categoryId) {
                setImportLogs(prev => [...prev, `⚠️ Dòng ${rowIndex}: Thiếu thông tin (Tên/Giá/Danh mục)`]);
                failCount++;
                continue;
            }

            // Handle Image Upload
            if (productData.thumbnail && !productData.thumbnail.startsWith('http') && images.length > 0) {
                const imageFile = images.find(img => img.name === productData.thumbnail);
                if (imageFile) {
                    try {
                        setImportLogs(prev => [...prev, `⬆️ Đang upload ảnh: ${imageFile.name}...`]);
                        const uploadResponse = await uploadApi.uploadImage(imageFile, 'product');
                        const imageUrl = uploadApi.extractUrl(uploadResponse);
                        if (imageUrl) {
                            productData.thumbnail = imageUrl;
                        }
                    } catch (err) {
                        setImportLogs(prev => [...prev, `⚠️ Lỗi upload ảnh ${imageFile.name}: ${err.message}`]);
                    }
                } else {
                     setImportLogs(prev => [...prev, `⚠️ Không tìm thấy ảnh local: ${productData.thumbnail}`]);
                }
            }

            try {
                await productApi.create(productData);
                successCount++;
                setImportLogs(prev => [...prev, `✅ Đã tạo: ${productData.name}`]);
            } catch (err) {
                setImportLogs(prev => [...prev, `❌ Lỗi tạo ${productData.name}: ${err.message}`]);
                failCount++;
            }
        }

        setImportLogs(prev => [...prev, `🏁 Hoàn tất! Thành công: ${successCount}, Lỗi: ${failCount}`]);
        setImportStatus('done');
        if (successCount > 0) fetchProducts();
    };

    const handleDownloadTemplate = () => {
        // Create dummy data
        const templateData = [
            {
                'Tên sản phẩm': 'Giỏ Hoa Hồng',
                'Slug': 'gio-hoa-hong',
                'Mô tả': 'Giỏ hoa hồng đẹp tặng sinh nhật.',
                'Giá gốc': 500000,
                'Giá sale': 450000,
                'Số lượng kho': 100,
                'Danh mục': 1,
                'Ảnh': 'giohoahong.jpg' // Chỉ điền tên file
            },
            {
                'Tên sản phẩm': 'Bó Hoa Hướng Dương',
                'Slug': 'bo-hoa-huong-duong',
                'Mô tả': 'Hoa hướng dương rực rỡ.',
                'Giá gốc': 300000,
                'Giá sale': null,
                'Số lượng kho': 50,
                'Danh mục': 2,
                'Ảnh': 'hoahuongduong.png'
            }
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);

        // Adjust column widths
        const wscols = [
            { wch: 30 }, // Name
            { wch: 25 }, // Slug
            { wch: 50 }, // Description
            { wch: 15 }, // Price
            { wch: 15 }, // Sale Price
            { wch: 15 }, // Stock
            { wch: 10 }, // Cat ID
            { wch: 30 }  // Image
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, 'Mau_Import_SanPham');

        // Download
        XLSX.writeFile(wb, 'mau_import_san_pham.xlsx');
    };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    
    // Filter State
    const [filters, setFilters] = useState({
        keyword: '',
        categoryId: '',
        status: '' // 'active' | 'inactive'
    });

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    const [adjustModal, setAdjustModal] = useState({ isOpen: false, product: null });
    const { toasts, notify, removeToast } = useNotification();

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page]); // Keep dependency simple for now

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getAll();
            const cats = Array.isArray(data) ? data : (data.content || []);
            setCategories(cats);
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearchClick = () => {
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchProducts();
    };

    // Helper to find all descendant IDs from flat category list
    const getDescendantIds = (rootId, allCats) => {
        const rootIdNum = Number(rootId);
        let ids = [rootIdNum];
        // Find direct children
        const children = allCats.filter(c => Number(c.parentId) === rootIdNum);
        children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child.id, allCats)];
        });
        return ids;
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching products with params:', { page: pagination.page, ...filters });

            // 1. Fetch ALL products (Admin view)
            const allProductsResponse = await productApi.getAdminAll();
            let allProducts = Array.isArray(allProductsResponse) ? allProductsResponse : (allProductsResponse.content || []);

            // 2. Client-side Filtering
            let filtered = [...allProducts];

            // 2.1 Keyword Filter
            if (filters.keyword) {
                const lowerKeyword = filters.keyword.toLowerCase();
                filtered = filtered.filter(p => 
                    p.name?.toLowerCase().includes(lowerKeyword) || 
                    p.description?.toLowerCase().includes(lowerKeyword)
                );
            }

            // 2.2 Category Filter (Recursive)
            if (filters.categoryId) {
                const targetIds = getDescendantIds(filters.categoryId, categories);
                const targetIdsSet = new Set(targetIds);
                
                filtered = filtered.filter(p => {
                    const pCatId = p.categoryId ? Number(p.categoryId) : (p.category?.id ? Number(p.category.id) : null);
                    return pCatId && targetIdsSet.has(pCatId);
                });
            }

            // 2.3 Status Filter
            if (filters.status) {
                const isActive = filters.status === 'active';
                filtered = filtered.filter(p => p.active === isActive);
            }

            // 3. Sorting (Default: Newest first)
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // 4. Pagination
            const totalElements = filtered.length;
            const totalPages = Math.ceil(totalElements / pagination.size);
            const startIndex = pagination.page * pagination.size;
            const paginatedProducts = filtered.slice(startIndex, startIndex + pagination.size);

            console.log(`✅ Processed ${allProducts.length} products -> Filtered: ${totalElements}`);

            setProducts(paginatedProducts);
            setPagination(prev => ({
                ...prev,
                totalPages: totalPages || 1,
                totalElements: totalElements,
            }));

        } catch (error) {
            console.error('❌ Error fetching products:', error);
            const errorMessage = error.response?.data?.message
                || error.response?.statusText
                || error.message
                || 'Không thể tải sản phẩm. Vui lòng kiểm tra kết nối backend.';
            setError(errorMessage);
            setProducts([]);
            setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await productApi.delete(id);

            // Both hard delete and soft delete success - remove from list
            setProducts(products.filter((p) => p.id !== id));

            // Update pagination count
            setPagination(prev => ({
                ...prev,
                totalElements: prev.totalElements - 1,
                totalPages: Math.ceil((prev.totalElements - 1) / prev.size)
            }));

            if (result?.softDeleted) {
                // Soft delete was used
                notify.warning(
                    'Sản phẩm đang được sử dụng trong đơn hàng/giỏ hàng nên đã được ẩn thay vì xóa hoàn toàn.',
                    'Đã ẩn sản phẩm'
                );
            } else {
                // Hard delete successful
                notify.success('Đã xóa sản phẩm thành công!', 'Thành công');
            }
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Không thể xóa sản phẩm. Vui lòng thử lại sau.';
            notify.error(errorMessage, 'Lỗi xóa sản phẩm');
        } finally {
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    const handleToggleStatus = async (id) => {
        // Optimistic update first for better UX
        const originalProducts = [...products];
        setProducts(products.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
        ));

        try {
            await productApi.toggleStatus(id);
            console.log('✅ Product status toggled successfully');
        } catch (error) {
            console.error('❌ Error toggling status:', error);
            // Revert on error
            setProducts(originalProducts);
            const errorMessage = error.message ||
                error.response?.data?.message ||
                'Không thể thay đổi trạng thái sản phẩm.';
            notify.error(errorMessage, 'Lỗi cập nhật trạng thái');
        }
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, page: page - 1 });
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ 
            ...prev, 
            size: Number(newSize),
            page: 0 
        }));
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                        <p className="text-gray-500">Tổng cộng {pagination.totalElements} sản phẩm</p>
                    </div>
                    <div className="flex gap-2">

                        <button
                            onClick={handleDownloadTemplate}
                            className="btn-secondary flex items-center"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Tải mẫu Excel
                        </button>
                        <button 
                            onClick={handleImportClick}
                            className="btn-secondary flex items-center"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Import Excel
                        </button>
                        <Link to="/admin/products/create" className="btn-primary">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Thêm sản phẩm
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <select 
                            value={filters.categoryId}
                            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-[200px]"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select 
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 min-w-[150px]"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Đã ẩn</option>
                        </select>

                        <button 
                            onClick={handleSearchClick}
                            className="px-6 py-2.5 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <FunnelIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Lọc</span>
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-medium text-red-700 mb-2">Lỗi kết nối API</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Vui lòng kiểm tra backend đang chạy tại <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
                        </p>
                        <button
                            onClick={fetchProducts}
                            className="btn-primary"
                        >
                            🔄 Thử lại
                        </button>
                    </div>
                )}

                {/* Table */}
                {!error && (
                    <ProductTable
                        products={products}
                        loading={loading}
                        onDelete={(id) => setDeleteModal({ isOpen: true, productId: id })}
                        onToggleStatus={handleToggleStatus}
                        onAdjustStock={(product) => setAdjustModal({ isOpen: true, product })}
                    />
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={pagination.page + 1}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalElements}
                    pageSize={pagination.size}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                    onConfirm={() => handleDelete(deleteModal.productId)}
                    title="Xóa sản phẩm"
                    message="Bạn có chắc chắn muốn xóa sản phẩm này? Nếu sản phẩm đang được sử dụng trong đơn hàng, sản phẩm sẽ được ẩn thay vì xóa hoàn toàn."
                    confirmText="Xóa"
                    variant="danger"
                />

                {/* Stock Adjust Modal */}
                <StockAdjustModal
                    isOpen={adjustModal.isOpen}
                    onClose={() => setAdjustModal({ isOpen: false, product: null })}
                    product={adjustModal.product}
                    onSuccess={() => {
                        notify.success('Cập nhật tồn kho thành công!', 'Thành công');
                        fetchProducts();
                    }}
                />
                {/* Import Modal */}
                {importModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-800">Import Sản Phẩm</h3>
                                <button onClick={() => setImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                {/* Step 1: Excel File */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Chọn file Excel (.xlsx)</label>
                                    <div 
                                        onClick={() => excelInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors ${importFile ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${importFile ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <ArrowUpTrayIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{importFile ? importFile.name : 'Click để chọn file Excel'}</p>
                                                <p className="text-xs text-gray-500">{importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Hoặc kéo thả vào đây'}</p>
                                            </div>
                                        </div>
                                        <input ref={excelInputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelSelect} />
                                    </div>
                                </div>

                                {/* Step 2: Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        2. Chọn ảnh từ máy tính (Trong file Excel chỉ điền tên file, ví dụ: <code>giohoahong.jpg</code>)
                                    </label>
                                    <div 
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div 
                                                onClick={() => imageInputRef.current?.click()}
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                            >
                                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                                    <PhotoIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {importImages.length > 0 ? `Đã chọn ${importImages.length} ảnh` : 'Chọn thư mục/nhiều ảnh'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Giữ Ctrl/Shift để chọn nhiều. Có thể chọn nhiều lần để thêm vào.</p>
                                                </div>
                                            </div>
                                            
                                            {importImages.length > 0 && (
                                                <button 
                                                    onClick={() => setImportImages([])}
                                                    className="text-xs text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                                                >
                                                    Xóa tất cả
                                                </button>
                                            )}
                                        </div>
                                        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImagesSelect} />
                                    </div>
                                </div>

                                {/* Logs Console */}
                                {importLogs.length > 0 && (
                                    <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 h-48 overflow-y-auto">
                                        {importLogs.map((log, idx) => (
                                            <div key={idx} className="mb-1">{log}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setImportModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                                    disabled={importStatus === 'processing'}
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={runImportProcess}
                                    disabled={!importFile || importStatus === 'processing'}
                                    className={`px-6 py-2 rounded-lg font-medium text-white flex items-center gap-2
                                        ${!importFile || importStatus === 'processing' 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-lg'}`}
                                >
                                    {importStatus === 'processing' ? 'Đang xử lý...' : 'Tiến hành Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductList;
