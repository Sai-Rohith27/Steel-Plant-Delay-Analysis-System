import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DelayEntry from './pages/DelayEntry';
import DelayHistory from './pages/DelayHistory';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import EquipmentMaster from './pages/EquipmentMaster';
import DataImport from './pages/DataImport';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/delay-entry" element={<ProtectedRoute><AppLayout><DelayEntry /></AppLayout></ProtectedRoute>} />
      <Route path="/delay-history" element={<ProtectedRoute><AppLayout><DelayHistory /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><AppLayout><EquipmentMaster /></AppLayout></ProtectedRoute>} />
      <Route path="/import" element={<ProtectedRoute><AppLayout><DataImport /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
