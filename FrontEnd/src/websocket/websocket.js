// src/hooks/useFireAlertSocket.js
import { useEffect, useRef, useState } from 'react';

// Default WebSocket URL to connect to
const DEFAULT_WS_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080/ws';

export const useFireAlertSocket = (wsUrl = DEFAULT_WS_URL) => {
    const [lastAlert, setLastAlert] = useState(null);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    wsUrl = wsUrl + "/alert/"
    
    // Function to establish WebSocket connection
    const connectWebSocket = () => {
        try {
            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;
            
            socket.onopen = () => {
                console.log('🔥 WebSocket connected');
                setConnected(true);
                
                // Clear any pending reconnection attempts when successfully connected
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };
            
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔥 Alert received:', data);
                    
                    // Check for valid alert message format
                    if (data.type === 'alert_message') {
                        setLastAlert(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            socket.onclose = (event) => {
                console.log('🧯 WebSocket disconnected', event.code, event.reason);
                setConnected(false);
                
                // Attempt to reconnect after a delay
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect WebSocket...');
                    connectWebSocket();
                }, 3000); // Retry after 3 seconds
            };
            
            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                // Socket will automatically try to close after an error
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnected(false);
            
            // Attempt to reconnect after a delay
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('Attempting to reconnect WebSocket after error...');
                connectWebSocket();
            }, 5000); // Retry after 5 seconds on connection error
        }
    };
    
    useEffect(() => {
        // Initialize WebSocket connection
        connectWebSocket();
        
        // Play alert sound function for reuse
        const playAlertSound = () => {
            try {
                const alertSound = new Audio('/alert-sound.mp3');
                alertSound.play().catch(err => console.log('Failed to play alert sound:', err));
            } catch (error) {
                console.error('Error playing alert sound:', error);
            }
        };
        
        // Clean up on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [wsUrl]);
    
    // When lastAlert changes, play the alert sound
    useEffect(() => {
        if (lastAlert) {
            try {
                const alertSound = new Audio('/alert-sound.mp3');
                alertSound.play().catch(err => console.log('Failed to play alert sound:', err));
            } catch (error) {
                console.error('Error playing alert sound:', error);
            }
        }
    }, [lastAlert]);
    
    // Function to reset current alert after handling
    const resetAlert = () => {
        setLastAlert(null);
    };

    return {
        lastAlert,
        connected,
        resetAlert
    };
};
