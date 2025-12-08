import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://pratibhara-backend.onrender.com/api';
  

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, firstName, lastName, role) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        role
      });

      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);

      setCurrentUser(user);
      setUserRole(user.role);

      return user;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);

      setCurrentUser(user);
      setUserRole(user.role);

      return user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setCurrentUser(null);
    setUserRole(null);
  };

  // Update current user (for email verification)
  const updateCurrentUser = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
  };

  // Fetch user role from MongoDB
  const fetchUserRole = async (userId) => {
    try {
      const role = localStorage.getItem('userRole');
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for stored authentication
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('userRole');
      const email = localStorage.getItem('userEmail');

      if (token && userId && role) {
        // Create a minimal user object from localStorage
        // This avoids API calls and speeds up the initial load
        const user = {
          userId,
          role,
          email,
          emailVerified: true // Assume verified if they have a token
        };
        
        setCurrentUser(user);
        setUserRole(role);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Resend verification email (placeholder for MongoDB implementation)
  const resendVerificationEmail = async () => {
    console.log('Email verification not implemented for MongoDB yet');
  };

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    logout,
    updateCurrentUser,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
