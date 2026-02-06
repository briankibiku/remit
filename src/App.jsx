import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Verify from './pages/Verify';
import Wallet from './pages/Wallet';
import Users from './pages/Users';
import Landing from './pages/Landing';
import ApiPartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import PartnerDashboard from './pages/PartnerDashboard';
import Docs from './pages/Docs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Accessible without authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/api-keys" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'api_partner']}>
                <ApiKeys />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/docs" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'api_partner']}>
                <Docs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wallet" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Wallet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          {/* Partner Routes */}
          <Route path="/partner-login" element={<ApiPartnerLogin />} />
          <Route path="/partner-signup" element={<PartnerSignup />} />
          <Route 
            path="/partner-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['api_partner']}>
                <PartnerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default Route - Redirect to dashboard */}
          <Route path="/" element={<Landing />} />
          
          {/* 404 Route - Any unknown path redirects to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;