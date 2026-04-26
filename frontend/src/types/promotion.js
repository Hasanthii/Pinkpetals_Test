export const PromotionType = {
    id: null,
    code: '',
    description: '',
    discountType: '',
    discountValue: 0,
    minimumOrderAmount: 0,
    maxUses: null,
    currentUses: 0,
    startDate: null,
    expiryDate: null,
    isActive: true,
    isPublic: false,
    isExpired: false,
    isValid: false,
    createdAt: null,
    updatedAt: null,
};

export const CreatePromotionRequestType = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minimumOrderAmount: 0,
    maxUses: null,
    startDate: null,
    expiryDate: null,
    isActive: true,
    isPublic: false,
};

export const UpdatePromotionRequestType = {
    code: '',
    description: '',
    discountType: '',
    discountValue: null,
    minimumOrderAmount: null,
    maxUses: null,
    startDate: null,
    expiryDate: null,
    isActive: null,
    isPublic: null,
};

export const ValidatePromotionRequestType = {
    code: '',
    orderAmount: 0,
};

export const ValidatePromotionResponseType = {
    isValid: false,
    code: '',
    discountType: '',
    discountValue: 0,
    calculatedDiscount: 0,
    message: '',
};

export const PromotionUsageType = {
    id: null,
    promotionId: null,
    promotionCode: '',
    userId: null,
    userEmail: '',
    orderId: null,
    discountAmount: 0,
    usedAt: null,
};

export const RecordPromotionUsageRequestType = {
    code: '',
    userId: null,
    orderId: null,
    orderAmount: 0,
};

export const getDiscountDisplay = (promotion) => {
    if (!promotion) return '';
    if (promotion.discountType === 'PERCENTAGE') {
        return `${promotion.discountValue}% OFF`;
    }
    return `$${Number(promotion.discountValue).toLocaleString()} OFF`;
};

export const getStatusBadge = (promotion) => {
    if (!promotion) return { label: 'Unknown', color: 'gray' };
    if (!promotion.isActive) return { label: 'Inactive', color: 'gray' };
    if (promotion.isExpired) return { label: 'Expired', color: 'red' };
    if (promotion.isValid) return { label: 'Active', color: 'green' };
    return { label: 'Scheduled', color: 'yellow' };
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
};
