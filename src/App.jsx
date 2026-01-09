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
import DocsLogin from "./pages/DocsLogin";
import DocsSignup from "./pages/DocsSignup";
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
          {/* <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/api-keys" element={<ApiKeys />} /> */}
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/users" element={<Users />} />
          <Route path="/docs-login" element={<DocsLogin />} />
          <Route path="/docs-signup" element={<DocsSignup />} />
          <Route path="/docs" element={<Docs />} />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-dashboard"
            element={
              <ProtectedRoute>
                <Docs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <ApiKeys />
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