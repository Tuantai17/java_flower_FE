/**
 * Settings Page - Trang Cài Đặt Admin
 * 
 * Cấu trúc modular với nhiều tab cài đặt
 * Dễ dàng mở rộng và tùy chỉnh
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Cog6ToothIcon,
    BuildingStorefrontIcon,
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    PaintBrushIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    CheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ============================================
// CONSTANTS
// ============================================

const TABS = [
    { id: 'general', label: 'Cửa hàng', icon: BuildingStorefrontIcon },
    { id: 'account', label: 'Tài khoản', icon: UserCircleIcon },
    { id: 'notifications', label: 'Thông báo', icon: BellIcon },
    { id: 'security', label: 'Bảo mật', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Giao diện', icon: PaintBrushIcon },
    { id: 'policies', label: 'Chính sách', icon: DocumentTextIcon },
];

// Default settings
const DEFAULT_SETTINGS = {
    // General
    storeName: 'FlowerCorner',
    storeEmail: 'contact@flowercorner.vn',
    storePhone: '0901234567',
    storeAddress: '123 Đường Hoa, Quận 1, TP.HCM',
    storeLogo: '',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',

    // Account
    adminName: 'Admin',
    adminEmail: 'admin@flowercorner.vn',
    adminAvatar: '',

    // Notifications
    emailNotifications: true,
    orderNotifications: true,
    stockNotifications: true,
    reviewNotifications: true,
    marketingEmails: false,

    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,

    // Appearance
    theme: 'light',
    sidebarCollapsed: false,
    tableRowsPerPage: 10,

    // Policies
    returnPolicy: '',
    privacyPolicy: '',
    termsOfService: '',
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Tab Button
const TabButton = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={() => onClick(tab.id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all
                ${isActive
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{tab.label}</span>
        </button>
    );
};

// Input Field
const InputField = ({ label, type = 'text', value, onChange, placeholder, helpText }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                       focus:ring-pink-500 focus:border-transparent transition-all"
        />
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
);

// Textarea Field
const TextareaField = ({ label, value, onChange, placeholder, rows = 4, helpText }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                       focus:ring-pink-500 focus:border-transparent transition-all resize-none"
        />
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
);

// Toggle Switch
const ToggleSwitch = ({ label, description, enabled, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
        <div>
            <p className="font-medium text-gray-800">{label}</p>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-pink-500' : 'bg-gray-300'
                }`}
        >
            <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

// Select Field
const SelectField = ({ label, value, onChange, options, helpText }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                       focus:ring-pink-500 focus:border-transparent transition-all bg-white"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
);

// Section Header
const SectionHeader = ({ title, description }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
);

// Save Button
const SaveButton = ({ onClick, loading, saved }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
            ${saved
                ? 'bg-green-500 text-white'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            } disabled:opacity-50`}
    >
        {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
        ) : saved ? (
            <CheckIcon className="h-5 w-5" />
        ) : null}
        {loading ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
    </button>
);

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

// General Settings Tab
const GeneralSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Thông tin cửa hàng"
            description="Cấu hình thông tin cơ bản của cửa hàng"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="Tên cửa hàng"
                value={settings.storeName}
                onChange={(val) => updateSetting('storeName', val)}
                placeholder="Nhập tên cửa hàng"
            />
            <InputField
                label="Email liên hệ"
                type="email"
                value={settings.storeEmail}
                onChange={(val) => updateSetting('storeEmail', val)}
                placeholder="email@example.com"
            />
            <InputField
                label="Số điện thoại"
                value={settings.storePhone}
                onChange={(val) => updateSetting('storePhone', val)}
                placeholder="0901234567"
            />
            <SelectField
                label="Đơn vị tiền tệ"
                value={settings.currency}
                onChange={(val) => updateSetting('currency', val)}
                options={[
                    { value: 'VND', label: 'VND - Việt Nam Đồng' },
                    { value: 'USD', label: 'USD - US Dollar' },
                ]}
            />
        </div>

        <TextareaField
            label="Địa chỉ cửa hàng"
            value={settings.storeAddress}
            onChange={(val) => updateSetting('storeAddress', val)}
            placeholder="Nhập địa chỉ đầy đủ"
            rows={2}
        />

        <SelectField
            label="Múi giờ"
            value={settings.timezone}
            onChange={(val) => updateSetting('timezone', val)}
            options={[
                { value: 'Asia/Ho_Chi_Minh', label: '(GMT+7) Hồ Chí Minh' },
                { value: 'Asia/Bangkok', label: '(GMT+7) Bangkok' },
                { value: 'Asia/Singapore', label: '(GMT+8) Singapore' },
            ]}
        />
    </div>
);

// Account Settings Tab
const AccountSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Thông tin tài khoản"
            description="Quản lý thông tin cá nhân của bạn"
        />

        <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl 
                           flex items-center justify-center text-white text-2xl font-bold">
                {settings.adminName?.charAt(0) || 'A'}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-800">{settings.adminName}</h4>
                <p className="text-gray-500">{settings.adminEmail}</p>
                <button className="mt-2 text-sm text-pink-600 hover:text-pink-700 font-medium">
                    Thay đổi ảnh đại diện
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
                label="Tên hiển thị"
                value={settings.adminName}
                onChange={(val) => updateSetting('adminName', val)}
                placeholder="Nhập tên của bạn"
            />
            <InputField
                label="Email"
                type="email"
                value={settings.adminEmail}
                onChange={(val) => updateSetting('adminEmail', val)}
                placeholder="email@example.com"
            />
        </div>

        <div className="pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-4">Đổi mật khẩu</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Mật khẩu hiện tại"
                    type="password"
                    value=""
                    onChange={() => { }}
                    placeholder="••••••••"
                />
                <InputField
                    label="Mật khẩu mới"
                    type="password"
                    value=""
                    onChange={() => { }}
                    placeholder="••••••••"
                />
            </div>
        </div>
    </div>
);

// Notifications Settings Tab
const NotificationsSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Cài đặt thông báo"
            description="Quản lý cách bạn nhận thông báo"
        />

        <div className="bg-white rounded-2xl border border-gray-100">
            <div className="p-6">
                <h4 className="font-medium text-gray-800 mb-2">Thông báo Email</h4>
                <ToggleSwitch
                    label="Nhận thông báo qua email"
                    description="Nhận thông báo quan trọng qua email"
                    enabled={settings.emailNotifications}
                    onChange={(val) => updateSetting('emailNotifications', val)}
                />
                <ToggleSwitch
                    label="Thông báo đơn hàng mới"
                    description="Nhận thông báo khi có đơn hàng mới"
                    enabled={settings.orderNotifications}
                    onChange={(val) => updateSetting('orderNotifications', val)}
                />
                <ToggleSwitch
                    label="Cảnh báo tồn kho"
                    description="Nhận thông báo khi sản phẩm sắp hết hàng"
                    enabled={settings.stockNotifications}
                    onChange={(val) => updateSetting('stockNotifications', val)}
                />
                <ToggleSwitch
                    label="Đánh giá mới"
                    description="Nhận thông báo khi có đánh giá mới"
                    enabled={settings.reviewNotifications}
                    onChange={(val) => updateSetting('reviewNotifications', val)}
                />
                <ToggleSwitch
                    label="Email marketing"
                    description="Nhận thông tin về tính năng mới và cập nhật"
                    enabled={settings.marketingEmails}
                    onChange={(val) => updateSetting('marketingEmails', val)}
                />
            </div>
        </div>
    </div>
);

// Security Settings Tab
const SecuritySettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Bảo mật"
            description="Bảo vệ tài khoản của bạn"
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <ToggleSwitch
                label="Xác thực hai yếu tố (2FA)"
                description="Thêm lớp bảo mật bổ sung cho tài khoản"
                enabled={settings.twoFactorAuth}
                onChange={(val) => updateSetting('twoFactorAuth', val)}
            />
            <ToggleSwitch
                label="Thông báo đăng nhập"
                description="Nhận thông báo khi có đăng nhập từ thiết bị mới"
                enabled={settings.loginNotifications}
                onChange={(val) => updateSetting('loginNotifications', val)}
            />
        </div>

        <SelectField
            label="Thời gian hết phiên (phút)"
            value={settings.sessionTimeout.toString()}
            onChange={(val) => updateSetting('sessionTimeout', parseInt(val))}
            options={[
                { value: '15', label: '15 phút' },
                { value: '30', label: '30 phút' },
                { value: '60', label: '1 giờ' },
                { value: '120', label: '2 giờ' },
            ]}
            helpText="Tự động đăng xuất sau thời gian không hoạt động"
        />

        <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
            <div className="flex items-start gap-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div>
                    <h4 className="font-medium text-yellow-800">Vùng nguy hiểm</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                        Các thao tác dưới đây không thể hoàn tác
                    </p>
                    <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm 
                                     hover:bg-red-600 transition-colors">
                        Xóa tất cả dữ liệu
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// Appearance Settings Tab
const AppearanceSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Giao diện"
            description="Tùy chỉnh giao diện admin panel"
        />

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Chủ đề</label>
            <div className="grid grid-cols-3 gap-4">
                {[
                    { value: 'light', label: 'Sáng', bg: 'bg-white', text: 'text-gray-800' },
                    { value: 'dark', label: 'Tối', bg: 'bg-gray-900', text: 'text-white' },
                    { value: 'system', label: 'Hệ thống', bg: 'bg-gradient-to-r from-white to-gray-900', text: 'text-gray-600' },
                ].map((theme) => (
                    <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === theme.value
                                ? 'border-pink-500 ring-2 ring-pink-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className={`h-16 rounded-lg ${theme.bg} mb-3 border border-gray-200`} />
                        <p className="text-sm font-medium text-gray-700">{theme.label}</p>
                    </button>
                ))}
            </div>
        </div>

        <SelectField
            label="Số dòng trên mỗi trang"
            value={settings.tableRowsPerPage.toString()}
            onChange={(val) => updateSetting('tableRowsPerPage', parseInt(val))}
            options={[
                { value: '10', label: '10 dòng' },
                { value: '25', label: '25 dòng' },
                { value: '50', label: '50 dòng' },
                { value: '100', label: '100 dòng' },
            ]}
            helpText="Số lượng mục hiển thị trong các bảng dữ liệu"
        />

        <ToggleSwitch
            label="Thu gọn Sidebar"
            description="Tự động thu gọn menu bên khi màn hình nhỏ"
            enabled={settings.sidebarCollapsed}
            onChange={(val) => updateSetting('sidebarCollapsed', val)}
        />
    </div>
);

// Policies Settings Tab
const PoliciesSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-8">
        <SectionHeader
            title="Chính sách"
            description="Quản lý các chính sách của cửa hàng"
        />

        <TextareaField
            label="Chính sách đổi trả"
            value={settings.returnPolicy}
            onChange={(val) => updateSetting('returnPolicy', val)}
            placeholder="Nhập chính sách đổi trả hàng..."
            rows={6}
            helpText="Hiển thị trên trang checkout và chi tiết đơn hàng"
        />

        <TextareaField
            label="Chính sách bảo mật"
            value={settings.privacyPolicy}
            onChange={(val) => updateSetting('privacyPolicy', val)}
            placeholder="Nhập chính sách bảo mật thông tin..."
            rows={6}
        />

        <TextareaField
            label="Điều khoản dịch vụ"
            value={settings.termsOfService}
            onChange={(val) => updateSetting('termsOfService', val)}
            placeholder="Nhập điều khoản sử dụng dịch vụ..."
            rows={6}
        />
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
    }, []);

    // Update single setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    // Save settings
    const handleSave = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save to localStorage
            localStorage.setItem('adminSettings', JSON.stringify(settings));

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setLoading(false);
        }
    }, [settings]);

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettingsTab settings={settings} updateSetting={updateSetting} />;
            case 'account':
                return <AccountSettingsTab settings={settings} updateSetting={updateSetting} />;
            case 'notifications':
                return <NotificationsSettingsTab settings={settings} updateSetting={updateSetting} />;
            case 'security':
                return <SecuritySettingsTab settings={settings} updateSetting={updateSetting} />;
            case 'appearance':
                return <AppearanceSettingsTab settings={settings} updateSetting={updateSetting} />;
            case 'policies':
                return <PoliciesSettingsTab settings={settings} updateSetting={updateSetting} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Cog6ToothIcon className="h-8 w-8 text-pink-500" />
                        Cài đặt
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý cài đặt hệ thống và cấu hình cửa hàng
                    </p>
                </div>

                <SaveButton onClick={handleSave} loading={loading} saved={saved} />
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-soft p-4 space-y-2">
                        {TABS.map((tab) => (
                            <TabButton
                                key={tab.id}
                                tab={tab}
                                isActive={activeTab === tab.id}
                                onClick={setActiveTab}
                            />
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
