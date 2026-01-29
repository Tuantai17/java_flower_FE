import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';
import { getImageUrl } from '../../../utils/imageUrl';
import { formatPrice } from '../../../utils/formatPrice';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { ConfirmModal } from '../../../components/common/Modal';
import { useNotification, ToastContainer } from '../../../components/common/Notification';

const CategoryProducts = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('Đang tải...');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    
    // Notification setup
    const { toasts, notify, removeToast } = useNotification();

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    // Helper to get descendant IDs
    const getDescendantIds = (rootId, allCats) => {
        const rootIdNum = Number(rootId);
        let ids = [rootIdNum];
        const children = allCats.filter(c => Number(c.parentId) === rootIdNum);
        children.forEach(child => {
            ids = [...ids, ...getDescendantIds(child.id, allCats)];
        });
        return ids;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Category Details (to show name)
            // Ideally we'd have a getById method, but if not we can find it in the full list
            const allCats = await categoryApi.getAll();
            const catsArray = Array.isArray(allCats) ? allCats : (allCats.content || []);
            
            const currentCat = catsArray.find(c => Number(c.id) === Number(categoryId));
            if (currentCat) {
                setCategoryName(currentCat.name);
            } else {
                setCategoryName('Danh mục không tồn tại');
            }

            // 2. Get All Admin Products
            const allProductsResponse = await productApi.getAdminAll();
            let allProducts = Array.isArray(allProductsResponse) ? allProductsResponse : (allProductsResponse.content || []);

            // 3. Filter by Category Tree
            const targetIds = getDescendantIds(categoryId, catsArray);
            const targetIdsSet = new Set(targetIds);

            const filtered = allProducts.filter(p => {
                const pCatId = p.categoryId ? Number(p.categoryId) : (p.category?.id ? Number(p.category.id) : null);
                return pCatId && targetIdsSet.has(pCatId);
            });

            // Sort newest first
            filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            setProducts(filtered);

        } catch (error) {
            console.error(error);
            notify.error('Không thể tải dữ liệu danh mục hoặc sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await productApi.delete(id);
            setProducts(products.filter(p => p.id !== id));
            
            if (result?.softDeleted) {
                notify.warning('Sản phẩm đã được ẩn (do đang sử dụng)', 'Đã ẩn');
            } else {
                notify.success('Đã xóa sản phẩm thành công', 'Thành công');
            }
        } catch (error) {
            notify.error('Lỗi khi xóa sản phẩm');
        } finally {
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    // Client-side search within this list
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link 
                    to="/admin/categories"
                    className="p-2 bg-white rounded-lg shadow-soft hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {categoryName}
                    </h1>
                    <p className="text-gray-500">
                        Danh sách sản phẩm thuộc danh mục này
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-soft p-4 flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trong danh sách này..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>
                <div className="text-sm font-medium text-gray-600">
                    {filteredProducts.length} sản phẩm
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg mb-2">Chưa có sản phẩm nào trong danh mục này</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100 text-left">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Sản phẩm</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Giá bán</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={getImageUrl(product.thumbnail)} 
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                                                    onError={(e) => e.target.src = 'https://placehold.co/64?text=Img'}
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-800 line-clamp-1">{product.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-rose-600">
                                                {formatPrice(product.salePrice || product.price)}
                                            </div>
                                            {product.salePrice && product.salePrice < product.price && (
                                                <div className="text-xs text-gray-400 line-through">
                                                    {formatPrice(product.price)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'}`}>
                                                {product.active ? 'Hoạt động' : 'Đã ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    to={`/admin/products/${product.id}`}
                                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link 
                                                    to={`/admin/products/edit/${product.id}`}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, productId: product.id })}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

             <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, productId: null })}
                onConfirm={() => handleDelete(deleteModal.productId)}
                title="Xóa sản phẩm"
                message="Bạn có chắc chắn muốn xóa sản phẩm này?"
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default CategoryProducts;
