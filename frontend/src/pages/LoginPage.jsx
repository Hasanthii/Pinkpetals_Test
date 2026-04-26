import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Flower2, AlertCircle, Sparkles, Truck, Shield, Gift, Star } from 'lucide-react';
import { authApi, handleAuthSuccess } from '../services/authService.js';

const HARDCODED_ADMIN = {
    username: 'admin',
    password: 'admin123'
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const getRedirectPath = (role) => {
        switch (role) {
            case 'ADMIN': return '/admin/dashboard';
            case 'SUPPLIER': return '/supplier/dashboard';
            case 'SUPPORT_STAFF': return '/admin/dashboard';
            case 'CUSTOMER': return '/';
            default: return '/';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsLoading(true);
        
        const identifier = formData.email.trim();
        const password = formData.password;

        // Check hardcoded admin credentials
        if (identifier === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
            try {
                const response = await authApi.login({ email: identifier, password: password });
                if (response && response.token && response.user) {
                    handleAuthSuccess(response);
                    const redirectPath = getRedirectPath(response.user.role);
                    navigate(redirectPath);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err) {
                console.error('Login error:', err);
                setError(err.message || 'Invalid credentials. Please try again.');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Try API login for real registered users
        try {
            const response = await authApi.login({ email: identifier, password: password });
            if (response && response.token && response.user) {
                handleAuthSuccess(response);
                const redirectPath = getRedirectPath(response.user.role);
                navigate(redirectPath);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid username/email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #fffaf9 0%, #fdeef0 50%, #fce4e8 100%)' }}>
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#b76e79] to-[#c9898a] flex items-center justify-center">
                                <Flower2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[#3d1a22] text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>PinkPetals</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-primary-rose/10 p-8 md:p-10" style={{ boxShadow: '0 20px 60px rgba(183,110,121,0.15)' }}>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-[#3d1a22] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome Back</h2>
                            <p className="text-[#c9898a] text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>Sign in to continue your beauty journey</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm font-jost">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Username / Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="Enter username or email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#c9898a] hover:text-[#B76E79] transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <Link to="/forgot-password" className="text-sm text-[#B76E79] hover:text-[#9e5c67] transition-colors duration-200" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#b76e79] to-[#c9898a] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.02em' }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[#c9898a] text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#B76E79] font-medium hover:text-[#9e5c67] transition-colors duration-200">
                                    Create one here
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[#f5d5d8]">
                            <p className="text-center text-[#c9898a] text-xs italic" style={{ fontFamily: 'Jost, sans-serif' }}>
                                By signing in, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Brand & Value with Image Background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-2xl m-4 ml-0">
                {/* Background Image */}
                <div className="absolute inset-0 rounded-2xl">
                    <img 
                        src="https://images.pexels.com/photos/5069388/pexels-photo-5069388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                        alt="Content woman with cosmetic product" 
                        className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* Lighter overlay for better image visibility */}
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(61,26,34,0.55) 0%, rgba(107,48,64,0.45) 50%, rgba(183,110,121,0.35) 100%)' }} />
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', top: '10%', left: '10%' }} />
                    <div className="absolute w-64 h-64 rounded-full opacity-15 animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', bottom: '20%', right: '10%', animationDelay: '1s' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 py-16 w-full">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Flower2 className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>PinkPetals</span>
                        </div>
                        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Bloom into<br />
                            <em className="font-style italic">Your Most Radiant</em><br />
                            Self
                        </h1>
                        <p className="text-white/90 text-lg leading-relaxed max-w-md" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Premium skincare and cosmetics, handpicked for every skin story. Crafted with botanicals, powered by science.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        {[
                            { icon: <Sparkles size={18} />, title: 'Natural Ingredients', desc: 'Botanical extracts' },
                            { icon: <Shield size={18} />, title: 'Dermatologist Tested', desc: 'Safe for all skin' },
                            { icon: <Truck size={18} />, title: 'Island-wide Delivery', desc: 'Free over $5,000' },
                            { icon: <Gift size={18} />, title: 'Free Samples', desc: 'With every order' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-300">
                                <div className="text-white mb-2">{item.icon}</div>
                                <h3 className="text-white font-semibold text-sm mb-1" style={{ fontFamily: 'Jost, sans-serif' }}>{item.title}</h3>
                                <p className="text-white/70 text-xs" style={{ fontFamily: 'Jost, sans-serif' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <div className="flex gap-1 mb-3">
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-amber-300 text-amber-300" />)}
                        </div>
                        <p className="text-white/90 text-sm italic mb-4" style={{ fontFamily: 'Jost, sans-serif' }}>
                            "The HydroSilk Moisturiser is the best I have tried. My skin stays hydrated all day long. Absolutely love it!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-semibold">
                                D
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>Dinusha P.</p>
                                <p className="text-white/60 text-xs" style={{ fontFamily: 'Jost, sans-serif' }}>Kandy, Sri Lanka</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;