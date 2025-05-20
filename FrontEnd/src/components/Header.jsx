import { useState, useEffect, useRef } from 'react';
import {
    FaBell,
    FaSearch,
    FaUserCircle,
    FaChevronDown,
    FaSignOutAlt,
    FaCog,
    FaUser,
    FaBars,
    FaTimes,
    FaClock
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import AlertAPI from '../api/alerts'; // Adjust the import path as necessary

const Header = ({ username, toggleSidebar, sidebarOpen}) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications,setNotification] = useState(); // Sample notification count
    const [currentTime, setCurrentTime] = useState(new Date());
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Get current date for the header
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentTime.toLocaleDateString('en-US', dateOptions);
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        // Clear auth tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');

        // Redirect to login page
        navigate('/');
    };

    useEffect(() => {
        // Fetch alerts when the component mounts
        fetchAlerts();
    }, []);
    const fetchAlerts = async () => {
        const response = await AlertAPI.getActiveAlerts();
        setNotification(response.data.length);
            
    };

    return (
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left side - Toggle, Logo & Date */}
                <div className="flex items-center space-x-4">

                    <div className="hidden md:flex items-center space-x-3 text-gray-400 text-sm">
                        <FaClock className="text-blue-400" />
                        <div>
                            <div className="font-medium text-gray-300">{dateString}</div>
                            <div>{timeString}</div>
                        </div>
                    </div>
                </div>

                {/* Right side - Actions & User */}
                <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors relative">
                            <FaBell className="text-gray-300 w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                    {notifications}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* User profile */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-medium shadow-md">
                                {username?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium text-white">{username}</div>
                                <div className="text-xs text-gray-400">Administrator</div>
                            </div>
                            <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown menu with animation */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-xl py-1 z-50 animate-fadeIn">
                                <div className="px-4 py-2 border-b border-gray-700">
                                    <div className="text-sm font-medium text-white">{username}</div>
                                    <div className="text-xs text-gray-400">Administrator</div>
                                </div>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white w-full text-left"
                                >
                                    <FaSignOutAlt className="mr-2 w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
