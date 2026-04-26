import React from 'react';
import { Star, Edit2, Trash2, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';
import { formatDate, getDisplayInitials, getRatingStars } from '../types/supplier';

const SupplierTableSkeleton = ({ rows = 5 }) => (
    <div className="animate-pulse">
        <div className="h-12 bg-pink-100 rounded-t-xl" />
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-20 border-b border-pale-rose/30 bg-white flex items-center px-6 gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded-full bg-pink-100" />
                    <div className="h-3 w-56 rounded-full bg-pink-100" />
                </div>
                <div className="h-4 w-32 rounded-full bg-pink-100" />
                <div className="h-4 w-24 rounded-full bg-pink-100" />
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-100" />
                    <div className="w-8 h-8 rounded-lg bg-pink-100" />
                </div>
            </div>
        ))}
    </div>
);

const SupplierTable = ({ 
    suppliers, 
    loading, 
    onEdit, 
    onDelete, 
    onToggleStatus, 
    onViewDetails,
    sortBy = 'companyName',
    sortOrder = 'asc'
}) => {
    const [openMenu, setOpenMenu] = React.useState(null);

    const handleMenuToggle = (supplierId) => {
        setOpenMenu(openMenu === supplierId ? null : supplierId);
    };

    const handleAction = (action) => {
        setOpenMenu(null);
        action();
    };

    const sortedSuppliers = React.useMemo(() => {
        if (!suppliers) return [];
        return [...suppliers].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'isActive') {
                aVal = aVal ? 1 : 0;
                bVal = bVal ? 1 : 0;
            }
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [suppliers, sortBy, sortOrder]);

    const gradientColors = [
        'from-[#fdeef0] to-[#f5d5d8]',
        'from-[#f8d7db] to-[#fce4e8]',
        'from-[#fbdadf] to-[#fdf0f4]',
        'from-[#f9dde3] to-[#fff0f3]',
    ];

    if (loading) {
        return <SupplierTableSkeleton rows={8} />;
    }

    if (!suppliers || suppliers.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-pale-rose/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-primary-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-deep-burgundy font-playfair mb-2">
                    No suppliers found
                </h3>
                <p className="text-sm text-gray-500 font-jost">
                    Add your first supplier to get started
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gradient-to-r from-pale-rose/50 to-soft-blush/50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Supplier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Rating
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Added
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-deep-burgundy uppercase tracking-wider font-jost">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-pale-rose/30">
                    {sortedSuppliers.map((supplier) => (
                        <tr 
                            key={supplier.id}
                            className="bg-white hover:bg-pale-rose/20 transition-colors duration-200"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientColors[supplier.id % gradientColors.length]} flex items-center justify-center shadow-sm`}>
                                        <span className="text-sm font-bold text-deep-burgundy font-playfair">
                                            {getDisplayInitials(supplier.companyName)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-deep-burgundy font-jost">
                                            {supplier.companyName}
                                        </p>
                                        {supplier.contactPerson && (
                                            <p className="text-xs text-gray-500 font-jost">
                                                {supplier.contactPerson}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700 font-jost">
                                    {supplier.email}
                                </div>
                                {supplier.phone && (
                                    <div className="text-xs text-gray-500 font-jost">
                                        {supplier.phone}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-rose/10 text-primary-rose font-jost">
                                    {supplier.category || 'Uncategorized'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                    {getRatingStars(supplier.rating).map((star, index) => (
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
                                            {supplier.rating.toFixed(1)}
                                        </span>
                                    )}
                                    {supplier.rating === 0 && (
                                        <span className="text-xs text-gray-400 font-jost ml-1">
                                            No rating
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    supplier.isActive 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {supplier.isActive ? (
                                        <>
                                            <CheckCircle className="w-3 h-3" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3 h-3" />
                                            Inactive
                                        </>
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-jost">
                                {formatDate(supplier.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {onViewDetails && (
                                        <button
                                            onClick={() => handleAction(() => onViewDetails(supplier))}
                                            className="p-2 text-gray-500 hover:text-primary-rose hover:bg-pale-rose/30 rounded-lg transition-all duration-200"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={() => handleAction(() => onEdit(supplier))}
                                            className="p-2 text-gray-500 hover:text-primary-rose hover:bg-pale-rose/30 rounded-lg transition-all duration-200"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="relative">
                                        <button
                                            onClick={() => handleMenuToggle(supplier.id)}
                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        
                                        {openMenu === supplier.id && (
                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-pale-rose/30 overflow-hidden z-20 min-w-[150px]">
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
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export { SupplierTable, SupplierTableSkeleton };
export default SupplierTable;
