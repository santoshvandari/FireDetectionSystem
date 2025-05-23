import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUsers, FaExclamationTriangle,
    FaBell, FaClipboardCheck, FaChartLine,
    FaFire, FaBars, FaTimes,
    FaSync
} from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';
import AlertAPI from '../api/alerts';
import SystemInfoAPI from '../api/systeminfo';

const DashboardUI = () => {
    const [username, setUsername] = useState('Santosh');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Stats with loading states
    const [stats, setStats] = useState({
        alerts: { value: null, loading: true, error: null },
        detections: { value: null, loading: true, error: null },
        systemStatus: { value: null, loading: true, error: null }
    });

    // Recent alerts with loading state
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [recentAlertsLoading, setRecentAlertsLoading] = useState(true);

    // Loading state for the entire dashboard
    const [loading, setLoading] = useState(true);



    const [systemInfo, setSystemInfo] = useState({
        cpu_usage: null,
        memory_usage: null,
        disk_usage: null,
        system_status: null,
        uptime_seconds: null,
        load_average: []
    });

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

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const response = await SystemInfoAPI.getSystemInfo();
                if (response.status === 200) {
                    setSystemInfo(response.data);
                    setStats(prev => ({
                        ...prev,
                        systemStatus: {
                            value: response.data.system_status,
                            loading: false,
                            error: null
                        }
                    }));
                } else {
                    throw new Error('Failed to fetch system info');
                }
            } catch (error) {
                console.error('Failed to fetch system info:', error);
                setStats(prev => ({
                    ...prev,
                    systemStatus: {
                        value: null,
                        loading: false,
                        error: 'Failed to load system info'
                    }
                }));
            }
        };

        fetchSystemInfo(); // Initial fetch

        const interval = setInterval(() => {
            fetchSystemInfo();
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);

        // Fetch active alerts count
        try {
            const alertResponse = await AlertAPI.getActiveAlerts();
            if (alertResponse.status === 200) {
                setStats(prev => ({
                    ...prev,
                    alerts: {
                        value: alertResponse.data.length,
                        loading: false,
                        error: null
                    }
                }));

                // Use first five alerts as recent alerts (changed from 3 to 5)
                const recent = alertResponse.data.slice(0, 5).map(alert => ({
                    id: alert.id,
                    type: 'alert',
                    title: `Fire detected in ${alert.camera_id?.name || 'Unknown Camera'}`,
                    timestamp: alert.timestamp,
                    status: alert.status
                }));
                setRecentAlerts(recent);
                setRecentAlertsLoading(false);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            setStats(prev => ({
                ...prev,
                alerts: {
                    value: null,
                    loading: false,
                    error: 'Failed to load alerts'
                }
            }));
        }

        // Fetch detection count
        try {
            const totalDetectionHistory = await AlertAPI.getAlerts();
            if (totalDetectionHistory.status === 200) {
                const recent = totalDetectionHistory.data.slice(0, 5).map(alert => ({
                    id: alert.id,
                    type: 'alert',
                    title: `Fire detected in ${alert.camera_id?.name || 'Unknown Camera'}`,
                    timestamp: alert.timestamp,
                    status: alert.status
                }));

                const totalLength = totalDetectionHistory.data.length;
                const todayDetection = totalDetectionHistory.data.filter(alert => {
                    const alertDate = new Date(alert.timestamp);
                    const today = new Date();
                    return alertDate.getDate() === today.getDate() &&
                        alertDate.getMonth() === today.getMonth() &&
                        alertDate.getFullYear() === today.getFullYear();
                }).length;

                setStats(prev => ({
                    ...prev,
                    detections: {
                        value: totalLength ?? 0,
                        today: todayDetection ?? 0,
                        loading: false,
                        error: null
                    }
                }));
                setRecentAlerts(recent);
                setRecentAlertsLoading(false);
            } else {
                throw new Error('Failed to fetch detection count');
            }
        } catch (error) {
            setStats(prev => ({
                ...prev,
                detections: {
                    value: null,
                    loading: false,
                    error: 'Failed to load detection count'
                }
            }));
            console.error('Failed to fetch detection count:', error);
        }

        // System status - this would be a separate API call in a real app
        try {
            // Simulating API call for demo
            // const systemResponse = await API.getSystemStatus();
            setTimeout(() => {
                setStats(prev => ({
                    ...prev,
                    systemStatus: {
                        value: 'Optimal',
                        loading: false,
                        error: null
                    }
                }));
            }, 1000);
        } catch (error) {
            setStats(prev => ({
                ...prev,
                systemStatus: {
                    value: null,
                    loading: false,
                    error: 'Failed to load system status'
                }
            }));
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh dashboard data every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Format relative time
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;

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

    // Add this function next to your getTimeAgo function
    const formatUptime = (seconds) => {
        if (!seconds && seconds !== 0) return 'Unknown';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0 || days > 0) result += `${hours}h `;
        result += `${minutes}m`;

        return result;
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
                className={`fixed lg:static inset-y-0 left-0 z-30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                                Fire Detection Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-gray-400">
                                Welcome back, {username}. Here's what's happening in your monitoring system.
                            </p>
                        </div>

                        <button
                            onClick={fetchDashboardData}
                            className="mt-3 sm:mt-0 self-start sm:self-auto flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats overview - only showing available stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
                        {/* Alert stat card - only shown if data is available */}
                        {stats.alerts.loading ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg flex items-center justify-center">
                                <FaSync className="animate-spin text-blue-500 mr-2" />
                                <span className="text-gray-400">Loading alerts...</span>
                            </div>
                        ) : stats.alerts.error ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg opacity-75">
                                <div className="flex items-center">
                                    <div className="bg-red-500/20 p-3 md:p-4 rounded-full">
                                        <FaExclamationTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">Active Alerts</h3>
                                        <span className="text-sm text-red-400">Data unavailable</span>
                                    </div>
                                </div>
                            </div>
                        ) : stats.alerts.value !== null && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                                <div className="flex items-center">
                                    <div className="bg-red-500/20 p-3 md:p-4 rounded-full">
                                        <FaExclamationTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">Active Alerts</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xl md:text-2xl font-bold text-white">{stats.alerts.value}</span>
                                            {stats.alerts.value > 0 && (
                                                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full whitespace-nowrap">
                                                    Attention needed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detection stat card - only shown if data is available */}
                        {stats.detections.loading ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg flex items-center justify-center">
                                <FaSync className="animate-spin text-blue-500 mr-2" />
                                <span className="text-gray-400">Loading detections...</span>
                            </div>
                        ) : stats.detections.error ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg opacity-75">
                                <div className="flex items-center">
                                    <div className="bg-orange-500/20 p-3 md:p-4 rounded-full">
                                        <FaFire className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">Total Detections</h3>
                                        <span className="text-sm text-red-400">Data unavailable</span>
                                    </div>
                                </div>
                            </div>
                        ) : stats.detections.value !== null && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                                <div className="flex items-center">
                                    <div className="bg-orange-500/20 p-3 md:p-4 rounded-full">
                                        <FaFire className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">Total Detections</h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xl md:text-2xl font-bold text-white">{stats.detections.value}</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
                                                {stats.detections.today} today
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System status card - only shown if data is available */}
                        {stats.systemStatus.loading ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg flex items-center justify-center">
                                <FaSync className="animate-spin text-blue-500 mr-2" />
                                <span className="text-gray-400">Loading status...</span>
                            </div>
                        ) : stats.systemStatus.error ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg opacity-75">
                                <div className="flex items-center">
                                    <div className="bg-green-500/20 p-3 md:p-4 rounded-full">
                                        <FaChartLine className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">System Status</h3>
                                        <span className="text-sm text-red-400">Data unavailable</span>
                                    </div>
                                </div>
                            </div>
                        ) : stats.systemStatus.value !== null && (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 shadow-lg">
                                <div className="flex items-center">
                                    <div className="bg-green-500/20 p-3 md:p-4 rounded-full">
                                        <FaChartLine className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                                    </div>
                                    <div className="ml-4 md:ml-6">
                                        <h3 className="text-xs md:text-sm font-medium text-gray-400">System Status</h3>
                                        <div className="flex items-center">
                                            <span className="text-xl md:text-2xl font-bold text-white">
                                                <span className={`text-sm px-2 py-1 rounded-md ${systemInfo.system_status === 'Optimal' ? 'bg-green-500/20 text-green-400' :
                                                    systemInfo.system_status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {systemInfo.system_status}
                                                </span>


                                            </span>
                                            <div className="ml-2 h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Activity and Performance section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Recent alerts panel - expanded to show 5 alerts */}
                        {recentAlertsLoading ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg flex items-center justify-center">
                                <FaSync className="animate-spin text-blue-500 mr-3" />
                                <p>Loading recent alerts...</p>
                            </div>
                        ) : recentAlerts.length > 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-5 md:p-6 shadow-lg">
                                <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-5 text-white">Recent Alerts</h3>
                                <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {recentAlerts.map((alert, index) => (
                                        <div key={alert.id || index} className="flex items-start">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
                                                <FaExclamationTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </div>
                                            <div className="ml-3 sm:ml-4">
                                                <p className="text-sm sm:text-base font-medium">{alert.title}</p>
                                                <p className="text-xs sm:text-sm text-gray-400">{getTimeAgo(alert.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {recentAlerts.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => navigate('/history')}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                                        >
                                            View All Alerts
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-5 md:p-6 shadow-lg">
                                <h3 className="font-bold text-lg sm:text-xl mb-4 text-white">Recent Alerts</h3>
                                <div className="p-6 text-center">
                                    <FaBell className="mx-auto text-4xl text-gray-600 mb-3" />
                                    <p className="text-gray-400">No recent alerts</p>
                                </div>
                            </div>
                        )}

                        {/* System performance panel */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-5 md:p-6 shadow-lg">
                            <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-5 text-white flex justify-between">
                                <span>System Performance</span>
                            </h3>

                            <div className="space-y-4 sm:space-y-6">
                                {/* CPU Usage */}
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">CPU Usage</span>
                                        <span className="text-sm sm:text-base text-gray-400">
                                            {systemInfo.cpu_usage !== null ? `${systemInfo.cpu_usage.toFixed(1)}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        {systemInfo.cpu_usage !== null && (
                                            <div
                                                className={`h-2 sm:h-2.5 rounded-full ${systemInfo.cpu_usage > 90 ? 'bg-red-500' :
                                                    systemInfo.cpu_usage > 70 ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                    }`}
                                                style={{ width: `${Math.min(systemInfo.cpu_usage, 100)}%` }}
                                            ></div>
                                        )}
                                    </div>
                                </div>

                                {/* Memory Usage */}
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">Memory Usage</span>
                                        <span className="text-sm sm:text-base text-gray-400">
                                            {systemInfo.memory_usage !== null ? `${systemInfo.memory_usage.toFixed(1)}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        {systemInfo.memory_usage !== null && (
                                            <div
                                                className={`h-2 sm:h-2.5 rounded-full ${systemInfo.memory_usage > 90 ? 'bg-red-500' :
                                                    systemInfo.memory_usage > 70 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(systemInfo.memory_usage, 100)}%` }}
                                            ></div>
                                        )}
                                    </div>
                                </div>

                                {/* Disk Usage */}
                                <div>
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-400">Disk Space</span>
                                        <span className="text-sm sm:text-base text-gray-400">
                                            {systemInfo.disk_usage !== null ? `${systemInfo.disk_usage.toFixed(1)}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                                        {systemInfo.disk_usage !== null && (
                                            <div
                                                className={`h-2 sm:h-2.5 rounded-full ${systemInfo.disk_usage > 90 ? 'bg-red-500' :
                                                    systemInfo.disk_usage > 70 ? 'bg-yellow-500' :
                                                        'bg-purple-500'
                                                    }`}
                                                style={{ width: `${Math.min(systemInfo.disk_usage, 100)}%` }}
                                            ></div>
                                        )}
                                    </div>
                                </div>

                                {/* System Uptime */}
                                {systemInfo.uptime_seconds !== undefined && systemInfo.uptime_seconds !== null && (
                                    <div className="mt-4 pt-3 border-t border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">System Uptime</span>
                                            <span className="text-sm text-gray-400">
                                                {formatUptime(systemInfo.uptime_seconds)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardUI;