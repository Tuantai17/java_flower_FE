import React from 'react';
import { Outlet } from 'react-router-dom';

const BlankLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
            <Outlet />
        </div>
    );
};

export default BlankLayout;
