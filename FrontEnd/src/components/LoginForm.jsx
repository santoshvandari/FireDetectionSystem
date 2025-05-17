import { useEffect, useState } from 'react';
// import API from '../services/api';
import AuthAPI from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaFire } from 'react-icons/fa';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!username.trim()) newErrors.username = 'Username is required';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear old errors

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await AuthAPI.login(username, password);
            console.log('Login success:', res);

            const token = res?.data?.access || res?.data?.token;
            if (!token) {
                setErrors({ form: 'Login failed. No token received from server.' });
                return;
            }

            if (rememberMe) {
                localStorage.setItem('token', token);
            } else {
                sessionStorage.setItem('token', token);
            }

            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            let message = 'Login failed. Please check your credentials.';
            if (err?.data?.detail) {
                message = err.data.detail;
            } else if (typeof err?.data?.message === 'string') {
                message = err.data.message;
            } else if (err?.status === 500) {
                message = 'Server error. Please try again later.';
            }
            setErrors({ form: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-scree">
            <div className="relative w-full max-w-md p-8 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                { /* Decorative flame effect in background */ }
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-t from-orange-600 to-red-600 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-b from-orange-500 to-red-500 rounded-full opacity-10 blur-xl"></div>
                
                {/* Header with logo */}
                <div className="relative flex flex-col items-center mb-8">
                    <div className="flex justify-center items-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                        <FaFire className="text-white text-3xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Fire Detection</h2>
                    <p className="text-gray-400 text-center">Secure login required to access the system</p>
                </div>

                {/* Error message */}
                {errors.form && (
                    <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-300">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.form}
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="relative space-y-6">
                    {/* Username Field */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="username">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                                <FaUser />
                            </div>
                            <input
                                id="username"
                                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all ${
                                    errors.username 
                                        ? 'border-red-500 focus:ring-red-500/30' 
                                        : 'border-gray-600 focus:ring-orange-500/30 focus:border-orange-500'
                                }`}
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">
                                <FaLock />
                            </div>
                            <input
                                id="password"
                                className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all ${
                                    errors.password 
                                        ? 'border-red-500 focus:ring-red-500/30' 
                                        : 'border-gray-600 focus:ring-orange-500/30 focus:border-orange-500'
                                }`}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors focus:outline-none focus:text-orange-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded text-orange-500 border-gray-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Remember me
                            </label>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        className={`relative w-full py-3 rounded-lg text-white font-medium overflow-hidden transition-all duration-300 ${
                            isLoading
                                ? 'bg-orange-700/70 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-500/20'
                        }`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </div>
                        ) : (
                            <>
                                <span className="relative z-10">Login to Dashboard</span>
                                <div className="absolute inset-0 -z-0 w-0 bg-orange-700 transition-all duration-300 group-hover:w-full"></div>
                            </>
                        )}
                    </button>
                </form>

                {/* Copyright footer */}
                <div className="mt-8 text-center text-gray-500 text-xs">
                    © 2025 Fire Detection System. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
