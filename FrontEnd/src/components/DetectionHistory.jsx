import React, { useEffect, useState } from 'react';
import { 
    FaHistory, FaSync, FaBars, FaTimes, 
    FaFire, FaSearch, FaArrowLeft, FaArrowRight,
    FaCalendarAlt, FaClock, FaCamera, FaDownload, 
    FaFilter, FaEye, FaListUl
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

// Sample detection logs data
const SAMPLE_LOGS = [
    {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 89.7,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        camera_name: 'Warehouse East',
        camera_id: 4,
        location: 'Storage Facility',
        confidence: 95.2,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF6644/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        camera_name: 'Main Entrance',
        camera_id: 1,
        location: 'Reception Area',
        confidence: 78.4,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF5544/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        camera_name: 'Production Floor',
        camera_id: 5,
        location: 'Manufacturing Zone B',
        confidence: 92.1,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF3344/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 6,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 7,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 8,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 9,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 10,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 11,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 12,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 13,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 14,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 15,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        camera_name: 'Server Room',
        camera_id: 2,
        location: 'Building A, Floor 2',
        confidence: 88.3,
        status: 'resolved',
        image_url: 'https://via.placeholder.com/800x600/FF4444/FFFFFF?text=FIRE+DETECTED'
    }
];

const DetectionHistory = () => {
    const [username, setUsername] = useState('Santosh');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCamera, setSelectedCamera] = useState('all');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [pageSize, setPageSize] = useState(5); // Default page size

    const camerasInLogs = [...new Set(SAMPLE_LOGS.map(log => log.camera_name))];

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

    // Updated loadLogs function to use dynamic pageSize
    const loadLogs = async (pageNumber) => {
        setLoading(true);
        setError(null);
        
        try {
            // Simulate API call with sample data and pagination
            setTimeout(() => {
                // In a real app, this would be the API call with page size parameter
                // const data = await fetchFireLogs(pageNumber, pageSize);
                
                // Filter logs by search query and camera selection
                let filteredLogs = [...SAMPLE_LOGS];
                
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filteredLogs = filteredLogs.filter(log => 
                        log.camera_name.toLowerCase().includes(query) ||
                        log.location.toLowerCase().includes(query)
                    );
                }
                
                if (selectedCamera !== 'all') {
                    filteredLogs = filteredLogs.filter(log => 
                        log.camera_name === selectedCamera
                    );
                }
                
                // Updated pagination logic using dynamic pageSize
                const totalFilteredPages = Math.ceil(filteredLogs.length / pageSize);
                const start = (pageNumber - 1) * pageSize;
                const end = start + pageSize;
                const paginatedLogs = filteredLogs.slice(start, end);
                
                setLogs(paginatedLogs);
                setTotalPages(totalFilteredPages || 1);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('Error loading logs:', error);
            setError('Failed to load detection history. Please try again.');
            setLoading(false);
        }
    };

    // Effect to load logs when page, search query, selected camera, or pageSize changes
    useEffect(() => {
        loadLogs(page);
    }, [page, searchQuery, selectedCamera, pageSize]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(parseInt(newSize, 10));
        setPage(1); // Reset to first page when changing page size
    };

    const openPreviewModal = (imageUrl) => {
        setPreviewImage(imageUrl);
        setShowPreviewModal(true);
    };

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
        const logDate = new Date(dateString);
        const diffMs = now - logDate;
        
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
                
                {/* Detection History content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
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
                                    onClick={() => loadLogs(page)} 
                                    className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                    <FaDownload className="mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Updated Filters and search to include page size selector */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6 shadow-lg">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by camera name or location..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setPage(1); // Reset to first page on search
                                            }}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Camera filter dropdown */}
                                    <div className="relative inline-block">
                                        <div className="flex items-center">
                                            <FaFilter className="text-gray-500 mr-2" />
                                            <select
                                                value={selectedCamera}
                                                onChange={(e) => {
                                                    setSelectedCamera(e.target.value);
                                                    setPage(1); // Reset to first page on filter change
                                                }}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                                            >
                                                <option value="all">All Cameras</option>
                                                {camerasInLogs.map(camera => (
                                                    <option key={camera} value={camera}>{camera}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* New Page Size selector */}
                                    <div className="relative inline-block">
                                        <div className="flex items-center">
                                            <FaListUl className="text-gray-500 mr-2" />
                                            <select
                                                value={pageSize}
                                                onChange={(e) => handlePageSizeChange(e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                                            >
                                                <option value="5">5 per page</option>
                                                <option value="10">10 per page</option>
                                                <option value="50">50 per page</option>
                                                <option value="100">100 per page</option>
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
                        </div>

                        {/* Error state */}
                        {error && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg flex items-center mb-6">
                                <FaTimes className="mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Main content - Detection history table or cards depending on viewport */}
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
                                    {searchQuery || selectedCamera !== 'all'
                                        ? 'No detection logs match your search criteria'
                                        : 'No fire detections have been recorded yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table view (hidden on small screens) */}
                                <div className="hidden md:block overflow-hidden">
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                                        <table className="w-full">
                                            <thead className="bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Camera
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Location
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Confidence
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Preview
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-750 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {formatDate(log.timestamp)}
                                                            </div>
                                                            <div className="text-sm text-gray-400 flex items-center">
                                                                <FaClock className="mr-1 text-xs" />
                                                                {formatTime(log.timestamp)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {getTimeAgo(log.timestamp)}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-medium text-white">
                                                                {log.camera_name}
                                                            </div>
                                                            <div className="text-xs text-gray-400 flex items-center">
                                                                <FaCamera className="mr-1 text-xs" />
                                                                Camera #{log.camera_id}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm text-white">
                                                                {log.location || 'Unknown'}
                                                            </div>
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
                                                                        src={log.image_url}
                                                                        alt="Detection"
                                                                        className="h-12 w-20 object-cover rounded-md cursor-pointer"
                                                                        onClick={() => openPreviewModal(log.image_url)}
                                                                    />
                                                                    <div className="absolute -top-1 -right-1 p-1 bg-blue-600 rounded-full 
                                                                        text-white text-xs cursor-pointer hover:bg-blue-700"
                                                                        onClick={() => openPreviewModal(log.image_url)}
                                                                    >
                                                                        <FaEye size={10} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-red-500 text-sm">No Image</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <button
                                                                onClick={() => window.open(log.image_url, '_blank')}
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

                                {/* Card view (visible only on small screens) */}
                                <div className="md:hidden space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-medium text-lg text-white">{log.camera_name}</h3>
                                                        <p className="text-sm text-gray-400">{log.location || 'Unknown'}</p>
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
                                                            src={log.image_url}
                                                            alt="Detection"
                                                            className="w-full h-32 object-cover rounded-md"
                                                            onClick={() => openPreviewModal(log.image_url)}
                                                        />
                                                        <div className="absolute top-2 right-2 p-2 bg-blue-600 rounded-full 
                                                            text-white cursor-pointer hover:bg-blue-700"
                                                            onClick={() => openPreviewModal(log.image_url)}
                                                        >
                                                            <FaEye size={14} />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <button
                                                    onClick={() => window.open(log.image_url, '_blank')}
                                                    disabled={!log.image_url}
                                                    className={`w-full py-2 rounded-md font-medium ${
                                                        log.image_url 
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FaDownload className="inline mr-2" />
                                                    Download Image
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Updated Pagination with page size information */}
                                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-800 rounded-xl border border-gray-700 px-4 py-3 gap-3">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <span>
                                            Showing <span className="font-medium text-white">{logs.length}</span> of{' '}
                                            <span className="font-medium text-white">
                                                {SAMPLE_LOGS.filter(log => 
                                                    (selectedCamera === 'all' || log.camera_name === selectedCamera) &&
                                                    (!searchQuery || log.camera_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                     log.location.toLowerCase().includes(searchQuery.toLowerCase()))
                                                ).length}
                                            </span> results on page {page} of {totalPages}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className={`flex items-center px-4 py-2 rounded-lg ${
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
                                            className={`flex items-center px-4 py-2 rounded-lg ${
                                                page === totalPages
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
                                onClick={() => window.open(previewImage, '_blank')}
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
