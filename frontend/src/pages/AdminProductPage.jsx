import React, { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Package, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { ProductService } from '../services/productService';
import { TableRowSkeleton } from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../services/api';

const CATEGORIES = ['Skin Care', 'Makeup', 'Body Care', 'Hair Care', 'Serum', 'Moisturiser', 'Cleanser', 'Lipstick', 'Sunscreen'];

const emptyForm = {
    name: '',
    brand: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    imageUrl: '',
    imageFile: null,
    imagePreview: '',
    supplierId: '',
};

const AdminProductPageContent = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [isSupplier, setIsSupplier] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState('success');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem('pinkpetals_role');
        setIsSupplier(role === 'SUPPLIER');
        fetchProducts();
        fetchSuppliers();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ProductService.getAll();
            setProducts(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data || []);
        } catch (err) {
            setSuppliers([]);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast(message);
        setToastType(type);
        setTimeout(() => setToast(''), 3000);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast('Image size must be less than 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: reader.result,
                imageUrl: ''
            }));
        };
        reader.readAsDataURL(file);
    };

    const uploadImageToServer = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/uploads/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    };

    const removeImage = () => {
        setForm(prev => ({
            ...prev,
            imageFile: null,
            imagePreview: '',
            imageUrl: ''
        }));
    };

    const openCreateModal = () => {
        setForm({...emptyForm, imagePreview: ''});
        setFormErrors({});
        setModalMode('create');
        setSelectedProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setForm({
            name: product.name || '',
            brand: product.brand || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            category: product.category || '',
            stockQuantity: product.stockQuantity?.toString() || '',
            imageUrl: product.imageUrl || '',
            imageFile: null,
            imagePreview: product.imageUrl || '',
        });
        setFormErrors({});
        setModalMode('edit');
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setForm(emptyForm);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Product name is required';
        if (!form.description.trim()) errors.description = 'Description is required';
        if (!form.price) {
            errors.price = 'Price is required';
        } else if (isNaN(Number(form.price)) || Number(form.price) < 0) {
            errors.price = 'Price must be a valid positive number';
        }
        if (!form.category) errors.category = 'Category is required';
        if (form.stockQuantity === '' || form.stockQuantity === null) {
            errors.stockQuantity = 'Stock quantity is required';
        } else if (isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0) {
            errors.stockQuantity = 'Stock must be a valid non-negative number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(e => ({ ...e, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            let imageUrl = form.imageUrl.trim();

            if (form.imageFile) {
                imageUrl = await uploadImageToServer(form.imageFile);
            }

            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim() || 'Pink Petals',
                description: form.description.trim(),
                price: Number(form.price),
                category: form.category,
                stockQuantity: Number(form.stockQuantity),
                imageUrl: imageUrl,
            };

            if (modalMode === 'create') {
                await ProductService.create(payload);
                showToast('Product created successfully!');
            } else {
                await ProductService.update(selectedProduct.id, payload);
                showToast('Product updated successfully!');
            }
            closeModal();
            fetchProducts();
        } catch (err) {
            showToast(err.message || 'Failed to save product. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!deleteConfirm) {
            setDeleteConfirm(id);
            return;
        }
        try {
            await ProductService.delete(deleteConfirm);
            showToast('Product deleted successfully!');
            setDeleteConfirm(null);
            fetchProducts();
        } catch (err) {
            showToast(err.message || 'Failed to delete product.', 'error');
            setDeleteConfirm(null);
        }
    };

    return (
        <div style={{ 
            fontFamily: 'Jost, sans-serif', 
            minHeight: '100vh',
            background: `linear-gradient(to bottom, rgba(255,250,249,0.70), rgba(255,250,249,0.75)), url('https://images.pexels.com/photos/9775110/pexels-photo-9775110.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package size={18} className="text-[#B76E79]" />
                            <p
                                className="text-xs uppercase tracking-[0.22em] text-[#B76E79]"
                                style={{ fontFamily: 'Jost, sans-serif' }}
                            >
                                Administration
                            </p>
                        </div>
                        <h1
                            style={{
                                fontFamily: 'Playfair Display, serif',
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                                color: '#3d1a22',
                                fontWeight: 600,
                            }}
                        >
                            Product Management
                        </h1>
                    </div>
                    {!isSupplier && (
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-full transition-all duration-300 hover:shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)',
                                fontFamily: 'Jost, sans-serif',
                                boxShadow: '0 8px 24px rgba(183,110,121,0.30)',
                            }}
                        >
                            <Plus size={16} />
                            Add Product
                        </button>
                    )}
                </div>

                <div
                    className="rounded-2xl overflow-hidden border"
                    style={{
                        background: '#fff',
                        borderColor: '#f5d5d8',
                        boxShadow: '0 4px 20px rgba(183,110,121,0.08)',
                    }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: '#fdf5f8' }}>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#B76E79]" style={{ fontFamily: 'Jost, sans-serif' }}>Product</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#B76E79]" style={{ fontFamily: 'Jost, sans-serif' }}>Category</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#B76E79]" style={{ fontFamily: 'Jost, sans-serif' }}>Price</th>
                                    <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#B76E79]" style={{ fontFamily: 'Jost, sans-serif' }}>Stock</th>
                                    {!isSupplier && <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-[#B76E79]" style={{ fontFamily: 'Jost, sans-serif' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(isSupplier ? 4 : 5)].map((_, i) => <TableRowSkeleton key={i} cols={isSupplier ? 4 : 5} />)
                                ) : error ? (
                                    <tr>
                                        <td colSpan={isSupplier ? 4 : 5} className="text-center py-12">
                                            <AlertTriangle size={24} className="mx-auto mb-2 text-red-400" />
                                            <p className="text-sm text-gray-500">{error}</p>
                                            <button
                                                onClick={fetchProducts}
                                                className="mt-3 text-xs text-[#B76E79] underline"
                                            >
                                                Try again
                                            </button>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSupplier ? 4 : 5} className="text-center py-12">
                                            <Package size={32} className="mx-auto mb-3 text-pink-200" />
                                            <p className="text-sm text-gray-400">No products yet. Add your first product above.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p, idx) => (
                                        <tr
                                            key={p.id}
                                            className="border-t transition-colors duration-150 hover:bg-pink-50/30"
                                            style={{ borderColor: '#f5d5d8', background: idx % 2 === 0 ? '#fff' : '#fffaf9' }}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                                                        style={{ background: 'linear-gradient(135deg, #fdeef0 0%, #f5d5d8 100%)' }}
                                                    >
                                                        {p.imageUrl ? (
                                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain bg-white rounded-lg" />
                                                        ) : (
                                                            <Package size={16} className="text-[#B76E79]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                                        <p className="text-[10px] text-gray-400">{p.brand || 'Pink Petals'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="text-xs px-3 py-1 rounded-full border"
                                                    style={{
                                                        borderColor: '#f5d5d8',
                                                        color: '#6b3040',
                                                        background: '#fffaf9',
                                                        fontFamily: 'Jost, sans-serif',
                                                    }}
                                                >
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-[#B76E79]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                    ${Number(p.price).toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium ${Number(p.stockQuantity) === 0 ? 'text-red-500' : Number(p.stockQuantity) < 10 ? 'text-amber-500' : 'text-green-600'}`}>
                                                    {p.stockQuantity}
                                                </span>
                                            </td>
                                            {!isSupplier && (
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(p)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f5d5d8] text-[#B76E79] hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79] transition-all duration-200"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        {deleteConfirm === p.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleDelete(p.id)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 text-white transition-all duration-200"
                                                                >
                                                                    <span className="text-[10px] font-bold">OK</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f5d5d8] text-gray-400 hover:bg-gray-100 transition-all duration-200"
                                                                >
                                                                    <X size={13} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#f5d5d8] text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && !error && products.length > 0 && (
                        <div className="px-4 py-3 border-t text-xs text-gray-400" style={{ borderColor: '#f5d5d8' }}>
                            Total: {products.length} product{products.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(61,26,34,0.5)' }}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.30)' }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f5d5d8' }}>
                            <h2 className="text-lg font-semibold text-[#3d1a22]" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-50 transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleFormChange('name', e.target.value)}
                                    placeholder="e.g. Radiance Renewal Serum"
                                    className={`w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'focus:ring-[#B76E79]'}`}
                                    style={{ borderColor: formErrors.name ? '#fca5a5' : '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                />
                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Brand</label>
                                    <input
                                        type="text"
                                        value={form.brand}
                                        onChange={e => handleFormChange('brand', e.target.value)}
                                        placeholder="e.g. Pink Petals"
                                        className="w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1"
                                        style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={e => handleFormChange('category', e.target.value)}
                                        className={`w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 focus:outline-none focus:ring-1 cursor-pointer ${formErrors.category ? 'border-red-400 focus:ring-red-400' : 'focus:ring-[#B76E79]'}`}
                                        style={{ borderColor: formErrors.category ? '#fca5a5' : '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Company / Supplier</label>
                                    <select
                                        value={form.supplierId}
                                        onChange={e => handleFormChange('supplierId', e.target.value)}
                                        className="w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 focus:outline-none focus:ring-1 cursor-pointer"
                                        style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                    >
                                        <option value="">Select supplier (optional)</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                    placeholder="Describe the product..."
                                    rows={3}
                                    className={`w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 resize-none transition-all ${formErrors.description ? 'border-red-400 focus:ring-red-400' : 'focus:ring-[#B76E79]'}`}
                                    style={{ borderColor: formErrors.description ? '#fca5a5' : '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                />
                                {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Price ($) *</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => handleFormChange('price', e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className={`w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${formErrors.price ? 'border-red-400 focus:ring-red-400' : 'focus:ring-[#B76E79]'}`}
                                        style={{ borderColor: formErrors.price ? '#fca5a5' : '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                    />
                                    {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Stock Qty *</label>
                                    <input
                                        type="number"
                                        value={form.stockQuantity}
                                        onChange={e => handleFormChange('stockQuantity', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className={`w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${formErrors.stockQuantity ? 'border-red-400 focus:ring-red-400' : 'focus:ring-[#B76E79]'}`}
                                        style={{ borderColor: formErrors.stockQuantity ? '#fca5a5' : '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                    />
                                    {formErrors.stockQuantity && <p className="text-xs text-red-500 mt-1">{formErrors.stockQuantity}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-[#B76E79] mb-1">Product Image</label>
                                <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{ borderColor: '#f5d5d8', background: '#fdf8f8' }}>
                                    {form.imagePreview || form.imageUrl ? (
                                        <div className="relative">
                                            <img 
                                                src={form.imagePreview || form.imageUrl} 
                                                alt="Preview" 
                                                className="w-full h-48 object-contain rounded-lg mx-auto"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-[#B76E79]" />
                                            <p className="text-sm text-gray-500 mb-3">Upload product image from device</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#B76E79] text-white rounded-lg cursor-pointer hover:bg-[#9e5c67] transition-colors text-sm"
                                    >
                                        <Upload size={16} />
                                        {form.imagePreview ? 'Change Image' : 'Choose Image'}
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Or enter image URL below:</p>
                                <input
                                    type="url"
                                    value={form.imageUrl}
                                    onChange={e => handleFormChange('imageUrl', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full text-sm px-4 py-3 rounded-xl border bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 mt-1"
                                    style={{ borderColor: '#f5d5d8', fontFamily: 'Jost, sans-serif' }}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 text-sm font-medium py-3 rounded-full border transition-all duration-200 hover:bg-pink-50"
                                    style={{ borderColor: '#f5d5d8', color: '#6b3040', fontFamily: 'Jost, sans-serif' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 text-sm font-medium py-3 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, #b76e79 0%, #c9898a 100%)',
                                        fontFamily: 'Jost, sans-serif',
                                        boxShadow: '0 8px 24px rgba(183,110,121,0.30)',
                                    }}
                                >
                                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border shadow-lg rounded-2xl px-6 py-3 flex items-center gap-3 text-sm ${toastType === 'error' ? 'border-red-200' : 'border-pink-200'}`}
                    style={{ fontFamily: 'Jost, sans-serif', boxShadow: '0 8px 24px rgba(183,110,121,0.15)' }}
                >
                    {toastType === 'error' ? <AlertTriangle size={15} className="text-red-500" /> : <span className="w-2 h-2 rounded-full bg-[#B76E79]" />}
                    <span className="text-gray-700">{toast}</span>
                </div>
            )}
        </div>
    );
};

const AdminProductPage = () => (
    <ErrorBoundary>
        <AdminProductPageContent />
    </ErrorBoundary>
);

export default AdminProductPage;
