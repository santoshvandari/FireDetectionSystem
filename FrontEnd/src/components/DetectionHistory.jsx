import React, { useEffect, useState } from 'react';
import { 
    FaHistory, FaSync, FaBars, FaTimes, 
    FaFire, FaSearch, FaArrowLeft, FaArrowRight,
    FaCalendarAlt, FaClock, FaCamera, FaDownload, 
    FaFilter, FaEye, FaListUl, FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import AlertAPI from '../api/alerts';

const DetectionHistory = () => {
    const [username] = useState('Santosh');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // State management
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCamera, setSelectedCamera] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [pageSize, setPageSize] = useState(5);
    const [camerasInLogs, setCamerasInLogs] = useState([]);
    const [allLogs, setAllLogs] = useState([]); // Store all logs for filtering

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

    // Authentication and responsive sidebar setup
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        
        const checkScreenSize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [navigate]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await AlertAPI.getAlerts();
                
                if (response.status !== 200) {
                    throw new Error('Failed to fetch logs');
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
                
                setAllLogs(transformedLogs);
                
                // Extract unique camera names
                const uniqueCameras = [...new Set(
                    transformedLogs
                        .filter(log => log.camera_name !== 'Unknown Camera')
                        .map(log => log.camera_name)
                )];
                setCamerasInLogs(uniqueCameras);
                
            } catch (error) {
                console.error('Error loading logs:', error);
                setError('Failed to load detection history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filters and pagination
    useEffect(() => {
        let filteredLogs = [...allLogs];
        
        // Apply filters
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.camera_name.toLowerCase().includes(query) ||
                log.location.toLowerCase().includes(query)
            );
        }
        
        if (selectedCamera !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.camera_name === selectedCamera);
        }
        
        if (selectedStatus !== 'all') {
            filteredLogs = filteredLogs.filter(log => 
                log.status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }
        
        // Apply pagination
        const totalFilteredPages = Math.ceil(filteredLogs.length / pageSize);
        const start = (page - 1) * pageSize;
        const paginatedLogs = filteredLogs.slice(start, start + pageSize);
        
        setLogs(paginatedLogs);
        setTotalPages(totalFilteredPages || 1);
    }, [allLogs, page, searchQuery, selectedCamera, selectedStatus, pageSize]);

    // Event handlers
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(parseInt(newSize, 10));
        setPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'search':
                setSearchQuery(value);
                break;
            case 'camera':
                setSelectedCamera(value);
                break;
            case 'status':
                setSelectedStatus(value);
                break;
        }
        setPage(1);
    };

    const openPreviewModal = (imageUrl) => {
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
        setPreviewImage(fullImageUrl);
        setShowPreviewModal(true);
    };

    const handleDownload = async (imageUrl) => {
        if (!imageUrl) return;
        
        try {
            // Ensure we have the full URL
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
            
            // Fetch the image
            const response = await fetch(fullImageUrl, {
                mode: 'cors',
                headers: {
                    'Accept': 'image/*'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get the image as blob
            const blob = await response.blob();
            
            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Extract filename from the URL or create a default one
            const filename = imageUrl.split('/').pop() || `fire-detection-${Date.now()}.jpg`;
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the temporary URL
            window.URL.revokeObjectURL(url);
            
            console.log('Image downloaded successfully');
            
        } catch (error) {
            console.error('Download failed:', error);
            
            // Fallback: try to open image in new tab if direct download fails
            try {
                const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
                const newWindow = window.open(fullImageUrl, '_blank');
                
                if (newWindow) {
                    // Add a small delay then try to trigger download via the new window
                    setTimeout(() => {
                        try {
                            const link = newWindow.document.createElement('a');
                            link.href = fullImageUrl;
                            link.download = imageUrl.split('/').pop() || `fire-detection-${Date.now()}.jpg`;
                            newWindow.document.body.appendChild(link);
                            link.click();
                            newWindow.document.body.removeChild(link);
                            newWindow.close();
                        } catch (fallbackError) {
                            console.log('Fallback download failed, image opened in new tab');
                        }
                    }, 1000);
                } else {
                    setError('Unable to download image. Please check your popup blocker settings.');
                }
            } catch (fallbackError) {
                setError('Failed to download image. Please try right-clicking the image and selecting "Save image as..."');
            }
        }
    };

    const exportLogsAsCSV = async () => {
        try {
            setLoading(true);
            
            const csvData = allLogs.map(log => ({
                ID: log.id,
                Date: new Date(log.timestamp).toLocaleDateString(),
                Time: new Date(log.timestamp).toLocaleTimeString(),
                Camera: log.camera_name,
                Location: log.location,
                'Confidence (%)': log.confidence.toFixed(1),
                Status: log.status
            }));
            
            const headers = Object.keys(csvData[0]).join(',');
            const csvRows = csvData.map(row => 
                Object.values(row).map(value => 
                    typeof value === 'string' && value.includes(',') ? `"${value}"` : value
                ).join(',')
            );
            
            const csvContent = [headers, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fire-detections-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting logs:', error);
            setError('Failed to export detection history');
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await AlertAPI.getAlerts();
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
            setAllLogs(transformedLogs);
        } catch (error) {
            setError('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    // Utility functions
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(dateString));
    };

    const formatTime = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(new Date(dateString));
    };

    const getTimeAgo = (dateString) => {
        const diffMs = Date.now() - new Date(dateString);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const getStatusStyles = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            resolved: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800'
        };
        return styles[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    // Calculate total filtered results
    const getTotalFilteredResults = () => {
        let filtered = allLogs;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(log => 
                log.camera_name.toLowerCase().includes(query) ||
                log.location.toLowerCase().includes(query)
            );
        }
        
        if (selectedCamera !== 'all') {
            filtered = filtered.filter(log => log.camera_name === selectedCamera);
        }
        
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(log => 
                log.status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }
        
        return filtered.length;
    };

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleSidebar}
                />
            )}
            
            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-30 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 transition-transform duration-300 ease-in-out w-72`}>
                <Sidebar />
            </div>
            
            {/* Main content */}
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
                {/* Mobile header */}
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
                
                {/* Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                                    <FaHistory className="inline-block mr-2 text-blue-500" />
                                    Detection History
                                </h1>
                                <p className="text-sm sm:text-base text-gray-400">
                                    Complete history of fire detections from all cameras
                                </p>
                            </div>
                            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                                <button 
                                    onClick={refreshData} 
                                    className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button 
                                    onClick={exportLogsAsCSV} 
                                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <FaDownload className="mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6 shadow-lg">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by camera name or location..."
                                            value={searchQuery}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Camera filter */}
                                    <div className="relative">
                                        <div className="flex items-center">
                                            <FaFilter className="text-gray-500 mr-2" />
                                            <select
                                                value={selectedCamera}
                                                onChange={(e) => handleFilterChange('camera', e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Cameras</option>
                                                {camerasInLogs.map(camera => (
                                                    <option key={camera} value={camera}>{camera}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status filter */}
                                    <div className="relative">
                                        <div className="flex items-center">
                                            <FaCheckCircle className="text-gray-500 mr-2" />
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="pending">Pending</option>
                                                <option value="error">Error</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Page size selector */}
                                    <div className="relative">
                                        <div className="flex items-center">
                                            <FaListUl className="text-gray-500 mr-2" />
                                            <select
                                                value={pageSize}
                                                onChange={(e) => handlePageSizeChange(e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="5">5 per page</option>
                                                <option value="10">10 per page</option>
                                                <option value="50">50 per page</option>
                                                <option value="100">100 per page</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error state */}
                        {error && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center mb-6">
                                <FaTimes className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Content */}
                        {loading ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 flex items-center justify-center">
                                <FaSync className="animate-spin text-2xl text-blue-500 mr-3" />
                                <p>Loading detection history...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
                                <FaHistory className="mx-auto text-4xl text-gray-600 mb-3" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Detection History Found</h3>
                                <p className="text-gray-400">
                                    {searchQuery || selectedCamera !== 'all' || selectedStatus !== 'all'
                                        ? 'No detection logs match your search criteria'
                                        : 'No fire detections have been recorded yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table view (desktop) */}
                                <div className="hidden md:block overflow-hidden">
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                                        <table className="w-full">
                                            <thead className="bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Camera</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Confidence</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Preview</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-750 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-medium text-white">{formatDate(log.timestamp)}</div>
                                                            <div className="text-sm text-gray-400 flex items-center">
                                                                <FaClock className="mr-1 text-xs" />
                                                                {formatTime(log.timestamp)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">{getTimeAgo(log.timestamp)}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-medium text-white">{log.camera_name}</div>
                                                            <div className="text-xs text-gray-400 flex items-center">
                                                                <FaCamera className="mr-1 text-xs" />
                                                                Camera #{log.camera_id}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm text-white">{log.location}</div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {log.confidence.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            {log.image_url ? (
                                                                <div className="relative">
                                                                    <img
                                                                        src={`${API_BASE_URL}${log.image_url}`}
                                                                        alt="Detection"
                                                                        className="h-12 w-20 object-cover rounded-md cursor-pointer"
                                                                        onClick={() => openPreviewModal(log.image_url)}
                                                                    />
                                                                    <div className="absolute -top-1 -right-1 p-1 bg-blue-600 rounded-full text-white text-xs cursor-pointer hover:bg-blue-700"
                                                                        onClick={() => openPreviewModal(log.image_url)}>
                                                                        <FaEye size={10} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-red-500 text-sm">No Image</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(log.status)}`}>
                                                                {log.status}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => handleDownload(log.image_url)}
                                                                disabled={!log.image_url}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                                    log.image_url 
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                <FaDownload className="inline mr-1" />
                                                                Download
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Card view (mobile) */}
                                <div className="md:hidden space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-medium text-lg text-white">{log.camera_name}</h3>
                                                        <p className="text-sm text-gray-400">{log.location}</p>
                                                    </div>
                                                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                                        {log.confidence.toFixed(1)}%
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-400 mb-3">
                                                    <FaCalendarAlt className="mr-1" />
                                                    <span>{formatDate(log.timestamp)}</span>
                                                    <span className="mx-2">•</span>
                                                    <FaClock className="mr-1" />
                                                    <span>{formatTime(log.timestamp)}</span>
                                                </div>
                                                
                                                <p className="text-xs text-gray-500 mb-3">{getTimeAgo(log.timestamp)}</p>
                                                
                                                {log.image_url && (
                                                    <div className="relative mb-3">
                                                        <img
                                                            src={`${API_BASE_URL}${log.image_url}`}
                                                            alt="Detection"
                                                            className="w-full h-32 object-cover rounded-md cursor-pointer"
                                                            onClick={() => openPreviewModal(log.image_url)}
                                                        />
                                                        <div className="absolute top-2 right-2 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700"
                                                            onClick={() => openPreviewModal(log.image_url)}>
                                                            <FaEye size={14} />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between items-center">
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(log.status)}`}>
                                                        {log.status}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownload(log.image_url)}
                                                        disabled={!log.image_url}
                                                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                            log.image_url 
                                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <FaDownload className="inline mr-1" />
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-800 rounded-xl border border-gray-700 px-4 py-3 gap-3">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <span>
                                            Showing <span className="font-medium text-white">{logs.length}</span> of{' '}
                                            <span className="font-medium text-white">{getTotalFilteredResults()}</span> results 
                                            on page {page} of {totalPages}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                page === 1
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            <FaArrowLeft className="mr-2" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                page === totalPages
                                                    ? 'bg-gray-700 tex+ -500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            Next
                                            <FaArrowRight className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                    <div className="max-w-4xl w-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-white">Detection Image</h3>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="p-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                        <div className="p-4">
                            <img
                                src={previewImage}
                                alt="Fire Detection"
                                className="w-full max-h-[70vh] object-contain rounded"
                            />
                        </div>
                        <div className="flex justify-end p-4 border-t border-gray-700">
                            <button
                                onClick={() => handleDownload(previewImage)}
                                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Download Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetectionHistory;
