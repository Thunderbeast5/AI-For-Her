import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { FiArrowLeft, FiMail, FiLock } from 'react-icons/fi';

import darkLogo from '../assets/logos/brown.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

      await new Promise((resolve) => setTimeout(resolve, 500));

      const role = user?.role || localStorage.getItem('userRole');
      if (role === 'entrepreneur' || role === 'mentor' || role === 'investor') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to sign in. Please check your credentials.';
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
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to send password reset email.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FCFAF8] overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#8D4624] blur-[150px] rounded-full pointer-events-none opacity-5"></div>
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[#C87A54] blur-[150px] rounded-full pointer-events-none opacity-5"></div>

      {/* Left Column - Brand Showcase & Platform Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white border-r border-[#8D4624]/10 flex-col justify-between p-16 z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8D4624] blur-[120px] rounded-full pointer-events-none opacity-10"></div>

        {/* Top bar: Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#8D4624]/20 text-[#8D4624] shadow-sm hover:bg-[#8D4624] hover:text-white transition-all duration-200 hover:-translate-x-1"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>
        </div>

        {/* Center: Brand identity and descriptions */}
        <div className="relative z-10 max-w-lg my-auto">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3.5 mb-8 cursor-pointer group w-fit"
          >
            <img
              src={darkLogo}
              alt="saharohi logo"
              className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-manrope font-semibold text-3xl tracking-wide lowercase text-black">
              saharohi
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-5 tracking-tight leading-tight">
            Turn Your Passion Into An Enterprise.
          </h1>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-20"></div>

          <div className="space-y-4 text-[#4A3228] text-base xl:text-lg font-medium opacity-90 leading-relaxed">
            <p>
              An intelligent ecosystem dedicated to empowering women with mentorship, smart insights, and strategic pathways to build and scale enduring businesses.
            </p>
            <p className="text-sm opacity-75">
              Access your personalized AI business coach, monitor your venture roadmap, and connect with fellow founders in one continuous workspace.
            </p>
          </div>
        </div>

        {/* Bottom subtle copyright note */}
        <div className="text-xs text-[#4A3228]/60">
          © 2026 saharohi. All rights reserved.
        </div>
      </div>

      {/* Right Column - Direct Borderless Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-16 lg:px-24 py-16 z-10">
        {/* Back Button (Mobile Only) */}
        <button
          onClick={() => navigate(-1)}
          className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#8D4624]/20 text-[#8D4624] shadow-sm hover:bg-[#8D4624] hover:text-white transition-all"
          title="Go Back"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo View */}
          <div
            className="lg:hidden flex items-center justify-center gap-2.5 mb-8 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={darkLogo} alt="saharohi logo" className="h-12 w-auto object-contain" />
            <span className="font-manrope font-semibold text-2xl tracking-wide lowercase text-black">
              saharohi
            </span>
          </div>

          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-4xl md:text-5xl font-normal italic font-playfair text-[#8D4624] mb-3 tracking-tight">
              Sign In
            </h2>
            <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-4 w-16 sm:mx-0 mx-auto"></div>
            <p className="text-[#4A3228] opacity-85 text-base sm:text-lg font-medium">
              Pick up right where you left off.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/90 border-l-4 border-red-500 rounded-r-2xl shadow-sm">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-green-50/90 border-l-4 border-green-600 rounded-r-2xl shadow-sm">
              <p className="text-green-800 text-sm font-medium">{info}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                  <FiMail className="text-xl" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#8D4624]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#8D4624] hover:text-[#73371b] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                  <FiLock className="text-xl" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-4 px-6 rounded-full font-medium text-base text-white bg-[#8D4624] border border-white/60 shadow-sm hover:bg-[#73371b] hover:shadow-md transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#8D4624]/15 text-center">
            <p className="text-[#4A3228] opacity-85 text-base">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-[#8D4624] hover:text-[#73371b] font-bold underline transition-colors"
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