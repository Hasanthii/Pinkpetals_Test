import React from 'react';

export const ProductGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div
                    className="h-56 bg-gradient-to-br from-[#fdeef0] to-[#f5d5d8]"
                    style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
                />
                <div className="p-4 space-y-3">
                    <div className="h-2 w-16 rounded-full bg-pink-100" />
                    <div className="h-3 w-full rounded-full bg-pink-100" />
                    <div className="h-3 w-3/4 rounded-full bg-pink-100" />
                    <div className="h-4 w-20 rounded-full bg-pink-100 mt-2" />
                </div>
            </div>
        ))}
    </div>
);

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
        <div
            className="h-56"
            style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
        />
        <div className="p-4 space-y-3">
            <div className="h-2 w-16 rounded-full bg-pink-100" />
            <div className="h-3 w-full rounded-full bg-pink-100" />
            <div className="h-3 w-3/4 rounded-full bg-pink-100" />
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className="w-3 h-3 rounded-full bg-pink-100" />
                ))}
            </div>
            <div className="h-4 w-20 rounded-full bg-pink-100 mt-2" />
        </div>
    </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
    <tr className="animate-pulse">
        {[...Array(cols)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 rounded bg-pink-100" style={{ width: `${60 + (i * 17) % 40}%` }} />
            </td>
        ))}
    </tr>
);

export const DetailSkeleton = () => (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-pulse" style={{ background: '#fffaf9' }}>
        <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
                <div className="h-96 rounded-2xl" style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }} />
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 rounded-xl" style={{ background: '#fdeef0' }} />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-2 w-24 rounded-full bg-pink-100" />
                <div className="h-8 w-full rounded-full bg-pink-100" />
                <div className="h-8 w-2/3 rounded-full bg-pink-100" />
                <div className="h-4 w-32 rounded-full bg-pink-100" />
                <div className="space-y-2 mt-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-3 w-full rounded-full bg-pink-100" />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-pink-100 mx-auto mb-4" />
        <div className="space-y-3">
            <div className="h-6 w-48 rounded-full bg-pink-100 mx-auto" />
            <div className="h-4 w-64 rounded-full bg-pink-100 mx-auto" />
            <div className="h-3 w-32 rounded-full bg-pink-100 mx-auto mt-4" />
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-32 bg-gradient-to-r from-primary-rose to-warm-rose" />
        <div className="px-8 py-6 space-y-6">
            <div className="flex items-center gap-4 -mt-12">
                <div className="w-24 h-24 rounded-full bg-pink-100 border-4 border-white" />
                <div className="space-y-2">
                    <div className="h-6 w-48 rounded-full bg-pink-100" />
                    <div className="h-4 w-32 rounded-full bg-pink-100" />
                </div>
            </div>
            <div className="h-64 bg-pink-100 rounded-xl" />
        </div>
    </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="animate-pulse">
        <div className="h-12 bg-pink-100 rounded-t-xl" />
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="h-16 border-b border-pale-rose/30 bg-white flex items-center px-6 gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-100" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 rounded-full bg-pink-100" />
                    <div className="h-2 w-48 rounded-full bg-pink-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-pink-100" />
                <div className="h-6 w-16 rounded-full bg-pink-100" />
            </div>
        ))}
    </div>
);

const SkeletonLoader = {
    ProductGrid: ProductGridSkeleton,
    ProductCard: ProductCardSkeleton,
    TableRow: TableRowSkeleton,
    Detail: DetailSkeleton,
    Card: CardSkeleton,
    Profile: ProfileSkeleton,
    Table: TableSkeleton,
    variant: (v) => {
        const variants = { card: CardSkeleton, profile: ProfileSkeleton, table: TableSkeleton };
        return variants[v] || CardSkeleton;
    }
};

export default SkeletonLoader;
