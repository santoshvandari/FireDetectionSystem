import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Login  from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Logout from "./components/Logout";
import Dashboard from "./pages/Dashboard";
import Cameras from "./components/Cameras";
import Alerts from "./components/Alerts";
import DetectionHistory from "./components/DetectionHistory";

function App(){
  return (
    <Router>
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
