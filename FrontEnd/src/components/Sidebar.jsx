import { Link, useLocation } from "react-router-dom";
import { 
    FaFire, 
    FaChartLine, 
    FaVideo, 
    FaUserCog, 
    FaCog, 
    FaHistory, 
    FaBell,
    FaSignOutAlt
} from 'react-icons/fa';
import { useState } from "react";

const Sidebar = () => {
    const location = useLocation();
    const [alertsCount, setAlertsCount] = useState(1);

    // Function to check if link is active
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    return (
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen flex flex-col">
            {/* Logo section */}
            <div className="p-5">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                        <FaFire className="text-white text-xl" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Fire Detection</h1>
                </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-5">
                <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Monitoring
                </div>
                
                <div className="space-y-1">
                    <Link 
                        to="/dashboard" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/dashboard') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaChartLine className="mr-3 w-5 h-5" />
                        Dashboard
                    </Link>
                    
                    <Link 
                        to="/cameras" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/cameras') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaVideo className="mr-3 w-5 h-5" />
                        Camera Feeds
                    </Link>
                    
                    <Link 
                        to="/alerts" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/alerts') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaBell className="mr-3 w-5 h-5" />
                        Alerts
                        {alertsCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {alertsCount}
                        </span>
                        )}
                    </Link>
                    
                    <Link 
                        to="/history" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/history') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaHistory className="mr-3 w-5 h-5" />
                        Detection History
                    </Link>
                </div>
                
                {/* Settings Section */}
                {/* <div className="mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Settings
                </div>
                
                <div className="space-y-1">
                    <Link 
                        to="/profile" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/profile') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaUserCog className="mr-3 w-5 h-5" />
                        Profile
                    </Link>
                    
                    <Link 
                        to="/settings" 
                        className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive('/settings') 
                                ? 'bg-gray-700 text-orange-500' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <FaCog className="mr-3 w-5 h-5" />
                        System Settings
                    </Link>
                </div> */}
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-700">
                <Link 
                    to="/logout"
                    className="flex items-center px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <FaSignOutAlt className="mr-3 w-5 h-5" />
                    Logout
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;


