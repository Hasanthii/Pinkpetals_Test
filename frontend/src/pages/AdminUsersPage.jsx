import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, RefreshCw, AlertCircle, CheckCircle2, UserPlus, X, Trash2 } from 'lucide-react';
import { authApi } from '../services/authService.js';
import { userApi } from '../services/userService.js';
import { UserRole } from '../types/user.js';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';
import UserTable from '../components/UserTable.jsx';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        role: 'CUSTOMER'
    });

    const [editUser, setEditUser] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        role: '',
        isActive: true
    });

    useEffect(() => {
        const role = localStorage.getItem('pinkpetals_role');
        if (role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userApi.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to load users. Make sure the backend is running on port 8080.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }
        setIsLoading(true);
        try {
            const results = await userApi.searchUsers(searchQuery);
            setUsers(results);
        } catch (err) {
            setError(err.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleFilter = async (role) => {
        setRoleFilter(role);
        setIsLoading(true);
        try {
            if (role === 'ALL') {
                const data = await userApi.getAllUsers();
                setUsers(data);
            } else {
                const data = await userApi.getUsersByRole(role);
                setUsers(data);
            }
        } catch (err) {
            setError(err.message || 'Filter failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await userApi.createUser(newUser);
            setSuccess('User created successfully');
            setShowAddModal(false);
            setNewUser({
                username: '',
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phone: '',
                address: '',
                role: 'CUSTOMER'
            });
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditUser({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'CUSTOMER',
            isActive: user.isActive
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await userApi.adminUpdateUser(selectedUser.id, editUser);
            setSuccess('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        
        try {
            await userApi.deleteUser(userId);
            setSuccess('User deleted successfully');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const handleDeactivateUser = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        
        try {
            await userApi.deactivateUser(userId);
            setSuccess('User deactivated successfully');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to deactivate user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await userApi.activateUser(userId);
            setSuccess('User activated successfully');
            fetchUsers();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to activate user');
        }
    };

    const filteredUsers = users.filter(user => {
        if (statusFilter === 'ACTIVE') return user.isActive;
        if (statusFilter === 'INACTIVE') return !user.isActive;
        return true;
    });

    const roleStats = {
        ALL: users.length,
        ADMIN: users.filter(u => u.role === UserRole.ADMIN).length,
        CUSTOMER: users.filter(u => u.role === UserRole.CUSTOMER).length,
        SUPPORT_STAFF: users.filter(u => u.role === UserRole.SUPPORT_STAFF).length,
        SUPPLIER: users.filter(u => u.role === UserRole.SUPPLIER).length
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-background-cream via-pale-rose to-soft-blush py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-deep-burgundy flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                User Management
                            </h1>
                            <p className="font-jost text-warm-rose/80 mt-2">Manage all registered users and their account status</p>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <button
                                onClick={fetchUsers}
                                disabled={isLoading}
                                className="px-6 py-3 bg-white border border-primary-rose text-primary-rose font-jost font-medium rounded-xl hover:bg-primary-rose hover:text-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-primary-rose to-warm-rose text-white font-jost font-medium rounded-xl hover:from-deep-rose hover:to-primary-rose transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary-rose/30"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add User
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm font-jost">{error}</p>
                            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-green-700 text-sm font-jost">{success}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-lg shadow-primary-rose/10 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-12 pr-4 py-3 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50 focus:border-primary-rose transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleFilter(e.target.value)}
                                    className="px-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy focus:outline-none focus:ring-2 focus:ring-primary-rose/50 bg-white"
                                >
                                    <option value="ALL">All Roles ({roleStats.ALL})</option>
                                    <option value="ADMIN">Admin ({roleStats.ADMIN})</option>
                                    <option value="CUSTOMER">Customer ({roleStats.CUSTOMER})</option>
                                    <option value="SUPPORT_STAFF">Support Staff ({roleStats.SUPPORT_STAFF})</option>
                                    <option value="SUPPLIER">Supplier ({roleStats.SUPPLIER})</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy focus:outline-none focus:ring-2 focus:ring-primary-rose/50 bg-white"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active Only</option>
                                    <option value="INACTIVE">Inactive Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg shadow-primary-rose/10 overflow-hidden">
                        {isLoading ? (
                            <div className="p-6">
                                <TableSkeleton rows={5} />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-16 h-16 text-warm-rose/40 mx-auto mb-4" />
                                <h3 className="font-playfair text-xl font-semibold text-deep-burgundy mb-2">No Users Found</h3>
                                <p className="font-jost text-warm-rose/60">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <UserTable
                                users={filteredUsers}
                                onDeactivate={handleDeactivateUser}
                                onActivate={handleActivateUser}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                            />
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm font-jost text-warm-rose/60">
                        <span>Showing {filteredUsers.length} of {users.length} users</span>
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-pale-rose/30">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-playfair text-2xl font-bold text-deep-burgundy">Add New User</h2>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-pale-rose/30 rounded-lg transition-colors">
                                        <X className="w-5 h-5 text-warm-rose" />
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={handleAddUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Username *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUser.firstName}
                                            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUser.lastName}
                                            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Role *</label>
                                        <select
                                            required
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50 bg-white"
                                        >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SUPPORT_STAFF">Support Staff</option>
                                            <option value="SUPPLIER">Supplier</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Address</label>
                                    <textarea
                                        rows={2}
                                        value={newUser.address}
                                        onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                                        className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-6 py-3 border border-pale-rose text-warm-rose font-jost font-medium rounded-xl hover:bg-pale-rose/30 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-rose to-warm-rose text-white font-jost font-medium rounded-xl hover:from-deep-rose hover:to-primary-rose transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-pale-rose/30">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-playfair text-2xl font-bold text-deep-burgundy">Edit User</h2>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-pale-rose/30 rounded-lg transition-colors">
                                        <X className="w-5 h-5 text-warm-rose" />
                                    </button>
                                </div>
                                <p className="font-jost text-sm text-warm-rose/60 mt-1">Editing: {selectedUser.email}</p>
                            </div>
                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editUser.firstName}
                                            onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editUser.lastName}
                                            onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={editUser.phone}
                                            onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Role *</label>
                                        <select
                                            required
                                            value={editUser.role}
                                            onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                                            className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50 bg-white"
                                        >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SUPPORT_STAFF">Support Staff</option>
                                            <option value="SUPPLIER">Supplier</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Status</label>
                                    <select
                                        value={editUser.isActive ? 'true' : 'false'}
                                        onChange={(e) => setEditUser({...editUser, isActive: e.target.value === 'true'})}
                                        className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50 bg-white"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-1">Address</label>
                                    <textarea
                                        rows={2}
                                        value={editUser.address}
                                        onChange={(e) => setEditUser({...editUser, address: e.target.value})}
                                        className="w-full px-4 py-2 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-6 py-3 border border-pale-rose text-warm-rose font-jost font-medium rounded-xl hover:bg-pale-rose/30 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-rose to-warm-rose text-white font-jost font-medium rounded-xl hover:from-deep-rose hover:to-primary-rose transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default AdminUsersPage;
