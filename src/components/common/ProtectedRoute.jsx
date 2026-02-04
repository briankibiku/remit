import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If a partner tries to access regular dashboard, send them back to partner dashboard
    if (user?.role === 'api_partner') {
      return <Navigate to="/partner-dashboard" replace />;
    }
    // Otherwise, redirect to common landing or login
    return <Navigate to="/" replace />;
  }
  
  // Render the protected component
  return children;
};

export default ProtectedRoute;