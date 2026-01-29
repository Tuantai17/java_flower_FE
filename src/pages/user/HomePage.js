import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HeroSection from '../../components/user/HeroSection';
import FeaturedProducts from '../../components/user/FeaturedProducts';
import CategoryCard from '../../components/user/CategoryCard';
import ProductCard from '../../components/user/ProductCard';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';
import { useApp } from '../../context/AppContext';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, toggleFavorite, isFavorite } = useApp();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [categoriesData, newProductsData] = await Promise.all([
                    categoryApi.getParents(),
                    productApi.getNewArrivals(10),
                ]);
                setCategories(categoriesData || []);
                setNewProducts(newProductsData.content || newProductsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Không sử dụng mock data - chỉ lấy từ API
                setCategories([]);
                setNewProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <HeroSection />

            {/* Categories Section */}
            {/* <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Danh Mục Nổi Bật</h2>
                        <p className="section-subtitle mt-4">Khám phá các bộ sưu tập hoa tươi đẹp nhất</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.slice(0, 4).map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    )}
                </div>
            </section> */}

            {/* Featured Products */}
            <FeaturedProducts />

            {/* New Arrivals */}
            {newProducts.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-pink-50 to-white">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="section-title">Sản Phẩm Mới</h2>
                            <p className="section-subtitle mt-4">Những thiết kế mới nhất dành cho bạn</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {newProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => addToCart(product)}
                                    onToggleFavorite={() => toggleFavorite(product)}
                                    isFavorite={isFavorite(product.id)}
                                />
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="text-center mt-8">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Xem tất cả sản phẩm
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '🚚', title: 'Giao Hàng Miễn Phí', desc: 'Cho đơn từ 500.000đ' },
                            { icon: '🌸', title: 'Hoa Tươi 100%', desc: 'Cam kết chất lượng' },
                            { icon: '💳', title: 'Thanh Toán An Toàn', desc: 'Nhiều hình thức' },
                            { icon: '🎁', title: 'Quà Tặng Kèm', desc: 'Thiệp chúc mừng miễn phí' },
                        ].map((service, index) => (
                            <div
                                key={index}
                                className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-500">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* <section className="py-20 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Sẵn sàng đặt hoa?
                    </h2>
                    <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
                        Liên hệ ngay hotline hoặc đặt hàng online để nhận được những bó hoa tươi đẹp nhất
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/shop"
                            className="px-8 py-4 bg-white text-pink-600 font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Xem Sản Phẩm
                        </Link>
                        <a
                            href="tel:1900633045"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-pink-600 transition-all duration-300"
                        >
                            📞 1900 633 045
                        </a>
                    </div>
                </div>
            </section> */}
        </div>
    );
};

export default HomePage;
