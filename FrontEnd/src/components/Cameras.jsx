// src/pages/Cameras.jsx
import React, { useEffect, useState } from 'react';
import { 
    FaVideo, FaEdit, FaTrash, FaPlus, FaExclamationCircle, 
    FaSync, FaBars, FaTimes, FaFire, FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CameraAPI from '../api/camera';

// Sample camera data to display
// const SAMPLE_CAMERAS = [
//     { id: 1, name: 'Main Entrance', stream_url: 'rtsp://192.168.1.101:554/stream1', status: 'offline' },
//     { id: 2, name: 'Server Room', stream_url: 'rtsp://192.168.1.102:554/stream1', status: 'online' },
//     { id: 3, name: 'Storage Area', stream_url: 'http://invalid.url.com/stream', status: 'error' },
//     { id: 4, name: 'Parking Lot', stream_url: 'rtsp://10.0.0.15:554/main', status: 'offline' },
//     { id: 5, name: 'Production Floor', stream_url: 'http://10.0.0.20:8080/video', status: 'online' }
// ];

export default function Cameras() {
    const [username, setUsername] = useState('Admin');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const [cameras, setCameras] = useState([]);
    const [newCamera, setNewCamera] = useState({ name: '', camera_ip: '',location:'' });
    const [editingCamera, setEditingCamera] = useState(null);
    const [error, setError] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [cameraToDelete, setCameraToDelete] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', camera_ip: '', location: '' });

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
    const loadCameras = async () => {
        try {
            setIsLoading(true);
            const response = await CameraAPI.getCameras();
            if (response.status !== 200) {
                throw new Error('Failed to fetch cameras');
            }
            if (response.data.length === 0) {
                setError('No cameras found');
                setIsLoading(false);
                return;
            }
            setCameras(response.data);
            setError(null);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch cameras');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCameras();
        // In a real application, you might want to refresh at intervals
        const interval = setInterval(loadCameras, 30000); 
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation
        if (!newCamera.name || !newCamera.camera_ip || !newCamera.location) {
            setError('Please fill in all fields');
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await CameraAPI.addCamera(newCamera);
            if (response.status !== 201) {
                throw new Error('Failed to add camera');
            }
            setCameras([...cameras, response.data]);
            setNewCamera({ name: '', camera_ip: '', location: '' });
            setError(null);
            setIsLoading(false);
            
        } catch (err) {
            console.error(err);
            setError('Failed to save camera');
            setIsLoading(false);
        }
    };

    // Open edit modal
    const handleEdit = (cameraId) => {
        const camera = cameras.find(cam => cam.id === cameraId);
        if (camera) {
            setEditingCamera(camera);
            setEditFormData({ 
                name: camera.name, 
                camera_ip: camera.camera_ip,
                location: camera.location 
            });
            setShowEditModal(true);
            setModalError(null);
        }
    };

   
    const handleUpdateCamera = async () => {
        // Validation
        if (!editFormData.name || !editFormData.camera_ip || !editFormData.location) {
            setModalError('Please fill in all fields');
            return;
        }
        
        setIsLoading(true);
        
        try{
            const updatedCamera = {
                ...editingCamera,
                name: editFormData.name,
                camera_ip: editFormData.camera_ip,
                location: editFormData.location
            };
            const response = await CameraAPI.updateCamera(editingCamera.id, updatedCamera);
            if (response.status !== 200) {
                throw new Error('Failed to update camera');
            }
            setCameras(cameras.map(cam => cam.id === editingCamera.id ? response.data : cam));
            setShowEditModal(false);
            setEditingCamera(null);
            setEditFormData({ name: '', camera_ip: '', location: '' });
            setModalError(null);
            setIsLoading(false);

        }catch(err){
            console.error(err);
            setModalError('Failed to update camera');
            setIsLoading(false);
        }

        
    };

    // Open delete confirmation modal
    const confirmDelete = (cameraId) => {
        const camera = cameras.find(cam => cam.id === cameraId);
        if (camera) {
            setCameraToDelete(camera);
            setShowDeleteModal(true);
        }
    };
    const handleDelete = async () => {
        if (!cameraToDelete) return;
        
        try {
            setIsLoading(true);
            
            const response = await CameraAPI.deleteCamera(cameraToDelete.id);
            if (response.status !== 204) {
                throw new Error('Failed to delete camera');
            }
            if(response.status === 404){
                setError('Camera not found');
                setIsLoading(false);
                return;
            }
            setCameras(cameras.filter(cam => cam.id !== cameraToDelete.id));
            setShowDeleteModal(false);
            setCameraToDelete(null);
            setError(null);
            setIsLoading(false);
            
        } catch (err) {
            console.error(err);
            setError('Failed to delete camera');
            setIsLoading(false);
        }
    };

    // Updated CameraStreamView component to work with Flask MJPEG streams
    const CameraStreamView = ({ camera }) => {
        const [streamError, setStreamError] = useState(false);
        
        // Check if we have camera_ip
        if (!camera.camera_ip) {
            return (
                <div className="text-center">
                    <FaVideo className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <span className="text-gray-500">No stream URL</span>
                </div>
            );
        }
        
        // Use the Flask route from app.py
        const streamUrl = camera.camera_ip.includes('http') 
            ? camera.camera_ip  // Use as-is if it already has http
            : `http://localhost:5000/fire`; // Default to Flask server route
        
        return (
            <div className="relative w-full h-full">
                {!streamError ? (
                    <img 
                        src={streamUrl}
                        alt={`Stream from ${camera.name}`}
                        className="w-full h-full object-cover"
                        onError={() => setStreamError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                            <span className="text-red-400">Stream unavailable</span>
                        </div>
                    </div>
                )}
            </div>
        );
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
                
                {/* Camera management content */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Camera Management</h1>
                                <p className="text-sm sm:text-base text-gray-400">
                                    Add and manage cameras for fire detection monitoring
                                </p>
                            </div>
                            <button 
                                onClick={loadCameras} 
                                className="mt-3 sm:mt-0 flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Add New Camera Form */}
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6 shadow-lg">
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                                <FaVideo className="mr-2 text-blue-500" />
                                Add New Camera
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Camera Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter camera name"
                                            value={newCamera.name}
                                            onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Camera Location</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Camera Location"
                                            value={newCamera.location}
                                            onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Stream URL</label>
                                        <input
                                            type="text"
                                            placeholder="Enter RTSP or HTTP stream URL"
                                            value={newCamera.camera_ip}
                                            onChange={(e) => setNewCamera({ ...newCamera, camera_ip: e.target.value })}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                
                                {error && (
                                    <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center">
                                        <FaExclamationCircle className="mr-2" />
                                        {error}
                                    </div>
                                )}
                                
                                <div className="flex">
                                    <button 
                                        type="submit" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors flex items-center justify-center"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <FaSync className="animate-spin mr-2" />
                                        ) : (
                                            <FaPlus className="mr-2" />
                                        )}
                                        Add Camera
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Cameras Grid */}
                        {isLoading && cameras.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 flex items-center justify-center">
                                <FaSync className="animate-spin text-2xl text-blue-500 mr-3" />
                                <p>Loading cameras...</p>
                            </div>
                        ) : cameras.length === 0 ? (
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-10 text-center">
                                <FaVideo className="mx-auto text-4xl text-gray-600 mb-3" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Cameras Found</h3>
                                <p className="text-gray-400">Add your first camera using the form above</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cameras.map((cam) => (
                                    <div key={cam.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="relative aspect-video bg-gray-900">
                                            {/* Use CameraStreamView component instead of the placeholder */}
                                            <CameraStreamView camera={cam} />
                                            
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/70 text-white text-xs rounded-md">
                                                Camera #{cam.id}
                                            </div>
                                            
                                            {/* Show recording indicator - we'll assume it's recording if we can see the stream */}
                                            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-xs text-gray-300">Recording</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-lg text-white">{cam.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    cam.status === 'online' 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : cam.status === 'error'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {cam.status === 'online' ? 'Online' : cam.status === 'error' ? 'Error' : 'Offline'}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4 truncate">{cam.camera_ip}</p>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                    onClick={() => handleEdit(cam.id)}
                                                >
                                                    <FaEdit className="mr-2" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center px-3 py-2 text-white rounded-lg transition-colors"
                                                    onClick={() => confirmDelete(cam.id)}
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
            
            {/* Edit Camera Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaEdit className="text-blue-500 mr-2" />
                            Edit Camera
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Camera Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter camera name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Camera Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter Camera Locations"
                                    value={editFormData.location}
                                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Stream URL</label>
                                <input
                                    type="text"
                                    placeholder="Enter RTSP or HTTP stream URL"
                                    value={editFormData.camera_ip}
                                    onChange={(e) => setEditFormData({ ...editFormData, camera_ip: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            {modalError && (
                                <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center">
                                    <FaExclamationCircle className="mr-2" />
                                    {modalError}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <button 
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                                onClick={handleUpdateCamera}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <FaSync className="animate-spin mr-2" />
                                ) : (
                                    <FaCheck className="mr-2" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <FaTrash className="text-red-500 mr-2" />
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete camera "{cameraToDelete?.name}"? 
                            This action cannot be undone.
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
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
}
