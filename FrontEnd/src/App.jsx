import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate, Outlet } from 'react-router-dom';
import { useFireAlertSocket } from './websocket/websocket';
import Login  from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Logout from "./components/Logout";
import Dashboard from "./pages/Dashboard";
import Cameras from "./components/Cameras";
import Alerts from "./components/Alerts";
import DetectionHistory from "./components/DetectionHistory";
import FireAlertModal from './components/FireAlertModal';

function App(){
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const { lastAlert } = useFireAlertSocket();
  

  useEffect(() => {
      if (lastAlert && lastAlert.type === 'alert_message') {
          setAlertData(lastAlert);
          setShowAlertModal(true);
      }
  }, [lastAlert]);

  const handleAlertClose = () => {
      setShowAlertModal(false);
      setAlertData(null);
  };

  return (
    <Router>
      {/* Fire Alert Modal is always mounted */}
      <FireAlertModal
          visible={showAlertModal}
          data={alertData}
          onClose={handleAlertClose}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cameras"
          element={
            <ProtectedRoute>
              <Cameras />
            </ProtectedRoute>
          }
          />
          <Route
            path="/cameras/:cameraId"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
            />
            <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <DetectionHistory />
                </ProtectedRoute>
              }
            />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  )
}

export default App;
