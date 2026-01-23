import React from 'react';
import { TruckIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/formatPrice';

/**
 * ShippingSummaryCard Component
 * 
 * Hiển thị thông tin phí vận chuyển động từ API
 * Bao gồm: phí ship, thời gian giao, ngưỡng miễn phí
 */
const ShippingSummaryCard = ({
    shippingData,
    cartTotal,
    loading,
}) => {
    const {
        shippingFee = 0,
        originalFee = 0,
        isFreeShip = false,
        freeShipThreshold = 0,
        amountToFreeShip = 0,
        estimatedTime = '',
        zoneName = '',
    } = shippingData || {};

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
                <TruckIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Phí vận chuyển</span>
                {zoneName && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {zoneName}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Đang tính phí...
                </div>
            ) : (
                <>
                    {/* Phí ship */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Phí giao hàng:</span>
                        <div className="text-right">
                            {isFreeShip ? (
                                <span className="text-green-600 font-semibold">Miễn phí</span>
                            ) : (
                                <span className="text-gray-900 font-semibold">
                                    {formatPrice(shippingFee)}
                                </span>
                            )}
                            {isFreeShip && originalFee > 0 && (
                                <span className="text-gray-400 text-sm line-through ml-2">
                                    {formatPrice(originalFee)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Thời gian giao */}
                    {estimatedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <ClockIcon className="h-4 w-4" />
                            <span>Giao hàng trong: <strong>{estimatedTime}</strong></span>
                        </div>
                    )}

                    {/* Thông báo miễn phí */}
                    {!isFreeShip && amountToFreeShip > 0 && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm flex items-start gap-1">
                                <span>🎁</span>
                                <span>
                                    Mua thêm <strong>{formatPrice(amountToFreeShip)}</strong> để được 
                                    <strong className="text-green-600"> miễn phí ship!</strong>
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Đã miễn phí */}
                    {isFreeShip && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm flex items-center gap-1">
                                ✅ Đơn hàng từ {formatPrice(freeShipThreshold)} - Miễn phí vận chuyển!
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ShippingSummaryCard;
