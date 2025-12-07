import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleTranslate from '../components/GoogleTranslate';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Gmail
    // const emailRegex = /^[^\s@]+@gmail\.com$/;
    // if (!emailRegex.test(formData.email)) {
    //   setError('Please enter a valid Gmail address (must end with @gmail.com)');
    //   return;
    // }

    try {
      setError('');
      setLoading(true);
      const user = await login(formData.email, formData.password);
      
      // Wait for state to update before navigating
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      const role = user?.role || localStorage.getItem('userRole');
      if (role === 'entrepreneur') {
        navigate('/dashboard'); // Shows EntrepreneurDashboard
      } else if (role === 'mentor') {
        navigate('/dashboard'); // Shows MentorDashboard
      } else if (role === 'investor') {
        navigate('/dashboard'); // Shows InvestorDashboard
      } else {
        navigate('/dashboard'); // Default
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/20 flex items-center justify-center px-4 py-12 relative">
      {/* Google Translate Widget */}
      <div className="absolute top-4 right-4">
        <GoogleTranslate />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 notranslate">AI For Her</h1>
          <p className="text-gray-600">Empowering Women Entrepreneurs</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                placeholder="you@gmail.com"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-pink-400 text-white font-semibold rounded-lg hover:bg-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
