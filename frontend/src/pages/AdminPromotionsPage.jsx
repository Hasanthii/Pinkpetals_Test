import React, { useEffect, useState } from 'react';
import { Plus, X, Gift, Percent, Ticket, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { PromotionService } from '../services/promotionService';
import { PromotionTable } from '../components/PromotionTable';
import ErrorBoundary from '../components/ErrorBoundary';

const initialFormState = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maxUses: '',
    startDate: '',
    expiryDate: '',
    isActive: true,
    isPublic: false,
};

const AdminPromotionsPageContent = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [toast, setToast] = useState({ message: '', type: '' });
    const [filter, setFilter] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await PromotionService.getAll();
            setPromotions(data || []);
        } catch (err) {
            setError('Failed to load promotions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: '' }), 4000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.code.trim()) {
            errors.code = 'Promotion code is required';
        } else if (formData.code.length > 50) {
            errors.code = 'Code must not exceed 50 characters';
        }
        if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
            errors.discountValue = 'Discount value must be greater than 0';
        }
        if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
            errors.discountValue = 'Percentage cannot exceed 100%';
        }
        if (!formData.startDate) {
            errors.startDate = 'Start date is required';
        }
        if (!formData.expiryDate) {
            errors.expiryDate = 'Expiry date is required';
        }
        if (formData.startDate && formData.expiryDate && new Date(formData.startDate) >= new Date(formData.expiryDate)) {
            errors.expiryDate = 'Expiry date must be after start date';
        }
        if (formData.minimumOrderAmount && parseFloat(formData.minimumOrderAmount) < 0) {
            errors.minimumOrderAmount = 'Minimum order cannot be negative';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                description: formData.description,
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue),
                minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
                maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                startDate: new Date(formData.startDate).toISOString(),
                expiryDate: new Date(formData.expiryDate).toISOString(),
                isActive: formData.isActive,
                isPublic: formData.isPublic,
            };

            if (editingPromotion) {
                await PromotionService.update(editingPromotion.id, payload);
                showToast('Promotion updated successfully!');
            } else {
                await PromotionService.create(payload);
                showToast('Promotion created successfully!');
            }

            setShowModal(false);
            setEditingPromotion(null);
            setFormData(initialFormState);
            fetchPromotions();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save promotion. Please try again.';
            showToast(errorMessage, 'error');
        }
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            code: promotion.code,
            description: promotion.description || '',
            discountType: promotion.discountType,
            discountValue: String(promotion.discountValue),
            minimumOrderAmount: promotion.minimumOrderAmount ? String(promotion.minimumOrderAmount) : '',
            maxUses: promotion.maxUses ? String(promotion.maxUses) : '',
            startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
            expiryDate: promotion.expiryDate ? promotion.expiryDate.split('T')[0] : '',
            isActive: promotion.isActive,
            isPublic: promotion.isPublic,
        });
        setShowModal(true);
    };

    const handleDelete = async (promotion) => {
        setConfirmDelete(promotion);
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        try {
            await PromotionService.delete(confirmDelete.id);
            showToast('Promotion deleted successfully!');
            fetchPromotions();
        } catch (err) {
            showToast('Failed to delete promotion.', 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleToggleActive = async (promotion) => {
        try {
            if (promotion.isActive) {
                await PromotionService.deactivate(promotion.id);
                showToast('Promotion deactivated');
            } else {
                await PromotionService.activate(promotion.id);
                showToast('Promotion activated');
            }
            fetchPromotions();
        } catch (err) {
            showToast('Failed to update promotion status.', 'error');
        }
    };

    const handleTogglePublic = async (promotion) => {
        try {
            if (promotion.isPublic) {
                await PromotionService.makePrivate(promotion.id);
                showToast('Promotion made private');
            } else {
                await PromotionService.makePublic(promotion.id);
                showToast('Promotion made public');
            }
            fetchPromotions();
        } catch (err) {
            showToast('Failed to update visibility.', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingPromotion(null);
        setFormData(initialFormState);
        setFormErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPromotion(null);
        setFormData(initialFormState);
        setFormErrors({});
    };

    const filteredPromotions = React.useMemo(() => {
        if (filter === 'all') return promotions;
        if (filter === 'active') return promotions.filter(p => p.isActive && !p.isExpired);
        if (filter === 'inactive') return promotions.filter(p => !p.isActive);
        if (filter === 'expired') return promotions.filter(p => p.isExpired);
        if (filter === 'public') return promotions.filter(p => p.isPublic);
        return promotions;
    }, [promotions, filter]);

    const stats = React.useMemo(() => ({
        total: promotions.length,
        active: promotions.filter(p => p.isActive && !p.isExpired).length,
        public: promotions.filter(p => p.isPublic).length,
        expired: promotions.filter(p => p.isExpired).length,
    }), [promotions]);

    return (
        <div className="p-8" style={{ fontFamily: 'Jost, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 
                            className="text-3xl font-bold text-deep-burgundy"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Promotions & Discounts
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your promotional codes and special offers</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all duration-300 shadow-lg shadow-primary-rose/30 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Promotion
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-pale-rose/30">
                        <div className="flex items-center gap-3 mb-2">
                            <Gift className="w-5 h-5 text-primary-rose" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Total</span>
                        </div>
                        <span className="text-3xl font-bold text-deep-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {stats.total}
                        </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Active</span>
                        </div>
                        <span className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {stats.active}
                        </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Gift className="w-5 h-5 text-blue-500" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Public</span>
                        </div>
                        <span className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {stats.public}
                        </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Expired</span>
                        </div>
                        <span className="text-3xl font-bold text-red-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {stats.expired}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="flex items-center gap-4 p-4 border-b border-pale-rose/30">
                        <span className="text-sm text-gray-500">Filter:</span>
                        {['all', 'active', 'inactive', 'expired', 'public'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    filter === f 
                                        ? 'bg-primary-rose text-white shadow-md' 
                                        : 'bg-pale-rose/30 text-deep-burgundy hover:bg-pale-rose/50'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <PromotionTable
                        promotions={filteredPromotions}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onTogglePublic={handleTogglePublic}
                    />
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-pale-rose/30 px-6 py-4 flex items-center justify-between">
                            <h2 
                                className="text-xl font-bold text-deep-burgundy"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-pale-rose/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Promotion Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="e.g., SUMMER20"
                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.code ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all`}
                                    />
                                    {formErrors.code && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Type *
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="discountType"
                                                value="PERCENTAGE"
                                                checked={formData.discountType === 'PERCENTAGE'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-primary-rose"
                                            />
                                            <Percent className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Percentage</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="discountType"
                                                value="FIXED_AMOUNT"
                                                checked={formData.discountType === 'FIXED_AMOUNT'}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-primary-rose"
                                            />
                                            <Ticket className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Fixed Amount</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Value *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="discountValue"
                                            value={formData.discountValue}
                                            onChange={handleInputChange}
                                            placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '500'}
                                            min="0"
                                            step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.discountValue ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all pr-12`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {formData.discountType === 'PERCENTAGE' ? '%' : '$'}
                                        </span>
                                    </div>
                                    {formErrors.discountValue && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.discountValue}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Order Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="minimumOrderAmount"
                                        value={formData.minimumOrderAmount}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        min="0"
                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.minimumOrderAmount ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all`}
                                    />
                                    {formErrors.minimumOrderAmount && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.minimumOrderAmount}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.startDate ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all`}
                                    />
                                    {formErrors.startDate && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${formErrors.expiryDate ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all`}
                                    />
                                    {formErrors.expiryDate && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Uses (Leave empty for unlimited)
                                </label>
                                <input
                                    type="number"
                                    name="maxUses"
                                    value={formData.maxUses}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 100"
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter promotion description..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 rounded text-primary-rose"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                        <p className="text-xs text-gray-500">Enable this promotion</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 rounded text-primary-rose"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Public</span>
                                        <p className="text-xs text-gray-500">Show on Deals page</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-pale-rose/30">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all font-medium shadow-lg shadow-primary-rose/30"
                                >
                                    {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 
                                className="text-xl font-bold text-deep-burgundy mb-2"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                Delete Promotion
                            </h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete promotion <strong>{confirmDelete.code}</strong>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAction}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && (
                <div className={`fixed bottom-6 right-6 z-50 bg-white border shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 ${
                    toast.type === 'error' ? 'border-red-400' : 'border-primary-rose'
                }`}>
                    {toast.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-sm text-gray-700">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

const AdminPromotionsPage = () => (
    <ErrorBoundary>
        <AdminPromotionsPageContent />
    </ErrorBoundary>
);

export default AdminPromotionsPage;
