import React from 'react';
import { Star, Mail, Phone, MapPin, Building2, Globe, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getDisplayInitials, getRatingStars } from '../types/supplier';

const SupplierCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-28 bg-gradient-to-br from-[#fdeef0] to-[#f5d5d8]" />
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-pink-100" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 rounded-full bg-pink-100" />
                    <div className="h-3 w-24 rounded-full bg-pink-100" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-pink-100" />
                <div className="h-4 w-3/4 rounded-full bg-pink-100" />
            </div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="w-4 h-4 rounded-full bg-pink-100" />
                ))}
            </div>
            <div className="h-10 rounded-xl bg-pink-100" />
        </div>
    </div>
);

const SupplierCard = ({ supplier, onEdit, onDelete, onToggleStatus, onViewDetails, compact = false }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [showMenu, setShowMenu] = React.useState(false);

    const gradientColors = [
        'from-[#fdeef0] to-[#f5d5d8]',
        'from-[#f8d7db] to-[#fce4e8]',
        'from-[#fbdadf] to-[#fdf0f4]',
        'from-[#f9dde3] to-[#fff0f3]',
    ];
    const randomGradient = gradientColors[supplier.id % gradientColors.length];

    const ratingStars = getRatingStars(supplier.rating);

    const handleAction = (action) => {
        setShowMenu(false);
        action();
    };

    if (compact) {
        return (
            <div className="bg-white rounded-xl p-4 border border-pale-rose/30 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${randomGradient} flex items-center justify-center`}>
                        <span className="text-sm font-bold text-deep-burgundy font-playfair">
                            {getDisplayInitials(supplier.companyName)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-deep-burgundy truncate font-jost">
                            {supplier.companyName}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-jost">
                            {supplier.email}
                        </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        supplier.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-rose/20 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative h-28 bg-gradient-to-br ${randomGradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-bold text-white font-playfair">
                            {getDisplayInitials(supplier.companyName)}
                        </span>
                    </div>
                </div>

                {supplier.isActive ? (
                    <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactive
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="text-center mb-4">
                    <h3 
                        className="text-lg font-bold text-deep-burgundy truncate font-playfair"
                        title={supplier.companyName}
                    >
                        {supplier.companyName}
                    </h3>
                    {supplier.contactPerson && (
                        <p className="text-sm text-warm-rose font-jost mt-1">
                            {supplier.contactPerson}
                        </p>
                    )}
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-primary-rose flex-shrink-0" />
                        <span className="truncate font-jost" title={supplier.email}>
                            {supplier.email}
                        </span>
                    </div>
                    
                    {supplier.phone && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-primary-rose flex-shrink-0" />
                            <span className="font-jost">{supplier.phone}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-primary-rose flex-shrink-0" />
                        <span className="truncate font-jost">
                            {[supplier.city, supplier.country].filter(Boolean).join(', ') || '-'}
                        </span>
                    </div>

                    {supplier.category && (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-primary-rose flex-shrink-0" />
                            <span className="font-jost">{supplier.category}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                    {ratingStars.map((star, index) => (
                        <Star
                            key={index}
                            className={`w-4 h-4 ${
                                star === 'full' 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : star === 'half'
                                    ? 'fill-yellow-400/50 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    ))}
                    {supplier.rating > 0 && (
                        <span className="text-xs text-gray-500 ml-1 font-jost">
                            ({supplier.rating.toFixed(1)})
                        </span>
                    )}
                </div>

                <div className="text-xs text-gray-400 text-center mb-4 font-jost">
                    Added {formatDate(supplier.createdAt)}
                </div>

                <div className="relative">
                    <div className="flex gap-2">
                        {onViewDetails && (
                            <button
                                onClick={() => handleAction(() => onViewDetails(supplier))}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pale-rose to-soft-blush text-deep-burgundy rounded-xl hover:from-primary-rose hover:to-warm-rose hover:text-white transition-all duration-300 text-sm font-medium font-jost"
                            >
                                View
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => handleAction(() => onEdit(supplier))}
                                className="flex-1 px-4 py-2.5 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all duration-300 text-sm font-medium font-jost shadow-lg shadow-primary-rose/30"
                            >
                                Edit
                            </button>
                        )}
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                        </button>
                    </div>

                    {showMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-pale-rose/30 overflow-hidden z-10 min-w-[140px]">
                            {onToggleStatus && (
                                <button
                                    onClick={() => handleAction(() => onToggleStatus(supplier))}
                                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-pale-rose/30 transition-colors font-jost flex items-center gap-2"
                                >
                                    {supplier.isActive ? (
                                        <>
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            Deactivate
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Activate
                                        </>
                                    )}
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => handleAction(() => onDelete(supplier))}
                                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-jost flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { SupplierCard, SupplierCardSkeleton };
export default SupplierCard;
