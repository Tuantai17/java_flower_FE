import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    const { id, name, imageUrl, description, productCount } = category;

    return (
        <Link
            to={`/category/${id}`}
            className="group relative block overflow-hidden rounded-2xl aspect-[4/3] shadow-soft hover:shadow-card-hover transition-all duration-300"
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={imageUrl || '/assets/images/placeholder.jpg'}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl md:text-2xl font-display font-bold mb-1 group-hover:text-pink-300 transition-colors">
                    {name}
                </h3>
                {description && (
                    <p className="text-white/80 text-sm line-clamp-2 mb-2">
                        {description}
                    </p>
                )}
                {productCount !== undefined && (
                    <span className="text-white/70 text-sm">
                        {productCount} sản phẩm
                    </span>
                )}
            </div>

            {/* Hover Arrow */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <span className="text-white">→</span>
            </div>
        </Link>
    );
};

export default CategoryCard;
