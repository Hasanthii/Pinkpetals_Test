import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Users, Package, Tag, Truck, User, Settings, LogOut, Flower2, ChevronRight, Star, Gift, Activity } from 'lucide-react';
import { authApi } from '../services/authService.js';
import { getUserInitials, getUserDisplayName } from '../types/user.js';

const SidebarLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = authApi.getStoredUser();
    const role = localStorage.getItem('pinkpetals_role');
    const isAdmin = role === 'ADMIN';
    const isSupplier = role === 'SUPPLIER';
    const isCustomer = role === 'CUSTOMER';

    const handleLogout = () => {
        authApi.logout();
        navigate('/');
    };

    const mainNavItems = [
        { path: '/', icon: Home, label: 'Home', color: 'text-primary-rose' },
        { path: '/shop', icon: ShoppingBag, label: 'Shop', color: 'text-warm-rose' },
        { path: '/deals', icon: Gift, label: 'Deals', color: 'text-soft-rose' },
    ];

    const adminNavItems = [
        { path: '/admin/products', icon: Package, label: 'Products', color: 'text-deep-rose' },
        { path: '/admin/users', icon: Users, label: 'Users', color: 'text-warm-rose' },
        { path: '/admin/orders', icon: Tag, label: 'Orders', color: 'text-soft-rose' },
        { path: '/admin/reviews', icon: Star, label: 'Reviews', color: 'text-primary-rose' },
        { path: '/admin/promotions', icon: Gift, label: 'Promotions', color: 'text-deep-rose' },
        { path: '/admin/suppliers', icon: Truck, label: 'Suppliers', color: 'text-muted-rose' },
        { path: '/admin/forecast', icon: Activity, label: 'Forecast', color: 'text-emerald-600' },
        { path: '/admin/forecast-chart', icon: Activity, label: 'ML Analytics', color: 'text-emerald-600' },
    ];

    const supplierNavItems = [
        { path: '/supplier/dashboard', icon: Home, label: 'Dashboard', color: 'text-primary-rose' },
        { path: '/supplier/products', icon: Package, label: 'Products', color: 'text-soft-rose' },
    ];

    const customerNavItems = [
        { path: '/customer/dashboard', icon: Home, label: 'Dashboard', color: 'text-primary-rose' },
        { path: '/cart', icon: ShoppingBag, label: 'My Bag', color: 'text-warm-rose' },
        { path: '/orders', icon: Tag, label: 'My Orders', color: 'text-soft-rose' },
        { path: '/profile', icon: User, label: 'My Profile', color: 'text-primary-rose' },
        { path: '/reviews', icon: Star, label: 'My Reviews', color: 'text-primary-rose' },
    ];

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
            <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                        ? 'bg-gradient-to-r from-primary-rose to-warm-rose text-white shadow-lg shadow-primary-rose/30'
                        : 'text-deep-burgundy hover:bg-pale-rose/50'
                }`}
            >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                <span className="font-jost font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-cream via-pale-rose to-soft-blush flex">
            <aside className="w-72 bg-white shadow-xl shadow-primary-rose/10 flex flex-col">
                <div className="p-6 border-b border-pale-rose">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center">
                            <Flower2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-playfair text-xl font-bold text-deep-burgundy">PinkPetals</h1>
                            <p className="font-jost text-xs text-warm-rose/60 tracking-wider">SKINCARE STORE</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="px-4 mb-2 font-jost text-xs font-semibold text-warm-rose/60 uppercase tracking-widest">
                            Navigation
                        </h3>
                        <div className="space-y-2">
                            {mainNavItems.map(item => <NavItem key={item.path} item={item} />)}
                        </div>
                    </div>

                    {isAdmin && (
                        <div>
                            <h3 className="px-4 mb-2 font-jost text-xs font-semibold text-warm-rose/60 uppercase tracking-widest">
                                Administration
                            </h3>
                            <div className="space-y-2">
                                {adminNavItems.map(item => <NavItem key={item.path} item={item} />)}
                            </div>
                        </div>
                    )}

                    {isSupplier && (
                        <div>
                            <h3 className="px-4 mb-2 font-jost text-xs font-semibold text-warm-rose/60 uppercase tracking-widest">
                                Supplier Portal
                            </h3>
                            <div className="space-y-2">
                                {supplierNavItems.map(item => <NavItem key={item.path} item={item} />)}
                            </div>
                        </div>
                    )}

                    {(isCustomer || !role) && (
                        <div>
                            <h3 className="px-4 mb-2 font-jost text-xs font-semibold text-warm-rose/60 uppercase tracking-widest">
                                My Account
                            </h3>
                            <div className="space-y-2">
                                {customerNavItems.map(item => <NavItem key={item.path} item={item} />)}
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-pale-rose">
                    {user && (
                        <div className="bg-gradient-to-br from-pale-rose/30 to-soft-blush/30 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center">
                                    <span className="text-sm font-bold text-white font-playfair">
                                        {getUserInitials(user)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-jost text-sm font-medium text-deep-burgundy truncate">
                                        {getUserDisplayName(user)}
                                    </p>
                                    <p className="font-jost text-xs text-warm-rose/60 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-jost font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default SidebarLayout;
