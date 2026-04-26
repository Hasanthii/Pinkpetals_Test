import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { authApi } from '../services/authService.js';
import { userApi } from '../services/userService.js';
import { getUserInitials, getUserDisplayName } from '../types/user.js';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { ProfileSkeleton } from '../components/SkeletonLoader.jsx';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (!authApi.isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                phone: currentUser.phone || '',
                address: currentUser.address || ''
            });
            authApi.setAuth(authApi.getToken(), currentUser);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required.');
            return;
        }

        setIsSaving(true);
        try {
            const updatedUser = await userApi.updateUser(user.id, formData);
            setUser(updatedUser);
            authApi.setAuth(authApi.getToken(), updatedUser);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setIsSaving(true);
        try {
            await userApi.changePassword(user.id, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess('Password changed successfully!');
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        authApi.logout();
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background-cream via-pale-rose to-soft-blush py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background-cream via-pale-rose to-soft-blush flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-primary-rose mx-auto mb-4" />
                    <h2 className="font-playfair text-2xl font-bold text-deep-burgundy mb-2">Unable to Load Profile</h2>
                    <button onClick={() => navigate('/login')} className="text-primary-rose hover:text-deep-rose">
                        Please login again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-background-cream via-pale-rose to-soft-blush py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg shadow-primary-rose/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-rose to-warm-rose p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white font-playfair">
                                        {getUserInitials(user)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">
                                        {getUserDisplayName(user)}
                                    </h1>
                                    <p className="text-white/80 font-jost text-sm mt-1">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-pale-rose">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-6 py-4 font-jost font-medium text-sm tracking-wide transition-colors duration-200 border-b-2 ${
                                        activeTab === 'profile'
                                            ? 'border-primary-rose text-primary-rose'
                                            : 'border-transparent text-warm-rose/70 hover:text-primary-rose'
                                    }`}
                                >
                                    <UserIcon className="w-4 h-4 inline mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`px-6 py-4 font-jost font-medium text-sm tracking-wide transition-colors duration-200 border-b-2 ${
                                        activeTab === 'security'
                                            ? 'border-primary-rose text-primary-rose'
                                            : 'border-transparent text-warm-rose/70 hover:text-primary-rose'
                                    }`}
                                >
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Security
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm font-jost">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-green-700 text-sm font-jost">{success}</p>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2 tracking-wide">
                                                First Name
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy focus:outline-none focus:ring-2 focus:ring-primary-rose/50 focus:border-primary-rose transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2 tracking-wide">
                                                Last Name
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy focus:outline-none focus:ring-2 focus:ring-primary-rose/50 focus:border-primary-rose transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2 tracking-wide">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full pl-12 pr-4 py-3 border border-pale-rose/50 rounded-xl font-jost text-warm-rose/60 bg-pale-rose/20 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2 tracking-wide">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="w-full pl-12 pr-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy placeholder-warm-rose/40 focus:outline-none focus:ring-2 focus:ring-primary-rose/50 focus:border-primary-rose transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2 tracking-wide">
                                            Shipping Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-warm-rose/60" />
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="Enter your full shipping address"
                                                className="w-full pl-12 pr-4 py-3 border border-pale-rose rounded-xl font-jost text-deep-burgundy placeholder-warm-rose/40 focus:outline-none focus:ring-2 focus:ring-primary-rose/50 focus:border-primary-rose transition-all duration-200 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-gradient-to-r from-primary-rose to-warm-rose text-white font-jost font-medium rounded-xl hover:from-deep-rose hover:to-primary-rose shadow-lg shadow-primary-rose/30 hover:shadow-xl hover:shadow-primary-rose/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-pale-rose/30 to-soft-blush/30 rounded-xl p-6">
                                        <h3 className="font-playfair text-lg font-semibold text-deep-burgundy mb-4">Password</h3>
                                        <p className="font-jost text-sm text-warm-rose/80 mb-4">
                                            Change your password to keep your account secure.
                                        </p>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="px-6 py-3 bg-white border border-primary-rose text-primary-rose font-jost font-medium rounded-xl hover:bg-primary-rose hover:text-white transition-all duration-300 flex items-center gap-2"
                                        >
                                            <Lock className="w-5 h-5" />
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-br from-pale-rose/30 to-soft-blush/30 rounded-xl p-6">
                                        <h3 className="font-playfair text-lg font-semibold text-deep-burgundy mb-4">Account Status</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-jost font-medium ${
                                                user.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-warm-rose/60">|</span>
                                            <span className="font-jost text-sm text-warm-rose/80">
                                                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h3 className="font-playfair text-xl font-bold text-deep-burgundy mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-jost text-sm font-medium text-deep-burgundy mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-rose/60" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full pl-12 pr-12 py-3 border border-pale-rose rounded-xl font-jost focus:outline-none focus:ring-2 focus:ring-primary-rose/50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-rose/60"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        className="flex-1 py-3 border border-pale-rose text-deep-burgundy font-jost rounded-xl hover:bg-pale-rose/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-gradient-to-r from-primary-rose to-warm-rose text-white font-jost rounded-xl hover:from-deep-rose transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
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

export default ProfilePage;
