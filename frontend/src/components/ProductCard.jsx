import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';

const StarRow = ({ n = 4 }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star
                key={s}
                size={13}
                className={s <= n ? 'fill-amber-400 text-amber-400' : 'text-pink-200'}
            />
        ))}
    </div>
);

const ProductCard = ({ product, onAddToCart, onClick, showAdminActions, onEdit, onDelete }) => {
    const [wished, setWished] = useState(false);
    const [imgError, setImgError] = useState(false);
    const navigate = useNavigate();

    const isOutOfStock = Number(product.stockQuantity) === 0;

    const handleCardClick = () => {
        if (onClick) {
            onClick(product);
        } else {
            navigate(`/shop/product/${product.id}`, { state: { product } });
        }
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        setWished(w => !w);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!isOutOfStock && onAddToCart) {
            onAddToCart(product);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ boxShadow: '0 4px 24px rgba(183,110,121,0.10)' }}
        >
            <button
                onClick={handleWishlist}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-110"
            >
                <Heart
                    size={15}
                    className={wished ? 'fill-[#B76E79] text-[#B76E79] transition-colors' : 'text-[#B76E79]'}
                />
            </button>

            <div
                className="relative h-56 overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
            >
                {!imgError && product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain bg-white object-center transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-50 transition-opacity duration-300">
                        <div
                            className="w-16 h-28 rounded-2xl shadow-lg transform group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500"
                            style={{ background: 'linear-gradient(135deg, #d4a0a0 0%, rgba(183,110,121,0.6) 100%)' }}
                        />
                        <div
                            className="w-10 h-10 rounded-xl shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 -mt-4 ml-8"
                            style={{ background: 'linear-gradient(135deg, #e8c5c0 0%, rgba(201,137,138,0.6) 100%)' }}
                        />
                    </div>
                )}

                {isOutOfStock && (
                    <span
                        className="absolute top-3 left-3 bg-gray-700 text-white text-[9px] font-medium px-2.5 py-1 rounded-full tracking-widest uppercase"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        Sold Out
                    </span>
                )}

                {!isOutOfStock && (
                    <div className="absolute inset-0 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <button
                            onClick={handleAddToCart}
                            className="bg-[#B76E79] text-white text-xs font-medium px-8 py-2.5 rounded-full shadow-lg hover:bg-[#9e5c67] transition-colors tracking-wide"
                            style={{ fontFamily: 'Jost, sans-serif' }}
                        >
                            Add to Bag
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4">
                <p
                    className="text-[10px] text-[#B76E79] uppercase tracking-[0.18em] mb-1"
                    style={{ fontFamily: 'Jost, sans-serif' }}
                >
                    {product.brand || product.category}
                </p>
                <h3
                    className="text-sm text-gray-800 leading-snug mb-2 font-medium line-clamp-2"
                    style={{ fontFamily: 'Jost, sans-serif' }}
                >
                    {product.name}
                </h3>
                <StarRow n={4} />
                <div className="flex items-center justify-between mt-3">
                    <p
                        className="font-semibold text-[#B76E79] text-sm"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        ${Number(product.price).toLocaleString()}
                    </p>
                    {isOutOfStock && (
                        <span className="text-[10px] text-gray-400" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Out of stock
                        </span>
                    )}
                </div>

                {showAdminActions && (
                    <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: '#f5d5d8' }}>
                        {onEdit && (
                            <button
                                onClick={e => { e.stopPropagation(); onEdit(product); }}
                                className="flex-1 text-xs font-medium py-2 rounded-lg border transition-all duration-200 hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79]"
                                style={{ borderColor: '#f5d5d8', color: '#B76E79', fontFamily: 'Jost, sans-serif' }}
                            >
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={e => { e.stopPropagation(); onDelete(product.id); }}
                                className="flex-1 text-xs font-medium py-2 rounded-lg border transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500"
                                style={{ borderColor: '#f5d5d8', color: '#9e5c67', fontFamily: 'Jost, sans-serif' }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
