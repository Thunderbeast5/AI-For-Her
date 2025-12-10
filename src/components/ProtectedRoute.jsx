import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Check if email is verified (Firebase property)
  // Add a small delay to ensure Firebase auth state is fully loaded
  if (currentUser && !currentUser.emailVerified) {
    // Redirect to email verification page if email is not verified
    return <Navigate to="/verify-email" replace />;
  }
  
  // Render the protected component if user is authenticated and verified
  return children;
};

export default ProtectedRoute;