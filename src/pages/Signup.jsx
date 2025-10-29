import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [showRoleSelection, setShowRoleSelection] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'entrepreneur',
      title: "I'm an Entrepreneur",
      description: 'Build your startup & connect with mentors and investors',
      icon: BriefcaseIcon,
      color: 'text-purple-600 border-purple-600 hover:bg-purple-50'
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Guide entrepreneurs & share your expertise',
      icon: UserGroupIcon,
      color: 'text-blue-600 border-blue-600 hover:bg-blue-50'
    },
    {
      id: 'investor',
      title: "I'm an Investor",
      description: 'Discover opportunities & invest in promising startups',
      icon: CurrencyDollarIcon,
      color: 'text-green-600 border-green-600 hover:bg-green-50'
    }
  ];

  const roleInfo = {
    entrepreneur: {
      title: 'Entrepreneur',
      icon: BriefcaseIcon,
      color: 'text-purple-600 border-purple-600'
    },
    mentor: {
      title: 'Mentor',
      icon: UserGroupIcon,
      color: 'text-blue-600 border-blue-600'
    },
    investor: {
      title: 'Investor',
      icon: CurrencyDollarIcon,
      color: 'text-green-600 border-green-600'
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setShowRoleSelection(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName, 
        selectedRole
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {showRoleSelection ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">What brings you to AI For Her?</h2>
              <p className="text-gray-600">Choose your role to get started with the registration process</p>
            </div>
            
            <div className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${role.color}`}
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      {React.createElement(role.icon, { className: "w-8 h-8" })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{role.title}</h3>
                      <p className="text-gray-600 text-sm">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md">
            {/* Role Badge */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${roleInfo[selectedRole].color}`}>
                {React.createElement(roleInfo[selectedRole].icon, { className: "w-5 h-5" })}
                <span>{roleInfo[selectedRole].title}</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join AI For Her as a {roleInfo[selectedRole].title}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

          {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Create a password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Change Role */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowRoleSelection(true)}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Change role
              </button>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    );
  };

export default Signup;
