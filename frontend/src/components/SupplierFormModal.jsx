import React from 'react';
import { X, Building2, User, Mail, Phone, MapPin, Globe, FileText, Banknote, Star, AlertCircle } from 'lucide-react';
import { CreateSupplierRequestType, SUPPLIER_CATEGORIES, COUNTRIES } from '../types/supplier';

const initialFormState = {
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

const SupplierFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    editingSupplier,
    loading 
}) => {
    const [formData, setFormData] = React.useState(initialFormState);
    const [formErrors, setFormErrors] = React.useState({});

    React.useEffect(() => {
        if (editingSupplier) {
            setFormData({
                companyName: editingSupplier.companyName || '',
                contactPerson: editingSupplier.contactPerson || '',
                email: editingSupplier.email || '',
                phone: editingSupplier.phone || '',
                address: editingSupplier.address || '',
                city: editingSupplier.city || '',
                country: editingSupplier.country || 'Sri Lanka',
                category: editingSupplier.category || '',
                taxId: editingSupplier.taxId || '',
                bankDetails: editingSupplier.bankDetails || '',
                notes: editingSupplier.notes || '',
            });
        } else {
            setFormData(initialFormState);
        }
        setFormErrors({});
    }, [editingSupplier, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.companyName.trim()) {
            errors.companyName = 'Company name is required';
        } else if (formData.companyName.length > 255) {
            errors.companyName = 'Company name must not exceed 255 characters';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        } else if (formData.email.length > 255) {
            errors.email = 'Email must not exceed 255 characters';
        }
        
        if (formData.phone && formData.phone.length > 50) {
            errors.phone = 'Phone must not exceed 50 characters';
        }
        
        if (formData.city && formData.city.length > 100) {
            errors.city = 'City must not exceed 100 characters';
        }
        
        if (formData.country && formData.country.length > 100) {
            errors.country = 'Country must not exceed 100 characters';
        }
        
        if (formData.category && formData.category.length > 100) {
            errors.category = 'Category must not exceed 100 characters';
        }
        
        if (formData.taxId && formData.taxId.length > 100) {
            errors.taxId = 'Tax ID must not exceed 100 characters';
        }
        
        if (formData.contactPerson && formData.contactPerson.length > 255) {
            errors.contactPerson = 'Contact person name must not exceed 255 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-pale-rose/30 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 
                            className="text-xl font-bold text-deep-burgundy font-playfair"
                        >
                            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-pale-rose/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Company Name *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="Enter company name"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.companyName ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                    />
                                </div>
                                {formErrors.companyName && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {formErrors.companyName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Contact Person
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleInputChange}
                                        placeholder="Primary contact name"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.contactPerson ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                    />
                                </div>
                                {formErrors.contactPerson && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {formErrors.contactPerson}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="supplier@company.com"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+94 XX XXX XXXX"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                    />
                                </div>
                                {formErrors.phone && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {formErrors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Full address including street"
                                    rows={2}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all resize-none font-jost"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Colombo"
                                    className={`w-full px-4 py-3 rounded-xl border ${formErrors.city ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                />
                                {formErrors.city && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {formErrors.city}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Country
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost appearance-none bg-white"
                                    >
                                        {COUNTRIES.map(country => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Category
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost appearance-none bg-white"
                                    >
                                        <option value="">Select a category</option>
                                        {SUPPLIER_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                    Tax ID / Registration Number
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleInputChange}
                                        placeholder="Tax/Registration ID"
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${formErrors.taxId ? 'border-red-400' : 'border-pale-rose'} focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all font-jost`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                Bank Details
                            </label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="bankDetails"
                                    value={formData.bankDetails}
                                    onChange={handleInputChange}
                                    placeholder="Bank name, account number, etc."
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all resize-none font-jost"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 font-jost">
                                Notes
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional notes about this supplier..."
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all resize-none font-jost"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 mt-6 border-t border-pale-rose/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium font-jost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all font-medium font-jost shadow-lg shadow-primary-rose/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Star className="w-5 h-5" />
                                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { SupplierFormModal };
export default SupplierFormModal;
