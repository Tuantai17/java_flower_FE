import React, { useState, useEffect } from 'react';
import { 
    DocumentTextIcon, 
    StarIcon as StarOutlineIcon,
    ChatBubbleBottomCenterTextIcon 
} from '@heroicons/react/24/outline';
import ReviewStats from '../ReviewStats';
import ReviewList from '../ReviewList';
import reviewApi from '../../../api/reviewApi';

/**
 * ========================================
 * Product Detail Tabs Component
 * ========================================
 * 
 * Tabs chứa:
 * - Mô tả chi tiết sản phẩm
 * - Đánh giá của khách hàng (Stats + List)
 */

const TABS = [
    { id: 'description', label: 'Mô tả', icon: DocumentTextIcon },
    { id: 'reviews', label: 'Đánh giá', icon: StarOutlineIcon },
];

const ProductDetailTabs = ({ product }) => {
    const [activeTab, setActiveTab] = useState('description');
    const [reviewStats, setReviewStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Fetch review stats when component mounts
    useEffect(() => {
        const fetchStats = async () => {
            if (!product?.id) return;
            
            try {
                setStatsLoading(true);
                const stats = await reviewApi.getProductStats(product.id);
                setReviewStats(stats);
            } catch (error) {
                console.error('Error fetching review stats:', error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [product?.id]);

    if (!product) return null;

    return (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-100">
                <div className="flex">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        
                        // Thêm số lượng đánh giá vào tab Reviews
                        let label = tab.label;
                        if (tab.id === 'reviews' && reviewStats?.totalReviews > 0) {
                            label = `${tab.label} (${reviewStats.totalReviews})`;
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-4 font-medium text-sm
                                    border-b-2 transition-all duration-200
                                    ${isActive 
                                        ? 'border-pink-500 text-pink-600 bg-pink-50/50' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
                {activeTab === 'description' && (
                    <DescriptionTab description={product.description} />
                )}
                
                {activeTab === 'reviews' && (
                    <ReviewsTab 
                        productId={product.id} 
                        stats={reviewStats}
                        statsLoading={statsLoading}
                    />
                )}
            </div>
        </div>
    );
};

/**
 * Description Tab Content
 */
const DescriptionTab = ({ description }) => {
    if (!description) {
        return (
            <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có mô tả chi tiết cho sản phẩm này</p>
            </div>
        );
    }

    return (
        <div className="prose prose-pink max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
            </div>
        </div>
    );
};

/**
 * Reviews Tab Content
 */
const ReviewsTab = ({ productId, stats, statsLoading }) => {
    return (
        <div className="space-y-8">
            {/* Review Stats */}
            <ReviewStats stats={stats} loading={statsLoading} />
            
            {/* Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400 font-medium">Đánh giá từ khách hàng</span>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            {/* Review List */}
            <ReviewList productId={productId} />
        </div>
    );
};

export default ProductDetailTabs;
