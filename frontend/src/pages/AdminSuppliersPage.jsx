import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Grid, List, Building2, CheckCircle, XCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { SupplierService } from '../services/supplierService';
import { SupplierTable, SupplierTableSkeleton } from '../components/SupplierTable';
import { SupplierCard, SupplierCardSkeleton } from '../components/SupplierCard';
import { SupplierFormModal } from '../components/SupplierFormModal';
import ErrorBoundary from '../components/ErrorBoundary';

const AdminSuppliersPageContent = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table');
    const [sortBy, setSortBy] = useState('companyName');
    const [sortOrder, setSortOrder] = useState('asc');
    const [formSubmitting, setFormSubmitting] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await SupplierService.getAll();
            setSuppliers(data || []);
        } catch (err) {
            setError('Failed to load suppliers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: '' }), 4000);
    };

    const handleSubmit = async (formData) => {
        setFormSubmitting(true);
        try {
            if (editingSupplier) {
                await SupplierService.update(editingSupplier.id, formData);
                showToast('Supplier updated successfully!');
            } else {
                await SupplierService.create(formData);
                showToast('Supplier added successfully!');
            }
            setShowModal(false);
            setEditingSupplier(null);
            fetchSuppliers();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save supplier. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    const handleDelete = (supplier) => {
        setConfirmDelete(supplier);
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        try {
            await SupplierService.delete(confirmDelete.id);
            showToast('Supplier deleted successfully!');
            fetchSuppliers();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete supplier.';
            showToast(errorMessage, 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleToggleStatus = async (supplier) => {
        try {
            if (supplier.isActive) {
                await SupplierService.deactivate(supplier.id);
                showToast('Supplier deactivated');
            } else {
                await SupplierService.activate(supplier.id);
                showToast('Supplier activated');
            }
            fetchSuppliers();
        } catch (err) {
            showToast('Failed to update supplier status.', 'error');
        }
    };

    const handleViewDetails = (supplier) => {
        setSelectedSupplier(supplier);
        setShowDetailsModal(true);
    };

    const openCreateModal = () => {
        setEditingSupplier(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
    };

    const filteredSuppliers = React.useMemo(() => {
        let result = suppliers;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.companyName?.toLowerCase().includes(query) ||
                s.contactPerson?.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query) ||
                s.category?.toLowerCase().includes(query) ||
                s.city?.toLowerCase().includes(query)
            );
        }
        
        if (filter === 'active') {
            result = result.filter(s => s.isActive);
        } else if (filter === 'inactive') {
            result = result.filter(s => !s.isActive);
        }
        
        return result;
    }, [suppliers, searchQuery, filter]);

    const stats = React.useMemo(() => ({
        total: suppliers.length,
        active: suppliers.filter(s => s.isActive).length,
        inactive: suppliers.filter(s => !s.isActive).length,
    }), [suppliers]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    return (
        <div className="p-8" style={{ 
            fontFamily: 'Jost, sans-serif', 
            minHeight: '100vh',
            background: `linear-gradient(to bottom, rgba(255,250,249,0.70), rgba(255,250,249,0.75)), url('https://images.pexels.com/photos/9775110/pexels-photo-9775110.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 
                            className="text-3xl font-bold text-deep-burgundy"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Supplier Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your suppliers and procurement partners</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all duration-300 shadow-lg shadow-primary-rose/30 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Supplier
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-pale-rose/30">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-primary-rose" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Total Suppliers</span>
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
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-xs uppercase tracking-wider text-gray-500">Inactive</span>
                        </div>
                        <span className="text-3xl font-bold text-red-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {stats.inactive}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="p-4 border-b border-pale-rose/30">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search suppliers by name, email, or category..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pale-rose focus:border-primary-rose focus:ring-2 focus:ring-primary-rose/20 outline-none transition-all"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Filter:</span>
                                    {['all', 'active', 'inactive'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                                filter === f 
                                                    ? 'bg-primary-rose text-white shadow-md' 
                                                    : 'bg-pale-rose/30 text-deep-burgundy hover:bg-pale-rose/50'
                                            }`}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1 bg-pale-rose/30 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            viewMode === 'table' 
                                                ? 'bg-primary-rose text-white shadow-md' 
                                                : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                        title="Table View"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all duration-200 ${
                                            viewMode === 'grid' 
                                                ? 'bg-primary-rose text-white shadow-md' 
                                                : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                        title="Grid View"
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchSuppliers}
                                className="px-6 py-2 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : viewMode === 'table' ? (
                        <SupplierTable
                            suppliers={filteredSuppliers}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                            onViewDetails={handleViewDetails}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                        />
                    ) : (
                        <div className="p-6">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <SupplierCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredSuppliers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 rounded-full bg-pale-rose/30 flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-10 h-10 text-primary-rose" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-deep-burgundy font-playfair mb-2">
                                        No suppliers found
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {searchQuery ? 'Try adjusting your search' : 'Add your first supplier to get started'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={openCreateModal}
                                            className="px-6 py-2 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all"
                                        >
                                            Add Supplier
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSuppliers.map(supplier => (
                                        <SupplierCard
                                            key={supplier.id}
                                            supplier={supplier}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleStatus={handleToggleStatus}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <SupplierFormModal
                isOpen={showModal}
                onClose={closeModal}
                onSubmit={handleSubmit}
                editingSupplier={editingSupplier}
                loading={formSubmitting}
            />

            {showDetailsModal && selectedSupplier && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-pale-rose/30 px-6 py-4 flex items-center justify-between">
                            <h2 
                                className="text-xl font-bold text-deep-burgundy font-playfair"
                            >
                                Supplier Details
                            </h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 rounded-lg hover:bg-pale-rose/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white font-playfair">
                                        {selectedSupplier.companyName?.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-deep-burgundy font-playfair">
                                        {selectedSupplier.companyName}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        selectedSupplier.isActive 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedSupplier.isActive ? (
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
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Contact Person</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.contactPerson || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Category</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.category || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Email</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Phone</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">City</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.city || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Country</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.country || '-'}</p>
                                </div>
                            </div>

                            {selectedSupplier.address && (
                                <div className="mb-6">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Address</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.address}</p>
                                </div>
                            )}

                            {selectedSupplier.taxId && (
                                <div className="mb-6">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Tax ID</label>
                                    <p className="text-deep-burgundy mt-1">{selectedSupplier.taxId}</p>
                                </div>
                            )}

                            {selectedSupplier.bankDetails && (
                                <div className="mb-6">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Bank Details</label>
                                    <p className="text-deep-burgundy mt-1 whitespace-pre-wrap">{selectedSupplier.bankDetails}</p>
                                </div>
                            )}

                            {selectedSupplier.notes && (
                                <div className="mb-6">
                                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Notes</label>
                                    <p className="text-deep-burgundy mt-1 whitespace-pre-wrap">{selectedSupplier.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-pale-rose/30">
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleEdit(selectedSupplier);
                                    }}
                                    className="flex-1 px-6 py-3 bg-primary-rose text-white rounded-xl hover:bg-deep-rose transition-all font-medium shadow-lg shadow-primary-rose/30"
                                >
                                    Edit Supplier
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleToggleStatus(selectedSupplier);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                >
                                    {selectedSupplier.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
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
                                className="text-xl font-bold text-deep-burgundy mb-2 font-playfair"
                            >
                                Delete Supplier
                            </h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <strong>{confirmDelete.companyName}</strong>? This action cannot be undone.
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

const AdminSuppliersPage = () => (
    <ErrorBoundary>
        <AdminSuppliersPageContent />
    </ErrorBoundary>
);

export default AdminSuppliersPage;
