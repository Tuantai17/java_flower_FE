import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    CubeIcon,
    FolderIcon,
    UsersIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    TicketIcon,
    ArchiveBoxIcon,
    StarIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            title: 'Dashboard',
            path: '/admin',
            icon: HomeIcon,
        },
        {
            title: 'Sản phẩm',
            path: '/admin/products',
            icon: CubeIcon,
        },
        {
            title: 'Danh mục',
            path: '/admin/categories',
            icon: FolderIcon,
        },
        {
            title: 'Voucher',
            path: '/admin/vouchers',
            icon: TicketIcon,
        },
        {
            title: 'Đơn hàng',
            path: '/admin/orders',
            icon: ShoppingCartIcon,
        },
        {
            title: 'Tồn kho',
            path: '/admin/stock',
            icon: ArchiveBoxIcon,
        },
        {
            title: 'Khách hàng',
            path: '/admin/customers',
            icon: UsersIcon,
        },
        {
            title: 'Đánh giá',
            path: '/admin/reviews',
            icon: StarIcon,
        },
        {
            title: 'Banner',
            path: '/admin/banners',
            icon: PhotoIcon,
        },
        {
            title: 'Thống kê',
            path: '/admin/analytics',
            icon: ChartBarIcon,
        },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="admin-sidebar">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link to="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl">🌸</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">FlowerCorner</h1>
                        <p className="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto scrollbar-hide">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`admin-sidebar-link ${active ? 'active' : ''}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Divider */}
                <div className="my-6 mx-6 border-t border-white/10" />

                {/* Quick Links */}
                <div className="px-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Truy cập nhanh
                    </p>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/"
                                target="_blank"
                                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                <span>🌐</span>
                                <span>Xem website</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* User Section */}
            {/* <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-gray-400 truncate">admin@flowercorner.vn</p>
                    </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span>Đăng xuất</span>
                </button>
            </div> */}
        </aside>
    );
};

export default Sidebar;
