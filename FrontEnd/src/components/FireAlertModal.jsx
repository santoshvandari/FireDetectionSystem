import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaVideo, FaMapMarkerAlt, FaNetworkWired, FaExclamationTriangle } from 'react-icons/fa';

const FireAlertModal = ({ visible, data, onClose }) => {
    const navigate = useNavigate();
    const alertSoundRef = useRef(null);

    // Use current time if timestamp is not provided by the socket
    const timestamp = data?.timestamp || new Date().toISOString();

    // Play alert sound only when modal is visible
    useEffect(() => {
        if (visible) {
            if (!alertSoundRef.current) {
                alertSoundRef.current = new Audio('/alert.mp3');
                alertSoundRef.current.loop = true;
            }
            alertSoundRef.current.play().catch(err =>
                console.log('Failed to play alert sound:', err)
            );
        } else {
            if (alertSoundRef.current) {
                alertSoundRef.current.pause();
                alertSoundRef.current.currentTime = 0;
            }
        }
        // Cleanup on unmount
        return () => {
            if (alertSoundRef.current) {
                alertSoundRef.current.pause();
                alertSoundRef.current.currentTime = 0;
            }
        };
    }, [visible]);

    if (!visible) return null;

    const stopAudioAndClose = (callback) => {
        if (alertSoundRef.current) {
            alertSoundRef.current.pause();
            alertSoundRef.current.currentTime = 0;
        }
        if (onClose) onClose();
        if (callback) callback();
    };

    const handleAcknowledge = () => {
        stopAudioAndClose(() => navigate("/alerts"));
    };

    const handleViewCamera = () => {
        stopAudioAndClose(() => navigate(`/cameras/${data?.camera_id || ''}`));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="bg-gray-900 rounded-lg shadow-lg max-w-md w-full border-2 border-red-500 overflow-hidden animate-popup">
                {/* Header */}
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <FaFire className="text-white text-2xl mr-2 animate-pulse" />
                        <h2 className="text-xl font-bold text-white">Fire Alert Detected!</h2>
                    </div>
                    <div className="animate-ping h-3 w-3 rounded-full bg-white"></div>
                </div>
                {/* Content */}
                <div className="p-6">
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-400 flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            <span>{data?.message || 'Fire detected!'}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-300">
                            <FaVideo className="text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-400">Camera</p>
                                <p className="font-medium">{data?.camera_name || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <FaMapMarkerAlt className="text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-400">Location</p>
                                <p className="font-medium">{data?.location || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <FaNetworkWired className="text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-400">Camera IP</p>
                                <p className="font-medium text-xs">{data?.camera_ip || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <div className="h-5 w-5 flex items-center justify-center text-gray-400 mr-3">
                                <span className="font-bold">#</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Camera ID</p>
                                <p className="font-medium">{data?.camera_id || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-gray-400 text-sm mb-6">
                        Alert received: <span className="text-gray-300">{new Date(timestamp).toLocaleString()}</span>
                    </div>
                    {data?.image_url && (
                        <div className="mb-6">
                            <img
                                src={data.image_url}
                                alt="Fire Detection"
                                className="w-full h-auto rounded-lg border border-gray-700 shadow"
                            />
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAcknowledge}
                            className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                            Acknowledge Alert
                        </button>
                        <button
                            onClick={handleViewCamera}
                            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition font-medium"
                        >
                            View Camera
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                .animate-popup {
                    animation: popup 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes popup {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default FireAlertModal;
