/**
 * Settings Page - Trang Cài Đặt Admin
 * 
 * Cấu trúc modular với nhiều tab cài đặt
 * Dễ dàng mở rộng và tùy chỉnh
 * 
 * @version 2.0.0
 * @author FlowerCorner Team
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
    CurrencyDollarIcon,
    TruckIcon,
    CreditCardIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';

// ============================================
// CONSTANTS - Dễ dàng thay đổi cấu hình
// ============================================

/**
 * Danh sách các tab cài đặt
 * Thêm/sửa/xóa tab tại đây
 */
const SETTINGS_TABS = [
    { 
        id: 'store', 
        label: 'Cửa hàng', 
        icon: BuildingStorefrontIcon,
        description: 'Thông tin cơ bản của cửa hàng'
    },
    { 
        id: 'payment', 
        label: 'Thanh toán', 
        icon: CreditCardIcon,
        description: 'Cấu hình phương thức thanh toán'
    },
    { 
        id: 'shipping', 
        label: 'Vận chuyển', 
        icon: TruckIcon,
        description: 'Cài đặt phí và vùng giao hàng'
    },
    { 
        id: 'notifications', 
        label: 'Thông báo', 
        icon: BellIcon,
        description: 'Quản lý thông báo hệ thống'
    },
    { 
        id: 'security', 
        label: 'Bảo mật', 
        icon: ShieldCheckIcon,
        description: 'Cài đặt bảo mật tài khoản'
    },
    { 
        id: 'appearance', 
        label: 'Giao diện', 
        icon: PaintBrushIcon,
        description: 'Tùy chỉnh giao diện admin'
    },
    { 
        id: 'seo', 
        label: 'SEO & Mạng XH', 
        icon: GlobeAltIcon,
        description: 'Cấu hình SEO và mạng xã hội'
    },
    { 
        id: 'policies', 
        label: 'Chính sách', 
        icon: DocumentTextIcon,
        description: 'Quản lý chính sách cửa hàng'
    },
];

/**
 * Cài đặt mặc định
 * Thêm/sửa/xóa settings tại đây
 */
const DEFAULT_SETTINGS = {
    // === STORE SETTINGS ===
    storeName: 'FlowerCorner',
    storeEmail: 'contact@flowercorner.vn',
    storePhone: '0901234567',
    storeAddress: '123 Đường Hoa, Quận 1, TP.HCM',
    storeLogo: '',
    storeDescription: 'Cửa hàng hoa tươi cao cấp',
    businessHours: '8:00 - 22:00',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',

    // === PAYMENT SETTINGS ===
    codEnabled: true,
    bankTransferEnabled: true,
    vnpayEnabled: false,
    momoEnabled: false,
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',

    // === SHIPPING SETTINGS ===
    freeShippingThreshold: 500000,
    defaultShippingFee: 30000,
    expressShippingFee: 50000,
    maxDeliveryDays: 3,
    enableExpress: true,

    // === NOTIFICATION SETTINGS ===
    emailNotifications: true,
    orderNotifications: true,
    stockNotifications: true,
    reviewNotifications: true,
    newCustomerNotifications: true,
    lowStockThreshold: 10,

    // === SECURITY SETTINGS ===
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    maxLoginAttempts: 5,

    // === APPEARANCE SETTINGS ===
    theme: 'light',
    primaryColor: '#ec4899',
    sidebarCollapsed: false,
    tableRowsPerPage: 10,
    compactMode: false,

    // === SEO SETTINGS ===
    metaTitle: 'FlowerCorner - Hoa Tươi Cao Cấp',
    metaDescription: 'FlowerCorner - Cửa hàng hoa tươi cao cấp, giao hàng nhanh trong ngày',
    metaKeywords: 'hoa tươi, hoa sinh nhật, hoa cưới, flower shop',
    facebookUrl: '',
    instagramUrl: '',
    googleAnalyticsId: '',

    // === POLICY SETTINGS ===
    returnPolicy: '',
    privacyPolicy: '',
    termsOfService: '',
    shippingPolicy: '',
};

/**
 * Options cho các select field
 */
const OPTIONS = {
    currencies: [
        { value: 'VND', label: 'VND - Việt Nam Đồng' },
        { value: 'USD', label: 'USD - US Dollar' },
    ],
    timezones: [
        { value: 'Asia/Ho_Chi_Minh', label: '(GMT+7) Hồ Chí Minh' },
        { value: 'Asia/Bangkok', label: '(GMT+7) Bangkok' },
        { value: 'Asia/Singapore', label: '(GMT+8) Singapore' },
    ],
    sessionTimeouts: [
        { value: '15', label: '15 phút' },
        { value: '30', label: '30 phút' },
        { value: '60', label: '1 giờ' },
        { value: '120', label: '2 giờ' },
    ],
    tableRows: [
        { value: '10', label: '10 dòng' },
        { value: '25', label: '25 dòng' },
        { value: '50', label: '50 dòng' },
        { value: '100', label: '100 dòng' },
    ],
    themes: [
        { value: 'light', label: 'Sáng', preview: 'bg-white' },
        { value: 'dark', label: 'Tối', preview: 'bg-gray-900' },
        { value: 'system', label: 'Hệ thống', preview: 'bg-gradient-to-r from-white to-gray-900' },
    ],
};

// ============================================
// REUSABLE UI COMPONENTS
// ============================================

/**
 * Tab Button - Nút chọn tab
 */
const TabButton = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={() => onClick(tab.id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all
                ${isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            <span className="font-medium">{tab.label}</span>
        </button>
    );
};

/**
 * Input Field - Trường nhập liệu text
 */
const InputField = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    helpText,
    required = false,
    disabled = false,
    prefix,
    suffix,
}) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative flex">
            {prefix && (
                <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    {prefix}
                </span>
            )}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`flex-1 px-4 py-2.5 border border-gray-200 focus:ring-2 focus:ring-pink-500 
                           focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed
                           ${prefix ? 'rounded-r-xl' : suffix ? 'rounded-l-xl' : 'rounded-xl'}`}
            />
            {suffix && (
                <span className="inline-flex items-center px-4 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl text-gray-500 text-sm">
                    {suffix}
                </span>
            )}
        </div>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
);

/**
 * Textarea Field - Trường nhập liệu dạng textarea
 */
const TextareaField = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 4, 
    helpText,
    required = false,
}) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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

/**
 * Toggle Switch - Công tắc bật/tắt
 */
const ToggleSwitch = ({ label, description, enabled, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
        <div className="flex-1 pr-4">
            <p className="font-medium text-gray-800">{label}</p>
            {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0
                ${enabled ? 'bg-pink-500' : 'bg-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                    ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

/**
 * Select Field - Dropdown chọn giá trị
 */
const SelectField = ({ label, value, onChange, options, helpText, required = false }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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

/**
 * Section Card - Container cho nhóm cài đặt
 */
const SectionCard = ({ title, description, children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}>
        {title && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

/**
 * Alert Box - Hộp thông báo
 */
const AlertBox = ({ type = 'warning', title, message, action }) => {
    const styles = {
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
    };
    const icons = {
        warning: ExclamationTriangleIcon,
        danger: ExclamationTriangleIcon,
        info: Cog6ToothIcon,
        success: CheckIcon,
    };
    const Icon = icons[type];

    return (
        <div className={`p-5 rounded-xl border ${styles[type]}`}>
            <div className="flex items-start gap-4">
                <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm mt-1 opacity-80">{message}</p>
                    {action}
                </div>
            </div>
        </div>
    );
};

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

/**
 * Store Settings Tab - Cài đặt cửa hàng
 */
const StoreSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Thông tin cơ bản" description="Thông tin hiển thị của cửa hàng">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Tên cửa hàng"
                    value={settings.storeName}
                    onChange={(val) => updateSetting('storeName', val)}
                    placeholder="Nhập tên cửa hàng"
                    required
                />
                <InputField
                    label="Email liên hệ"
                    type="email"
                    value={settings.storeEmail}
                    onChange={(val) => updateSetting('storeEmail', val)}
                    placeholder="email@example.com"
                    required
                />
                <InputField
                    label="Số điện thoại"
                    value={settings.storePhone}
                    onChange={(val) => updateSetting('storePhone', val)}
                    placeholder="0901234567"
                />
                <InputField
                    label="Giờ làm việc"
                    value={settings.businessHours}
                    onChange={(val) => updateSetting('businessHours', val)}
                    placeholder="8:00 - 22:00"
                />
            </div>
            <div className="mt-6">
                <TextareaField
                    label="Địa chỉ cửa hàng"
                    value={settings.storeAddress}
                    onChange={(val) => updateSetting('storeAddress', val)}
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows={2}
                />
            </div>
            <div className="mt-6">
                <TextareaField
                    label="Mô tả cửa hàng"
                    value={settings.storeDescription}
                    onChange={(val) => updateSetting('storeDescription', val)}
                    placeholder="Giới thiệu ngắn về cửa hàng"
                    rows={2}
                />
            </div>
        </SectionCard>

        <SectionCard title="Cấu hình khu vực" description="Tiền tệ và múi giờ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                    label="Đơn vị tiền tệ"
                    value={settings.currency}
                    onChange={(val) => updateSetting('currency', val)}
                    options={OPTIONS.currencies}
                />
                <SelectField
                    label="Múi giờ"
                    value={settings.timezone}
                    onChange={(val) => updateSetting('timezone', val)}
                    options={OPTIONS.timezones}
                />
            </div>
        </SectionCard>
    </div>
);

/**
 * Payment Settings Tab - Cài đặt thanh toán
 */
const PaymentSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Phương thức thanh toán" description="Bật/tắt các phương thức thanh toán">
            <div className="space-y-0">
                <ToggleSwitch
                    label="Thanh toán khi nhận hàng (COD)"
                    description="Cho phép khách hàng thanh toán khi nhận hàng"
                    enabled={settings.codEnabled}
                    onChange={(val) => updateSetting('codEnabled', val)}
                />
                <ToggleSwitch
                    label="Chuyển khoản ngân hàng"
                    description="Thanh toán qua chuyển khoản ngân hàng"
                    enabled={settings.bankTransferEnabled}
                    onChange={(val) => updateSetting('bankTransferEnabled', val)}
                />
                <ToggleSwitch
                    label="VNPay"
                    description="Thanh toán qua cổng VNPay"
                    enabled={settings.vnpayEnabled}
                    onChange={(val) => updateSetting('vnpayEnabled', val)}
                />
                <ToggleSwitch
                    label="MoMo"
                    description="Thanh toán qua ví MoMo"
                    enabled={settings.momoEnabled}
                    onChange={(val) => updateSetting('momoEnabled', val)}
                />
            </div>
        </SectionCard>

        {settings.bankTransferEnabled && (
            <SectionCard title="Thông tin ngân hàng" description="Thông tin tài khoản nhận thanh toán">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Tên ngân hàng"
                        value={settings.bankName}
                        onChange={(val) => updateSetting('bankName', val)}
                        placeholder="VD: Vietcombank"
                    />
                    <InputField
                        label="Số tài khoản"
                        value={settings.bankAccountNumber}
                        onChange={(val) => updateSetting('bankAccountNumber', val)}
                        placeholder="Nhập số tài khoản"
                    />
                    <div className="md:col-span-2">
                        <InputField
                            label="Chủ tài khoản"
                            value={settings.bankAccountName}
                            onChange={(val) => updateSetting('bankAccountName', val)}
                            placeholder="Tên chủ tài khoản"
                        />
                    </div>
                </div>
            </SectionCard>
        )}
    </div>
);

/**
 * Shipping Settings Tab - Cài đặt vận chuyển
 */
const ShippingSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Phí vận chuyển" description="Cấu hình chi phí giao hàng">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Phí giao hàng tiêu chuẩn"
                    type="number"
                    value={settings.defaultShippingFee}
                    onChange={(val) => updateSetting('defaultShippingFee', parseInt(val) || 0)}
                    suffix="VND"
                />
                <InputField
                    label="Phí giao hàng nhanh"
                    type="number"
                    value={settings.expressShippingFee}
                    onChange={(val) => updateSetting('expressShippingFee', parseInt(val) || 0)}
                    suffix="VND"
                />
                <InputField
                    label="Miễn phí ship từ"
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(val) => updateSetting('freeShippingThreshold', parseInt(val) || 0)}
                    suffix="VND"
                    helpText="Đơn hàng từ giá trị này được miễn phí ship"
                />
                <InputField
                    label="Thời gian giao hàng tối đa"
                    type="number"
                    value={settings.maxDeliveryDays}
                    onChange={(val) => updateSetting('maxDeliveryDays', parseInt(val) || 1)}
                    suffix="ngày"
                />
            </div>
        </SectionCard>

        <SectionCard title="Tùy chọn vận chuyển">
            <ToggleSwitch
                label="Bật giao hàng nhanh"
                description="Cho phép khách hàng chọn giao hàng trong ngày"
                enabled={settings.enableExpress}
                onChange={(val) => updateSetting('enableExpress', val)}
            />
        </SectionCard>
    </div>
);

/**
 * Notifications Settings Tab - Cài đặt thông báo
 */
const NotificationsSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Thông báo Email" description="Cấu hình thông báo qua email">
            <div className="space-y-0">
                <ToggleSwitch
                    label="Bật thông báo email"
                    description="Nhận các thông báo quan trọng qua email"
                    enabled={settings.emailNotifications}
                    onChange={(val) => updateSetting('emailNotifications', val)}
                />
                <ToggleSwitch
                    label="Đơn hàng mới"
                    description="Thông báo khi có đơn hàng mới"
                    enabled={settings.orderNotifications}
                    onChange={(val) => updateSetting('orderNotifications', val)}
                    disabled={!settings.emailNotifications}
                />
                <ToggleSwitch
                    label="Cảnh báo tồn kho"
                    description="Thông báo khi sản phẩm sắp hết hàng"
                    enabled={settings.stockNotifications}
                    onChange={(val) => updateSetting('stockNotifications', val)}
                    disabled={!settings.emailNotifications}
                />
                <ToggleSwitch
                    label="Đánh giá mới"
                    description="Thông báo khi có đánh giá sản phẩm mới"
                    enabled={settings.reviewNotifications}
                    onChange={(val) => updateSetting('reviewNotifications', val)}
                    disabled={!settings.emailNotifications}
                />
                <ToggleSwitch
                    label="Khách hàng mới"
                    description="Thông báo khi có khách hàng đăng ký mới"
                    enabled={settings.newCustomerNotifications}
                    onChange={(val) => updateSetting('newCustomerNotifications', val)}
                    disabled={!settings.emailNotifications}
                />
            </div>
        </SectionCard>

        <SectionCard title="Ngưỡng cảnh báo">
            <InputField
                label="Cảnh báo tồn kho khi còn"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(val) => updateSetting('lowStockThreshold', parseInt(val) || 0)}
                suffix="sản phẩm"
                helpText="Gửi thông báo khi số lượng sản phẩm xuống dưới ngưỡng này"
            />
        </SectionCard>
    </div>
);

/**
 * Security Settings Tab - Cài đặt bảo mật
 */
const SecuritySettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Xác thực" description="Cài đặt xác thực và bảo mật">
            <div className="space-y-0">
                <ToggleSwitch
                    label="Xác thực hai yếu tố (2FA)"
                    description="Thêm lớp bảo mật bổ sung khi đăng nhập"
                    enabled={settings.twoFactorAuth}
                    onChange={(val) => updateSetting('twoFactorAuth', val)}
                />
                <ToggleSwitch
                    label="Thông báo đăng nhập"
                    description="Nhận email khi có đăng nhập từ thiết bị mới"
                    enabled={settings.loginNotifications}
                    onChange={(val) => updateSetting('loginNotifications', val)}
                />
            </div>
        </SectionCard>

        <SectionCard title="Phiên đăng nhập">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                    label="Thời gian hết phiên"
                    value={settings.sessionTimeout.toString()}
                    onChange={(val) => updateSetting('sessionTimeout', parseInt(val))}
                    options={OPTIONS.sessionTimeouts}
                    helpText="Tự động đăng xuất sau thời gian không hoạt động"
                />
                <InputField
                    label="Số lần đăng nhập sai tối đa"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(val) => updateSetting('maxLoginAttempts', parseInt(val) || 5)}
                    suffix="lần"
                    helpText="Khóa tài khoản sau số lần nhập sai"
                />
            </div>
        </SectionCard>

        <AlertBox
            type="danger"
            title="Vùng nguy hiểm"
            message="Các thao tác dưới đây không thể hoàn tác. Hãy cẩn thận!"
            action={
                <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm 
                                 hover:bg-red-600 transition-colors">
                    Xóa tất cả dữ liệu
                </button>
            }
        />
    </div>
);

/**
 * Appearance Settings Tab - Cài đặt giao diện
 */
const AppearanceSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Chủ đề" description="Chọn giao diện hiển thị">
            <div className="grid grid-cols-3 gap-4">
                {OPTIONS.themes.map((theme) => (
                    <button
                        key={theme.value}
                        onClick={() => updateSetting('theme', theme.value)}
                        className={`p-4 rounded-xl border-2 transition-all
                            ${settings.theme === theme.value
                                ? 'border-pink-500 ring-2 ring-pink-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className={`h-16 rounded-lg ${theme.preview} mb-3 border border-gray-200`} />
                        <p className="text-sm font-medium text-gray-700">{theme.label}</p>
                    </button>
                ))}
            </div>
        </SectionCard>

        <SectionCard title="Tùy chỉnh hiển thị">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <SelectField
                    label="Số dòng trên mỗi trang"
                    value={settings.tableRowsPerPage.toString()}
                    onChange={(val) => updateSetting('tableRowsPerPage', parseInt(val))}
                    options={OPTIONS.tableRows}
                    helpText="Số lượng mục hiển thị trong các bảng"
                />
            </div>
            <div className="space-y-0">
                <ToggleSwitch
                    label="Thu gọn Sidebar"
                    description="Mặc định thu gọn menu bên"
                    enabled={settings.sidebarCollapsed}
                    onChange={(val) => updateSetting('sidebarCollapsed', val)}
                />
                <ToggleSwitch
                    label="Chế độ compact"
                    description="Giảm khoảng cách giữa các phần tử"
                    enabled={settings.compactMode}
                    onChange={(val) => updateSetting('compactMode', val)}
                />
            </div>
        </SectionCard>
    </div>
);

/**
 * SEO Settings Tab - Cài đặt SEO
 */
const SEOSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Meta Tags" description="Cấu hình SEO cho website">
            <div className="space-y-6">
                <InputField
                    label="Tiêu đề trang"
                    value={settings.metaTitle}
                    onChange={(val) => updateSetting('metaTitle', val)}
                    placeholder="Tiêu đề hiển thị trên Google"
                    helpText="Tối đa 60 ký tự"
                />
                <TextareaField
                    label="Mô tả trang"
                    value={settings.metaDescription}
                    onChange={(val) => updateSetting('metaDescription', val)}
                    placeholder="Mô tả ngắn về website"
                    rows={2}
                    helpText="Tối đa 160 ký tự"
                />
                <InputField
                    label="Từ khóa"
                    value={settings.metaKeywords}
                    onChange={(val) => updateSetting('metaKeywords', val)}
                    placeholder="hoa tươi, flower shop, ..."
                    helpText="Phân cách bằng dấu phẩy"
                />
            </div>
        </SectionCard>

        <SectionCard title="Mạng xã hội" description="Liên kết trang mạng xã hội">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Facebook"
                    value={settings.facebookUrl}
                    onChange={(val) => updateSetting('facebookUrl', val)}
                    placeholder="https://facebook.com/..."
                    prefix="FB"
                />
                <InputField
                    label="Instagram"
                    value={settings.instagramUrl}
                    onChange={(val) => updateSetting('instagramUrl', val)}
                    placeholder="https://instagram.com/..."
                    prefix="IG"
                />
            </div>
        </SectionCard>

        <SectionCard title="Analytics" description="Theo dõi truy cập website">
            <InputField
                label="Google Analytics ID"
                value={settings.googleAnalyticsId}
                onChange={(val) => updateSetting('googleAnalyticsId', val)}
                placeholder="G-XXXXXXXXXX"
                helpText="ID từ Google Analytics 4"
            />
        </SectionCard>
    </div>
);

/**
 * Policies Settings Tab - Cài đặt chính sách
 */
const PoliciesSettingsTab = ({ settings, updateSetting }) => (
    <div className="space-y-6">
        <SectionCard title="Chính sách cửa hàng" description="Các chính sách hiển thị cho khách hàng">
            <div className="space-y-6">
                <TextareaField
                    label="Chính sách đổi trả"
                    value={settings.returnPolicy}
                    onChange={(val) => updateSetting('returnPolicy', val)}
                    placeholder="Nhập chính sách đổi trả hàng..."
                    rows={6}
                    helpText="Hiển thị trên trang checkout"
                />
                <TextareaField
                    label="Chính sách vận chuyển"
                    value={settings.shippingPolicy}
                    onChange={(val) => updateSetting('shippingPolicy', val)}
                    placeholder="Nhập chính sách vận chuyển..."
                    rows={6}
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
        </SectionCard>
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const SettingsPage = () => {
    // === STATE ===
    const [activeTab, setActiveTab] = useState('store');
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // === EFFECTS ===
    
    // Load settings từ localStorage
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem('adminSettings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed });
                }
            } catch (e) {
                console.error('Failed to load settings:', e);
            } finally {
                setLoading(false);
            }
        };
        
        // Simulate loading delay
        setTimeout(loadSettings, 300);
    }, []);

    // === HANDLERS ===
    
    // Cập nhật một setting
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
        setHasChanges(true);
    }, []);

    // Lưu settings
    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Save to localStorage
            localStorage.setItem('adminSettings', JSON.stringify(settings));
            
            setSaved(true);
            setHasChanges(false);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    }, [settings]);

    // Reset settings
    const handleReset = useCallback(() => {
        if (window.confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
            setSettings(DEFAULT_SETTINGS);
            setHasChanges(true);
        }
    }, []);

    // === RENDER HELPERS ===
    
    // Render tab content dựa vào activeTab
    const renderTabContent = () => {
        const tabComponents = {
            store: StoreSettingsTab,
            payment: PaymentSettingsTab,
            shipping: ShippingSettingsTab,
            notifications: NotificationsSettingsTab,
            security: SecuritySettingsTab,
            appearance: AppearanceSettingsTab,
            seo: SEOSettingsTab,
            policies: PoliciesSettingsTab,
        };
        
        const TabComponent = tabComponents[activeTab];
        return TabComponent ? <TabComponent settings={settings} updateSetting={updateSetting} /> : null;
    };

    // === LOADING STATE ===
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <ArrowPathIcon className="h-12 w-12 text-pink-500 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-4">Đang tải cài đặt...</p>
                </div>
            </div>
        );
    }

    // === MAIN RENDER ===
    return (
        <div className="space-y-6 animate-fadeIn">
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

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 
                                   rounded-xl font-medium transition-all"
                    >
                        Khôi phục mặc định
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
                            ${saved
                                ? 'bg-green-500 text-white'
                                : 'bg-pink-500 text-white hover:bg-pink-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {saving ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : saved ? (
                            <CheckIcon className="h-5 w-5" />
                        ) : null}
                        {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 sticky top-6">
                        {SETTINGS_TABS.map((tab) => (
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
                <div className="flex-1 min-w-0">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
