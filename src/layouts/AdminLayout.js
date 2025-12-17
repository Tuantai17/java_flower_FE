import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Navbar from '../components/admin/Navbar';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
                <Sidebar />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:ml-64 min-h-screen flex flex-col">
                {/* Navbar */}
                <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
                    <p>© {new Date().getFullYear()} FlowerCorner Admin Panel. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
