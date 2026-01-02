import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ChatWidget from '../components/common/ChatWidget';

const UserLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />

            {/* Chat Widget - AI Chatbot */}
            <ChatWidget />
        </div>
    );
};

export default UserLayout;

