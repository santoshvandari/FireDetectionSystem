import React, { useEffect, useState } from 'react';
import { 
    FaExclamationTriangle, FaTrash, FaSync, 
    FaCalendarAlt, FaClock, FaCamera, FaBars, 
    FaTimes, FaFire, FaBell, FaSearch, FaCheck,
    FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import AlertAPI from '../api/alerts';

const Alerts = () => {
    const [username, setUsername] = useState('Santosh');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', or 'pending'

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


            const response = await AlertAPI.getActiveAlerts();
            if (response.status !== 200) {
                throw new Error('Failed to fetch alerts');
            }

            const transformedLogs = response.data.map(alert => ({
                id: alert.id,
                timestamp: alert.timestamp,
                camera_name: alert.camera_id?.name || 'Unknown Camera',
                camera_id: alert.camera_id?.id || 0,
                location: alert.camera_id?.location || 'Unknown Location',
                confidence: alert.confidence * 100,
                status: alert.status,
                image_url: alert.detected_frame
            }));
            setAlerts(transformedLogs);
            console.log('Transformed alerts:', transformedLogs);
            
            setLoading(false);
            
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            setError('Failed to load alerts. Please try again.');
            setLoading(false);
        }
    };

    const handlePending = async (id) => {
        try {
            setLoading(true);
            const response = await AlertAPI.updateAlert(id, 'pending');
            if (response.status !== 200) {
                throw new Error('Failed to update alert status');
            }
            
            setAlerts(alerts.map(alert => 
                alert.id === id ? { ...alert, status: 'pending' } : alert
            ));
            
            setLoading(false);
        } catch (err) {
            console.error('Pending error:', err);
            setError('Failed to update alert. Please try again.');
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            setLoading(true);
            const response = await AlertAPI.updateAlert(id, 'resolved');
            if (response.status !== 200) {
                throw new Error('Failed to update alert status');
            }
            
            setAlerts(alerts.filter(alert => alert.id !== id));
            
            setLoading(false);
        } catch (err) {
            console.error('Resolve error:', err);
            setError('Failed to resolve alert. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredAlerts = alerts.filter(alert => {
        if (statusFilter !== 'all' && alert.status !== statusFilter) {
            return false;
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                alert.camera_name.toLowerCase().includes(query) ||
                `camera ${alert.camera_id}`.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    const activeCount = alerts.filter(alert => alert.status === 'active').length;
    const pendingCount = alerts.filter(alert => alert.status === 'pending').length;

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
            {sidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleSidebar}
                ></div>
            )}
            
            <div 
                className={`fixed lg:static inset-y-0 left-0 z-30 transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 ease-in-out w-72`}
            >
                <Sidebar />
            </div>
            
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
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
                
                <div className="hidden lg:block">
                    <Header 
                        username={username} 
                        toggleSidebar={toggleSidebar}
                        sidebarOpen={sidebarOpen}
                    />
                </div>
                
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                                    Fire Alerts Dashboard
                                </h1>
                                <p className="text-sm sm:text-base text-gray-400">
                                    Manage active and pending fire detection alerts
                                </p>
                            </div>
                            <div className="flex items-center mt-3 sm:mt-0">
                                {activeCount > 0 && (
                                    <div className="mr-3 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full animate-pulse">
                                        {activeCount} Active
                                    </div>
                                )}
                                {pendingCount > 0 && (
                                    <div className="mr-3 px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                                        {pendingCount} Pending
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

                        {alerts.length > 0 && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6 shadow-lg">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
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
                                    
                                    <div className="relative">
                                        <div className="flex items-center">
                                            <FaFilter className="text-gray-500 mr-2" />
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                                            >
                                                <option value="all">All Alerts</option>
                                                <option value="active">Active Only</option>
                                                <option value="pending">Pending Only</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center mb-6">
                                <FaExclamationTriangle className="mr-2" />
                                {error}
                            </div>
                        )}

                        {loading && alerts.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 flex items-center justify-center">
                                <FaSync className="animate-spin text-2xl text-blue-500 mr-3" />
                                <p>Loading alerts...</p>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
                                <FaBell className="mx-auto text-4xl text-gray-600 mb-3" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Alerts Found</h3>
                                <p className="text-gray-400">
                                    {searchQuery 
                                        ? 'No alerts match your search criteria' 
                                        : statusFilter !== 'all' 
                                            ? `No ${statusFilter} alerts at this time` 
                                            : 'No active or pending fire alerts detected'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAlerts.map((alert) => (
                                    <div 
                                        key={alert.id} 
                                        className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow
                                            ${alert.status === 'active' 
                                                ? 'border border-red-500/50' 
                                                : 'border border-yellow-500/50'}`}
                                    >
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
                                            
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium text-white
                                                ${alert.status === 'active' 
                                                    ? 'bg-red-600 animate-pulse' 
                                                    : 'bg-yellow-600'}`}>
                                                {alert.status === 'active' ? 'ACTIVE ALERT' : 'PENDING REVIEW'}
                                            </div>
                                            
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                                                Confidence: {alert.confidence.toFixed(1)}%
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
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
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleResolve(alert.id)}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                    disabled={loading}
                                                >
                                                    <FaCheck className="mr-2" />
                                                    Resolve
                                                </button>
                                                
                                                {alert.status === 'active' ? (
                                                    <button
                                                        onClick={() => handlePending(alert.id)}
                                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <FaExclamationTriangle className="mr-2" />
                                                        Pending
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePending(alert.id)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                        disabled={loading}
                                                    >
                                                        <FaSync className="mr-2" />
                                                        Re-check
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alerts;
