import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import WarliLoader from './WarliLoader';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <WarliLoader size={88} />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected component if user is authenticated
  return children;
};

export default ProtectedRoute;