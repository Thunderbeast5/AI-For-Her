import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  
  // Check if email is verified
  // Allow existing users (created before Nov 1, 2025) to bypass verification
  const userCreationTime = new Date(currentUser.metadata.creationTime);
  const verificationCutoffDate = new Date('2025-11-01'); // Change this date as needed
  const isExistingUser = userCreationTime < verificationCutoffDate;
  
  if (!currentUser.emailVerified && !isExistingUser) {
    // Redirect to email verification page if email is not verified
    // But allow existing test accounts to bypass
    return <Navigate to="/verify-email" replace />;
  }
  
  // Render the protected component if user is authenticated and verified (or existing user)
  return children;
};

export default ProtectedRoute;