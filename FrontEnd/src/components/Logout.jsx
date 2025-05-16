import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Clear auth tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Set up countdown timer
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        // Cleanup timer on unmount
        return () => clearInterval(timer);
    }, [navigate]);
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <div className="relative w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden text-center">
                {/* Decorative flame effects */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-t from-orange-600 to-red-600 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-b from-orange-500 to-red-500 rounded-full opacity-10 blur-xl"></div>
                
                <div className="relative mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <FaSignOutAlt size={28} />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">Logging Out</h1>
                <p className="text-gray-400 mb-6">Please wait while we securely log you out...</p>
                
                <div className="relative pt-1 mb-4">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                        <div 
                            style={{ width: `${(countdown / 3) * 100}%` }}
                            className="transition-all duration-1000 ease-out rounded bg-gradient-to-r from-orange-500 to-red-600 shadow-inner flex flex-col text-center whitespace-nowrap text-white justify-center h-full"
                        ></div>
                    </div>
                </div>
                
                <p className="text-sm text-gray-400">
                    Redirecting you to login page in <span className="font-semibold text-orange-500">{countdown}</span> seconds...
                </p>
                
                {/* Brand footer */}
                <div className="mt-8 text-center text-gray-500 text-xs flex items-center justify-center">
                    <FaFire className="text-orange-500 mr-1" />
                    <span>© 2025 Fire Detection System</span>
                </div>
            </div>
        </div>
    );
}

export default Logout;
