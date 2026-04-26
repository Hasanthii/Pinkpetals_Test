import React from 'react';
import { Gift, Clock, Percent, Ticket, Copy, Check, Sparkles } from 'lucide-react';
import { getDiscountDisplay, formatDate, isExpiringSoon } from '../types/promotion';

const PromotionCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-32 bg-gradient-to-br from-[#fdeef0] to-[#f5d5d8]" />
        <div className="p-6 space-y-4">
            <div className="h-8 w-24 rounded-full bg-pink-100" />
            <div className="h-4 w-full rounded-full bg-pink-100" />
            <div className="h-4 w-3/4 rounded-full bg-pink-100" />
            <div className="h-6 w-20 rounded-full bg-pink-100" />
        </div>
    </div>
);

const PromotionCard = ({ promotion, onCopy, onApply, showActions = true }) => {
    const [copied, setCopied] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleCopy = () => {
        if (onCopy) {
            onCopy(promotion.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const discountDisplay = getDiscountDisplay(promotion);
    const expiringSoon = isExpiringSoon(promotion.expiryDate);
    const gradientColors = [
        'from-[#fdeef0] to-[#f5d5d8]',
        'from-[#f8d7db] to-[#fce4e8]',
        'from-[#fbdadf] to-[#fdf0f4]',
        'from-[#f9dde3] to-[#fff0f3]',
    ];
    const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

    return (
        <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-rose/20 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative h-32 bg-gradient-to-br ${randomGradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10 text-center">
                    {promotion.discountType === 'PERCENTAGE' ? (
                        <div className="flex items-center justify-center gap-2">
                            <Percent className="w-8 h-8 text-primary-rose" />
                            <span 
                                className="text-4xl font-bold text-deep-burgundy"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                {promotion.discountValue}
                            </span>
                            <span className="text-2xl text-primary-rose font-bold">%</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <Ticket className="w-8 h-8 text-primary-rose" />
                            <span 
                                className="text-3xl font-bold text-deep-burgundy"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                ${Number(promotion.discountValue).toLocaleString()}
                            </span>
                        </div>
                    )}
                    <p 
                        className="text-sm text-warm-rose mt-1 tracking-wider uppercase"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        OFF
                    </p>
                </div>

                {expiringSoon && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Hurry!
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 
                        className="text-lg font-bold text-deep-burgundy"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        {promotion.code}
                    </h3>
                    {promotion.isPublic && (
                        <span className="text-xs bg-primary-rose/10 text-primary-rose px-2 py-1 rounded-full">
                            Public
                        </span>
                    )}
                </div>

                {promotion.description && (
                    <p 
                        className="text-sm text-gray-600 mb-4 line-clamp-2"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        {promotion.description}
                    </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span style={{ fontFamily: 'Jost, sans-serif' }}>
                        Expires: {formatDate(promotion.expiryDate)}
                    </span>
                </div>

                {promotion.minimumOrderAmount > 0 && (
                    <p 
                        className="text-xs text-warm-rose/80 mb-4"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                        Min. order: ${Number(promotion.minimumOrderAmount).toLocaleString()}
                    </p>
                )}

                {showActions && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pale-rose to-soft-blush text-deep-burgundy rounded-xl hover:from-primary-rose hover:to-warm-rose hover:text-white transition-all duration-300"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span style={{ fontFamily: 'Jost, sans-serif' }}>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span style={{ fontFamily: 'Jost, sans-serif' }}>Copy Code</span>
                                </>
                            )}
                        </button>
                        {onApply && (
                            <button
                                onClick={() => onApply(promotion)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all duration-300 shadow-lg shadow-primary-rose/30"
                            >
                                <Gift className="w-4 h-4" />
                                <span style={{ fontFamily: 'Jost, sans-serif' }}>Apply</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { PromotionCard, PromotionCardSkeleton };
export default PromotionCard;
