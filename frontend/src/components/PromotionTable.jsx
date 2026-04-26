import React from 'react';
import { Edit, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Copy, Check, Gift, Calendar, TrendingUp } from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadge, getDiscountDisplay } from '../types/promotion';

const PromotionTableRowSkeleton = () => (
    <tr className="animate-pulse border-b border-pale-rose/30">
        <td className="px-4 py-4">
            <div className="h-6 w-20 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-4 w-24 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-6 w-16 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-4 w-20 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-4 w-16 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-6 w-16 rounded-full bg-pink-100" />
        </td>
        <td className="px-4 py-4">
            <div className="h-8 w-8 rounded-full bg-pink-100" />
        </td>
    </tr>
);

const PromotionTable = ({ 
    promotions, 
    onEdit, 
    onDelete, 
    onToggleActive, 
    onTogglePublic, 
    onCopy,
    loading = false 
}) => {
    const [copiedId, setCopiedId] = React.useState(null);

    const handleCopy = (code, id) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            });
        }
    };

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-pale-rose to-soft-blush">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Discount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Usage</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Expiry</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Visibility</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <PromotionTableRowSkeleton key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!promotions || promotions.length === 0) {
        return (
            <div className="text-center py-16">
                <Gift className="w-16 h-16 mx-auto mb-4 text-pale-rose" />
                <h3 
                    className="text-xl font-semibold text-deep-burgundy mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                >
                    No Promotions Found
                </h3>
                <p 
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Jost, sans-serif' }}
                >
                    Create your first promotion to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gradient-to-r from-pale-rose to-soft-blush">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Usage</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Expiry</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Visibility</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif' }}>Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-pale-rose/30">
                    {promotions.map((promotion) => {
                        const status = getStatusBadge(promotion);
                        const statusColors = {
                            green: 'bg-green-100 text-green-700',
                            yellow: 'bg-yellow-100 text-yellow-700',
                            red: 'bg-red-100 text-red-700',
                            gray: 'bg-gray-100 text-gray-700',
                        };

                        return (
                            <tr 
                                key={promotion.id} 
                                className="bg-white hover:bg-pale-rose/20 transition-colors duration-200"
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="font-bold text-primary-rose cursor-pointer hover:text-deep-rose"
                                            style={{ fontFamily: 'Jost, sans-serif' }}
                                            onClick={() => handleCopy(promotion.code, promotion.id)}
                                        >
                                            {promotion.code}
                                        </span>
                                        {copiedId === promotion.id ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy 
                                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary-rose" 
                                                onClick={() => handleCopy(promotion.code, promotion.id)}
                                            />
                                        )}
                                    </div>
                                    {promotion.description && (
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                            {promotion.description}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-4">
                                    <span 
                                        className="font-bold text-deep-burgundy"
                                        style={{ fontFamily: 'Playfair Display, serif' }}
                                    >
                                        {getDiscountDisplay(promotion)}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {promotion.currentUses || 0}
                                            {promotion.maxUses ? ` / ${promotion.maxUses}` : ''}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {formatDate(promotion.expiryDate)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status.color]}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => onTogglePublic && onTogglePublic(promotion)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                            promotion.isPublic 
                                                ? 'bg-primary-rose/10 text-primary-rose hover:bg-primary-rose/20' 
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {promotion.isPublic ? (
                                            <Eye className="w-3 h-3" />
                                        ) : (
                                            <EyeOff className="w-3 h-3" />
                                        )}
                                        {promotion.isPublic ? 'Public' : 'Private'}
                                    </button>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onToggleActive && onToggleActive(promotion)}
                                            className={`p-2 rounded-lg transition-all duration-200 ${
                                                promotion.isActive 
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                            title={promotion.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {promotion.isActive ? (
                                                <ToggleRight className="w-5 h-5" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(promotion)}
                                            className="p-2 rounded-lg bg-primary-rose/10 text-primary-rose hover:bg-primary-rose/20 transition-all duration-200"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(promotion)}
                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export { PromotionTable, PromotionTableRowSkeleton };
export default PromotionTable;
