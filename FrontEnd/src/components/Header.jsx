import { useState } from 'react';
import { 
  FaBell, 
  FaSearch, 
  FaUserCircle, 
  FaChevronDown, 
  FaSignOutAlt,
  FaCog,
  FaUser
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = ({ username }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications] = useState(2); // Sample notification count
    
    // Get current date for the header
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', dateOptions);
    
    return (
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Search & Date */}
                <div className="flex items-center">
                    <div className="relative mr-6">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg pl-10 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 w-48 lg:w-64"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="hidden md:block text-gray-400 text-sm">
                        {dateString}
                    </div>
                </div>
                
                {/* Right side - Actions & User */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <FaBell className="text-gray-300 w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                    {notifications}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* User profile */}
                    <div className="relative">
                        <button 
                            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                                {username?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium text-white">{username}</div>
                                <div className="text-xs text-gray-400">Administrator</div>
                            </div>
                            <FaChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                                <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                                    <FaUser className="mr-2 w-4 h-4" />
                                    Profile
                                </Link>
                                <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                                    <FaCog className="mr-2 w-4 h-4" />
                                    Settings
                                </Link>
                                <div className="border-t border-gray-700 my-1"></div>
                                <Link to="/logout" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                                    <FaSignOutAlt className="mr-2 w-4 h-4" />
                                    Sign out
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
