import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaVideo, FaExclamationTriangle, 
  FaBell, FaClipboardCheck, FaChartLine, 
  FaFire, FaExclamationCircle, FaBars, FaTimes
} from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardUI = () => {
    const [username, setUsername] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    
    // Sample data for demo purposes
    const [alertCount, setAlertCount] = useState(2);
    const [cameraCount, setCameraCount] = useState(8);
    const [detectionCount, setDetectionCount] = useState(124);
    
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
        }

        // Optional: Decode or fetch user info with token
        setUsername('Santosh'); // Replace with dynamic value
        
        // Check screen width on component mount and adjust sidebar
        const checkScreenSize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [navigate]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleSidebar}
                ></div>
            )}
            
            {/* Sidebar with responsive behavior */}
            <div 
                className={`fixed lg:static inset-y-0 left-0 z-30 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 ease-in-out w-72`}
            >
                <Sidebar />
            </div>
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
                {/* Mobile header with menu toggle */}
                <div className="lg:hidden flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <button 
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="ml-4 flex items-center">
                        <FaFire className="text-orange-500 mr-2" />
                        <span className="font-bold text-lg">Fire Detection</span>
                    </div>
                </div>
                
                {/* Desktop header */}
                <div className="hidden lg:block">
                    <Header 
                        username={username} 
                        toggleSidebar={toggleSidebar}
                        sidebarOpen={sidebarOpen}
                    />
                </div>

                {/* Main scrollable content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    {/* Dashboard welcome section */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                            Fire Detection Dashboard
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-gray-400">
                            Welcome back, {username}. Here's what's happening in your monitoring system.
                        </p>
                    </div>
                    
                    {/* Stats overview - responsive for all screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
                        {/* Alert stat card */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-red-500/20 p-3 md:p-4 rounded-full">
                                    <FaExclamationTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                                </div>
                                <div className="ml-4 md:ml-6">
                                    <h3 className="text-xs md:text-sm font-medium text-gray-400">Active Alerts</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xl md:text-2xl font-bold text-white">{alertCount}</span>
                                        {alertCount > 0 && (
                                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full whitespace-nowrap">
                                                Attention needed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Camera stat card */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-blue-500/20 p-3 md:p-4 rounded-full">
                                    <FaVideo className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                                </div>
                                <div className="ml-4 md:ml-6">
                                    <h3 className="text-xs md:text-sm font-medium text-gray-400">Active Cameras</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xl md:text-2xl font-bold text-white">{cameraCount}</span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full whitespace-nowrap">
                                            All online
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Detection stat card */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-orange-500/20 p-3 md:p-4 rounded-full">
                                    <FaFire className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                </div>
                                <div className="ml-4 md:ml-6">
                                    <h3 className="text-xs md:text-sm font-medium text-gray-400">Total Detections</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xl md:text-2xl font-bold text-white">{detectionCount}</span>
                                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
                                            +12 today
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* System status card */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                            <div className="flex items-center">
                                <div className="bg-green-500/20 p-3 md:p-4 rounded-full">
                                    <FaChartLine className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                                </div>
                                <div className="ml-4 md:ml-6">
                                    <h3 className="text-xs md:text-sm font-medium text-gray-400">System Status</h3>
                                    <div className="flex items-center">
                                        <span className="text-xl md:text-2xl font-bold text-white">Optimal</span>
                                        <div className="ml-2 h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Camera feeds - responsive grid */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-5 gap-3 sm:gap-0">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Camera Feeds</h2>
                            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                                View All Cameras
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map((camera) => (
                                <div key={camera} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative aspect-video bg-gray-900">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {camera === 2 ? (
                                                <div className="text-center">
                                                    <FaExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                                                    <span className="text-sm sm:text-base md:text-lg text-red-400 font-semibold">Fire Detected!</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm sm:text-base md:text-lg text-gray-500">Camera Feed {camera}</span>
                                            )}
                                        </div>
                                        
                                        {camera === 2 && (
                                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500 text-white text-xs sm:text-sm font-medium rounded-md animate-pulse">
                                                LIVE ALERT
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex space-x-1 sm:space-x-2 items-center">
                                            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500"></div>
                                            <span className="text-xs sm:text-sm text-gray-400">Recording</span>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm sm:text-base font-medium">Camera #{camera}</span>
                                            <span className="text-xs sm:text-sm text-gray-400">Floor {camera}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Activity and Performance - responsive layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Recent alerts panel */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-5 md:p-6 shadow-lg">
                            <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-5 text-white">Recent Alerts</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-start">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                        <FaExclamationTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="ml-3 sm:ml-4">
                                        <p className="text-sm sm:text-base font-medium">Fire detected in Camera #2</p>
                                        <p className="text-xs sm:text-sm text-gray-400">10 minutes ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                        <FaBell className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="ml-3 sm:ml-4">
                                        <p className="text-sm sm:text-base font-medium">Smoke detected in Camera #5</p>
                                        <p className="text-xs sm:text-sm text-gray-400">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                        <FaClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div className="ml-3 sm:ml-4">
                                        <p className="text-sm sm:text-base font-medium">System health check completed</p>
                                        <p className="text-xs sm:text-sm text-gray-400">Yesterday at 11:30 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* System performance panel */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-5 md:p-6 shadow-lg">
                            <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-5 text-white">System Performance</h3>
                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">CPU Usage</span>
                                        <span className="text-sm sm:text-base text-gray-400">42%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        <div className="bg-blue-500 h-2 sm:h-2.5 rounded-full" style={{ width: '42%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">Memory Usage</span>
                                        <span className="text-sm sm:text-base text-gray-400">67%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        <div className="bg-green-500 h-2 sm:h-2.5 rounded-full" style={{ width: '67%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">Disk Space</span>
                                        <span className="text-sm sm:text-base text-gray-400">24%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        <div className="bg-purple-500 h-2 sm:h-2.5 rounded-full" style={{ width: '24%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardUI;