import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authContext';
import GoogleTranslate from '../components/GoogleTranslate';
import { FiArrowLeft } from 'react-icons/fi';

import heroImage from '../assets/log.png';
import logo from '../assets/bg.png';
import wordmark from '../assets/text.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setInfo('');
      setLoading(true);
      const userCredential = await login(formData.email, formData.password);
      const user = userCredential.user;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const role = user?.role || localStorage.getItem('userRole');
      if (role === 'entrepreneur') {
        navigate('/dashboard');
      } else if (role === 'mentor') {
        navigate('/dashboard');
      } else if (role === 'investor') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first so we can send a reset link.');
      return;
    }

    try {
      setError('');
      setInfo('');
      await resetPassword(formData.email);
      setInfo('Password reset email sent. Please check your inbox (and spam folder).');
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send password reset email.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fffdf9] overflow-hidden">
      
      {/* Left Half - Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b1f16]/40 to-transparent"></div>
        
        {/* Top Left Navigation & Branding over Image */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-6">
          {/* Back Button (Desktop - Image Side) */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#3b1f16] transition-all hover:-translate-x-1 shadow-sm"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain" />
            <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain" />
          </div>
        </div>

        <div className="absolute bottom-16 left-12 pr-12 z-20">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-normal italic font-playfair text-[#fdf9f1] drop-shadow-lg leading-tight mb-4"
          >
            Welcome back to your<br/>enterprise journey.
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full"></div>
        </div>
      </div>

      {/* Right Half - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-20 lg:px-24 py-12">
        
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#efb84a] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

        {/* Back Button (Mobile Only - Form Side) */}
        <button 
          onClick={() => navigate(-1)} 
          className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#e8dcc4] shadow-sm text-[#3b1f16] hover:text-[#6f1d1b] hover:border-[#efb84a] hover:bg-[#fffdf9] transition-all hover:-translate-x-1"
          title="Go Back"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        {/* <div className="absolute top-6 right-6 z-20">
          <GoogleTranslate />
        </div> */}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          
          <div className="lg:hidden flex items-center justify-center gap-1 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain" />
            <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-playfair italic text-[#6f1d1b] mb-2 tracking-tight">
              Sign In
            </h2>
            <p className="text-[#3b1f16] opacity-80 font-medium">
              Pick up right where you left off.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#6f1d1b] rounded-r-lg">
              <p className="text-[#6f1d1b] text-sm font-medium">{error}</p>
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <p className="text-green-800 text-sm font-medium">{info}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#3b1f16] mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-[#3b1f16] uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#6f1d1b] hover:text-[#efb84a] font-bold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#3b1f16] opacity-80">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-[#6f1d1b] hover:text-[#efb84a] font-bold underline transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;