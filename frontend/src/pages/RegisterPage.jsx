import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Flower2, AlertCircle, CheckCircle2, Sparkles, Truck, Shield, Gift, Star, UserCircle, ChevronDown } from 'lucide-react';
import { authApi } from '../services/authService.js';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CUSTOMER'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.username || !formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            console.log('Sending registration data:', JSON.stringify(registerData));
            const response = await authApi.register(registerData);
            console.log('Registration response:', response);
            if (response && response.token && response.user) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            let errorMessage = err.message || 'Registration failed. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #fffaf9 0%, #fdeef0 50%, #fce4e8 100%)' }}>
                <div className="w-full max-w-md text-center">
                    <div className="bg-white rounded-3xl p-10 shadow-xl shadow-primary-rose/10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#3d1a22] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Welcome to PinkPetals!
                        </h2>
                        <p className="text-[#c9898a] text-sm mb-6" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Your account has been created. Redirecting you to login...
                        </p>
                        <div className="h-1 bg-gradient-to-r from-[#b76e79] to-[#c9898a] rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fffaf9 0%, #fdeef0 50%, #fce4e8 100%)' }}>
                <div className="w-full max-w-md p-8 bg-white/80 rounded-3xl animate-pulse">
                    <div className="h-8 bg-[#f5d5d8] rounded-xl mb-4 w-1/2 mx-auto" />
                    <div className="h-4 bg-[#f5d5d8] rounded w-3/4 mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Register Form */}
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
                            <h2 className="text-2xl font-bold text-[#3d1a22] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Create Account</h2>
                            <p className="text-[#c9898a] text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>Join thousands of happy customers</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm font-jost">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Username <span className="text-[#B76E79]">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserCircle className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="Choose a username"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-[#c9898a]" />
                                        </div>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                            style={{ fontFamily: 'Jost, sans-serif' }}
                                            placeholder="Jane"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="jane.doe@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Phone <span className="text-[#c9898a]">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="+94 77 123 4567"
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
                                        placeholder="Min. 6 characters"
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] placeholder-[#c9898a]/50 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-[#3d1a22] mb-2 tracking-wide" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    Account Type <span className="text-[#B76E79]">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-[#f5d5d8] rounded-xl text-[#3d1a22] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30 focus:border-[#B76E79] transition-all duration-200 bg-white appearance-none cursor-pointer"
                                        style={{ fontFamily: 'Jost, sans-serif' }}
                                    >
                                        <option value="CUSTOMER">Customer - Shop for products</option>
                                        <option value="SUPPLIER">Supplier - Supply products to us</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <ChevronDown className="h-5 w-5 text-[#c9898a]" />
                                    </div>
                                </div>
                                <p className="text-xs text-[#c9898a] mt-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                                    {formData.role === 'CUSTOMER' 
                                        ? 'Create a customer account to browse and purchase products.' 
                                        : 'Create a supplier account to manage product supply and orders.'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-[#b76e79] to-[#c9898a] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#B76E79]/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.02em' }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[#c9898a] text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#B76E79] font-medium hover:text-[#9e5c67] transition-colors duration-200">
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-[#f5d5d8]">
                            <p className="text-center text-[#c9898a] text-xs italic" style={{ fontFamily: 'Jost, sans-serif' }}>
                                By creating an account, you agree to our Terms of Service and Privacy Policy
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
                        src="https://images.pexels.com/photos/5069397/pexels-photo-5069397.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                        alt="Pensive woman with cosmetic cream on face" 
                        className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* Lighter overlay for better image visibility */}
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(61,26,34,0.55) 0%, rgba(107,48,64,0.45) 50%, rgba(183,110,121,0.35) 100%)' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 py-16 w-full">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Flower2 className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>PinkPetals</span>
                        </div>
                        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Join the<br />
                            <em className="font-style italic">Petal Club</em><br />
                            Today
                        </h1>
                        <p className="text-white/90 text-lg leading-relaxed max-w-md" style={{ fontFamily: 'Jost, sans-serif' }}>
                            Create your account and unlock exclusive offers, early access to new products, and personalized skincare recommendations.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                            { icon: <Sparkles size={18} />, title: '10% Off First Order', desc: 'Use code GLOW10' },
                            { icon: <Gift size={18} />, title: 'Free Samples', desc: 'With every purchase' },
                            { icon: <Truck size={18} />, title: 'Free Shipping', desc: 'Orders over $5,000' },
                            { icon: <Shield size={18} />, title: 'Secure Checkout', desc: '100% protected' },
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
                            "I have never looked this fresh. The serum completely transformed my skin — soft, radiant and glowing."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-semibold">
                                N
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>Nalini S.</p>
                                <p className="text-white/60 text-xs" style={{ fontFamily: 'Jost, sans-serif' }}>Colombo, Sri Lanka</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;