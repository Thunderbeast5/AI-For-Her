import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authContext';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiCheck } from 'react-icons/fi';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

import darkLogo from '../assets/logos/brown.png';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useAuth();
  const { signup } = authContext || {};

  // If a role was passed via state from RoleSelection, start at step 1; otherwise step 0
  const initialRole = location.state?.role || '';
  const [currentStep, setCurrentStep] = useState(initialRole ? 1 : 0);
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'entrepreneur',
      title: "I'm an Entrepreneur",
      description: 'Build your startup & connect with mentors and investors',
      icon: BriefcaseIcon,
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Guide entrepreneurs & share your expertise',
      icon: UserGroupIcon,
    },
    {
      id: 'investor',
      title: "I'm an Investor",
      description: 'Discover opportunities & invest in promising startups',
      icon: CurrencyDollarIcon,
    },
  ];

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Email' },
    { number: 3, title: 'Password' },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setCurrentStep(1);
    setError('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Please fill in your first and last name.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        setError('Please enter your email address.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in both password fields.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedRole('');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!signup) {
      setError('Authentication service not available. Please refresh the page.');
      return;
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
      setError(err.response?.data?.message || err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FCFAF8] overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#8D4624] blur-[150px] rounded-full pointer-events-none opacity-5"></div>
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[#C87A54] blur-[150px] rounded-full pointer-events-none opacity-5"></div>

      {/* Left Column - Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white border-r border-[#8D4624]/10 flex-col justify-between p-16 z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8D4624] blur-[120px] rounded-full pointer-events-none opacity-10"></div>

        {/* Top bar: Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => (currentStep > 0 ? handleBack() : navigate(-1))}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#8D4624]/20 text-[#8D4624] shadow-sm hover:bg-[#8D4624] hover:text-white transition-all duration-200 hover:-translate-x-1"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>
        </div>

        {/* Center: Brand identity */}
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
            Build Something Meaningful Today.
          </h1>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-20"></div>

          <div className="space-y-4 text-[#4A3228] text-base xl:text-lg font-medium opacity-90 leading-relaxed">
            <p>
              Join an interconnected ecosystem of women entrepreneurs, experienced mentors, and investors shaping tomorrow's enterprises.
            </p>
            <p className="text-sm opacity-75">
              Set up your profile in minutes to access intelligent business coaching, grants, and strategic growth networks.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#4A3228]/60">
          © 2026 saharohi. All rights reserved.
        </div>
      </div>

      {/* Right Column - Direct Borderless Multi-Step Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-16 lg:px-24 py-16 z-10 overflow-y-auto">
        <button
          onClick={() => (currentStep > 0 ? handleBack() : navigate(-1))}
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

          <AnimatePresence mode="wait">
            {/* Step 0: Choose Role */}
            {currentStep === 0 && (
              <motion.div
                key="step-role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center sm:text-left">
                  <h2 className="text-4xl md:text-5xl font-normal italic font-playfair text-[#8D4624] mb-3 tracking-tight">
                    Select Your Role
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-4 w-16 sm:mx-0 mx-auto"></div>
                  <p className="text-[#4A3228] opacity-85 text-base sm:text-lg font-medium">
                    Choose how you want to engage with Saharohi.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className="p-5 bg-white border border-[#8D4624]/15 rounded-3xl cursor-pointer hover:border-[#8D4624] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-5 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#FCFAF8] border border-[#8D4624]/15 flex items-center justify-center shrink-0 text-[#8D4624] group-hover:bg-[#8D4624] group-hover:text-white transition-all duration-200">
                        <role.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#8D4624] mb-0.5">{role.title}</h4>
                        <p className="text-sm text-[#4A3228] opacity-80 leading-relaxed">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1-3: Multi-Step Info Collection */}
            {currentStep > 0 && (
              <motion.div
                key="step-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stepper Progress Bar */}
                <div className="mb-10">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#8D4624]/15 -z-0">
                      <div
                        className="h-full bg-[#8D4624] transition-all duration-300"
                        style={{
                          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {steps.map((step) => {
                      const isCompleted = currentStep > step.number;
                      const isActive = currentStep === step.number;
                      return (
                        <div key={step.number} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                              isCompleted
                                ? 'bg-[#8D4624] text-white shadow-sm'
                                : isActive
                                ? 'bg-white text-[#8D4624] border-2 border-[#8D4624] shadow-sm ring-4 ring-[#8D4624]/10'
                                : 'bg-white text-[#4A3228]/50 border border-[#8D4624]/20'
                            }`}
                          >
                            {isCompleted ? <FiCheck className="text-base" /> : step.number}
                          </div>
                          <span
                            className={`mt-2 text-xs font-medium tracking-tight ${
                              isActive ? 'text-[#8D4624] font-semibold' : 'text-[#4A3228]/60'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8 text-center sm:text-left">
                  <h2 className="text-3xl md:text-4xl font-normal italic font-playfair text-[#8D4624] mb-2 tracking-tight">
                    {steps[currentStep - 1].title}
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-3 w-14 sm:mx-0 mx-auto"></div>
                  <p className="text-sm sm:text-base text-[#4A3228] opacity-80">
                    Step {currentStep} of {steps.length} • Registering as{' '}
                    <span className="capitalize font-semibold text-[#8D4624]">{selectedRole}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50/90 border-l-4 border-red-500 rounded-r-2xl shadow-sm">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Names */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                            <FiUser className="text-xl" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Enter first name"
                            className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5">
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                            <FiUser className="text-xl" />
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Enter last name"
                            className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Email */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                            <FiMail className="text-xl" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@example.com"
                            className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-[#4A3228] opacity-80 leading-relaxed pt-1">
                        We'll send your registration confirmation, enterprise updates, and mentor alerts here.
                      </p>
                    </div>
                  )}

                  {/* Step 3: Password */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                            <FiLock className="text-xl" />
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="At least 6 characters"
                            className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8D4624] mb-2.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#8D4624]/70">
                            <FiLock className="text-xl" />
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Re-enter your password"
                            className="w-full pl-12 sm:pl-14 pr-5 py-4 bg-white border border-[#8D4624]/20 rounded-2xl text-[#4A3228] text-base placeholder-[#4A3228]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8D4624]/25 focus:border-[#8D4624] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#8D4624]/15 gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3.5 rounded-full text-sm font-medium text-[#4A3228] bg-white border border-[#8D4624]/20 hover:bg-[#8D4624]/5 transition-all shadow-sm"
                    >
                      Back
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3.5 rounded-full text-sm font-medium text-white bg-[#8D4624] border border-white/60 hover:bg-[#73371b] shadow-sm hover:shadow-md transition-all"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3.5 rounded-full text-sm font-medium text-white bg-[#8D4624] border border-white/60 hover:bg-[#73371b] shadow-sm hover:shadow-md transition-all ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-[#8D4624]/15 text-center">
            <p className="text-[#4A3228] opacity-85 text-base">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#8D4624] hover:text-[#73371b] font-bold underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;