export const SupplierStatus = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
};

export const SupplierStatusColors = {
    true: 'bg-green-100 text-green-700',
    false: 'bg-red-100 text-red-700',
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-red-100 text-red-700',
};

export const SupplierType = {
    id: null,
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    category: '',
    taxId: '',
    bankDetails: '',
    notes: '',
    rating: 0,
    isActive: true,
    createdAt: null,
    updatedAt: null,
};

export const CreateSupplierRequestType = {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
    category: '',
    taxId: '',
    bankDetails: '',
    notes: '',
};

export const UpdateSupplierRequestType = {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    category: '',
    taxId: '',
    bankDetails: '',
    notes: '',
    rating: null,
    isActive: null,
};

export const SUPPLIER_CATEGORIES = [
    'Skincare',
    'Toner',
    'Body Care',
    'Hair Care',
    'Serum',
    'Moisturizer',
    'Cleanser',
    'Oil',
    'Sunscreen',
    'Mask',
    'Other',
];

export const COUNTRIES = [
    'Sri Lanka',
    'India',
    'China',
    'Thailand',
    'Singapore',
    'Malaysia',
    'Indonesia',
    'South Korea',
    'Japan',
    'USA',
    'UK',
    'Germany',
    'France',
    'Australia',
    'UAE',
    'Saudi Arabia',
    'Other',
];

export const formatSupplierData = (data) => ({
    id: data.id,
    companyName: data.companyName || '',
    contactPerson: data.contactPerson || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || '',
    country: data.country || 'Sri Lanka',
    category: data.category || '',
    taxId: data.taxId || '',
    bankDetails: data.bankDetails || '',
    notes: data.notes || '',
    rating: data.rating || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
});

export const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
};

export const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push('full');
        } else if (i === fullStars && hasHalfStar) {
            stars.push('half');
        } else {
            stars.push('empty');
        }
    }
    return stars;
};

export const getDisplayInitials = (name) => {
    if (!name) return 'S';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};
