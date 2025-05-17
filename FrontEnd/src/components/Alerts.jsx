import React, { useEffect, useState } from 'react';
import { 
    FaExclamationTriangle, FaTrash, FaSync, 
    FaCalendarAlt, FaClock, FaCamera, FaBars, 
    FaTimes, FaFire, FaBell, FaSearch, FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

// Sample alert data - showing only active alerts
const SAMPLE_ALERTS = [
    { 
        id: 1, 
        camera_name: 'Server Room', 
        camera_id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED',
        confidence: 89.7,
        status: 'active'
    },
    { 
        id: 2, 
        camera_name: 'Warehouse East', 
        camera_id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        image_url: 'https://via.placeholder.com/800x600/FF6644/FFFFFF?text=FIRE+DETECTED',
        confidence: 95.2,
        status: 'active'
    }   , { 
        id: 3, 
        camera_name: 'Warehouse East', 
        camera_id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        image_url: 'https://via.placeholder.com/800x600/FF6644/FFFFFF?text=FIRE+DETECTED',
        confidence: 95.2,
        status: 'active'
    }
];

const Alerts = () => {
    const [username, setUsername] = useState('Santosh');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [alertToDelete, setAlertToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
        
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

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Simulate API call with sample data - filtering to show only active alerts
            setTimeout(() => {
                // Only active alerts
                setAlerts(SAMPLE_ALERTS.filter(alert => alert.status === 'active'));
                setLoading(false);
            }, 800);
            
            // Real API call would look like this:
            // const res = await fetch('/api/alerts/active', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
            //     },
            // });
            // 
            // if (!res.ok) {
            //     throw new Error('Failed to fetch alerts');
            // }
            // 
            // const data = await res.json();
            // setAlerts(data);
            // setLoading(false);
            
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            setError('Failed to load active alerts. Please try again.');
            setLoading(false);
        }
    };

    const confirmDelete = (alert) => {
        setAlertToDelete(alert);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!alertToDelete) return;
        
        try {
            setLoading(true);
            
            // Simulate API call
            setTimeout(() => {
                setAlerts(alerts.filter(alert => alert.id !== alertToDelete.id));
                setShowDeleteModal(false);
                setAlertToDelete(null);
                setLoading(false);
            }, 600);
            
            // Real API call would look like this:
            // const res = await fetch(`/api/alerts/${alertToDelete.id}/`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
            //     },
            // });
            // 
            // if (!res.ok) {
            //     throw new Error('Failed to delete alert');
            // }
            // 
            // setAlerts(alerts.filter(alert => alert.id !== alertToDelete.id));
            // setShowDeleteModal(false);
            // setAlertToDelete(null);
            
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete alert. Please try again.');
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            setLoading(true);
            
            // Simulate API call - remove from list when resolved
            setTimeout(() => {
                // Remove the resolved alert from the list since we only show active alerts
                setAlerts(alerts.filter(alert => alert.id !== id));
                setLoading(false);
            }, 600);
            
            // Real API call would look like this:
            // const res = await fetch(`/api/alerts/${id}/resolve/`, {
            //     method: 'PUT',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
            //     },
            // });
            // 
            // if (!res.ok) {
            //     throw new Error('Failed to resolve alert');
            // }
            // 
            // // Remove the resolved alert from the list
            // setAlerts(alerts.filter(alert => alert.id !== id));
            
        } catch (err) {
            console.error('Resolve error:', err);
            setError('Failed to resolve alert. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        
        // Auto-refresh active alerts every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter alerts based on search query
    const filteredAlerts = alerts.filter(alert => {
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                alert.camera_name.toLowerCase().includes(query) ||
                `camera ${alert.camera_id}`.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    };

    // Calculate time difference from now
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const alertDate = new Date(dateString);
        const diffMs = now - alertDate;
        
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
        if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }
        if (diffMins > 0) {
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        }
        return 'Just now';
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
                
                {/* Alerts content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Active Fire Alerts</h1>
                                <p className="text-sm sm:text-base text-gray-400">
                                    Immediate attention required for these active fire detections
                                </p>
                            </div>
                            <div className="flex items-center mt-3 sm:mt-0">
                                {alerts.length > 0 && (
                                    <div className="mr-3 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full animate-pulse">
                                        {alerts.length} Active {alerts.length === 1 ? 'Alert' : 'Alerts'}
                                    </div>
                                )}
                                <button 
                                    onClick={fetchAlerts} 
                                    className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Search bar */}
                        {alerts.length > 0 && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6 shadow-lg">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search alerts by camera..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center mb-6">
                                <FaExclamationTriangle className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && alerts.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 flex items-center justify-center">
                                <FaSync className="animate-spin text-2xl text-blue-500 mr-3" />
                                <p>Loading active alerts...</p>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
                                <FaBell className="mx-auto text-4xl text-gray-600 mb-3" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
                                <p className="text-gray-400">
                                    {searchQuery 
                                        ? 'No alerts match your search criteria' 
                                        : 'No active fire alerts detected at this time'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAlerts.map((alert) => (
                                    <div 
                                        key={alert.id} 
                                        className="bg-gray-800 rounded-lg border border-red-500/50 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        {/* Alert image */}
                                        <div className="relative aspect-video bg-gray-900">
                                            {alert.image_url ? (
                                                <img
                                                    src={alert.image_url}
                                                    alt={`Fire alert from ${alert.camera_name}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <FaExclamationTriangle className="text-red-500 text-4xl" />
                                                </div>
                                            )}
                                            
                                            {/* Alert status badge */}
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-red-600 text-white animate-pulse">
                                                ACTIVE ALERT
                                            </div>
                                            
                                            {/* Confidence score */}
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                                                Confidence: {alert.confidence.toFixed(1)}%
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            {/* Camera name and timestamp */}
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-lg text-white">{alert.camera_name}</h3>
                                                <div className="flex items-center text-gray-400 text-sm mt-1">
                                                    <div className="flex items-center mr-3">
                                                        <FaCamera className="mr-1" />
                                                        <span>Camera #{alert.camera_id}</span>
                                                    </div>
                                                    <span>{getTimeAgo(alert.timestamp)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Date and time */}
                                            <div className="flex text-sm text-gray-400 mb-4">
                                                <div className="flex items-center mr-3">
                                                    <FaCalendarAlt className="mr-1" />
                                                    <span>{formatDate(alert.timestamp)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FaClock className="mr-1" />
                                                    <span>{formatTime(alert.timestamp)}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Action buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleResolve(alert.id)}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                >
                                                    <FaCheck className="mr-2" />
                                                    Resolve
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(alert)}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                >
                                                    <FaTrash className="mr-2" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaTrash className="text-red-500 mr-2" />
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this active fire alert from <span className="text-white font-medium">{alertToDelete?.camera_name}</span>? 
                            <span className="block mt-2 text-red-400 font-medium">
                                Warning: This will remove the alert without resolving it.
                            </span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button 
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <FaSync className="animate-spin mr-2" />
                                ) : (
                                    <FaTrash className="mr-2" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alerts;
