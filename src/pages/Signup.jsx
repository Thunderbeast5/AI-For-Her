import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authContext';
import GoogleTranslate from '../components/GoogleTranslate';
import { FiArrowLeft } from 'react-icons/fi';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

import heroImage from '../assets/real_sign.png';
import logo from '../assets/bg.png';
import wordmark from '../assets/text.png';

const Signup = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { signup } = authContext || {};
  
  const [currentStep, setCurrentStep] = useState(0); 
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
      icon: BriefcaseIcon
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Guide entrepreneurs & share your expertise',
      icon: UserGroupIcon
    },
    {
      id: 'investor',
      title: "I'm an Investor",
      description: 'Discover opportunities & invest in promising startups',
      icon: CurrencyDollarIcon
    }
  ];

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Email' },
    { number: 3, title: 'Password' }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setCurrentStep(1);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.email) {
        setError('Please enter your email');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in all password fields');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedRole('');
    } else {
      setCurrentStep(currentStep - 1);
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
      setError(err.response?.data?.message || err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fffdf9] overflow-hidden">
      
      {/* Left Half - Image Section (Matches Login) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b1f16]/40 to-transparent"></div>
        
        {/* Top Left Navigation & Branding */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#3b1f16] transition-all hover:-translate-x-1 shadow-sm"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain " />
            <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain " />
          </div>
        </div>

        <div className="absolute bottom-16 left-12 pr-12 z-20">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-normal italic font-playfair text-[#fdf9f1] drop-shadow-lg leading-tight mb-4"
          >
            Start building your<br/>legacy today.
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full"></div>
        </div>
      </div>

      {/* Right Half - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-20 lg:px-24 py-12 h-screen overflow-y-auto">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#efb84a] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

        {/* Back Button (Mobile Only) */}
        <button 
          onClick={() => navigate(-1)} 
          className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#e8dcc4] shadow-sm text-[#3b1f16] hover:text-[#6f1d1b] hover:border-[#efb84a] hover:bg-[#fffdf9] transition-all hover:-translate-x-1"
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
          className="w-full max-w-md relative z-10 py-12"
        >
          
          <AnimatePresence mode="wait">
            {/* Step 0: Role Selection */}
            {currentStep === 0 && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="lg:hidden flex items-center justify-center gap-1 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                  <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain" />
                  <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain" />
                </div>

                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-bold font-playfair italic text-[#6f1d1b] mb-2 tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-[#3b1f16] opacity-80 font-medium">
                    How would you like to join the ecosystem?
                  </p>
                </div>

                <div className="flex flex-col gap-4 mb-10">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className="cursor-pointer group"
                    >
                      <div className="bg-white border border-[#e8dcc4] rounded-2xl p-5 flex items-center gap-5 hover:border-[#efb84a] hover:bg-[#efb84a]/5 hover:shadow-[0_4px_20px_rgba(111,29,27,0.05)] transition-all duration-300">
                        <div className="w-14 h-14 rounded-xl border border-[#e8dcc4] bg-[#fffdf9] flex-shrink-0 flex items-center justify-center group-hover:border-[#efb84a] group-hover:scale-105 transition-all duration-300">
                          <role.icon className="w-7 h-7 text-[#3b1f16] group-hover:text-[#d99a2b]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#6f1d1b] mb-1 group-hover:text-[#d99a2b] transition-colors">
                            {role.title}
                          </h3>
                          <p className="text-[#3b1f16] opacity-80 text-sm leading-snug">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-[#3b1f16] opacity-80">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-[#6f1d1b] hover:text-[#efb84a] font-bold underline transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Steps 1-3: Form Details */}
            {currentStep > 0 && (
              <motion.div
                key="form-steps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-bold font-playfair italic text-[#6f1d1b] mb-2 tracking-tight">
                    Your Details
                  </h2>
                  <p className="text-[#3b1f16] opacity-80 font-medium capitalize">
                    Registering as a {selectedRole}
                  </p>
                </div>

                {/* Themed Progress Steps */}
                <div className="mb-12 relative max-w-sm mx-auto lg:mx-0">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#e8dcc4] -translate-y-1/2 -z-10 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between relative z-10">
                    {steps.map((step) => (
                      <div key={step.number} className="flex flex-col items-center">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                            currentStep > step.number
                              ? 'bg-gradient-to-r from-[#efb84a] to-[#d99a2b] text-[#3b1f16] border-transparent'
                            : currentStep === step.number
                            ? 'bg-white border-[#d99a2b] text-[#d99a2b] shadow-[0_0_15px_rgba(239,184,74,0.3)]'
                              : 'bg-white border-[#e8dcc4] text-[#e8dcc4]'
                          }`}
                        >
                          {currentStep > step.number ? (
                            <CheckIcon className="w-5 h-5 stroke-2" />
                          ) : (
                            step.number
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border-l-4 border-[#6f1d1b] rounded-r-lg"
                    >
                      <p className="text-[#6f1d1b] text-sm font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Elements */}
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1 */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-bold text-[#3b1f16] mb-2 uppercase tracking-wide">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                            placeholder="e.g. Priya"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-bold text-[#3b1f16] mb-2 uppercase tracking-wide">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                            placeholder="e.g. Sharma"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
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
                            className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                            placeholder="you@email.com"
                          />
                        </div>
                        <p className="text-sm text-[#3b1f16] opacity-70">
                          We'll use this to securely verify your identity.
                        </p>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div>
                          <label htmlFor="password" className="block text-sm font-bold text-[#3b1f16] mb-2 uppercase tracking-wide">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                            placeholder="Create a strong password"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#3b1f16] mb-2 uppercase tracking-wide">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] placeholder-[#3b1f16]/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all"
                            placeholder="Re-enter your password"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-10">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-3 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16]"
                    >
                      Back
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-3 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16]"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-3 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16] ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? 'Creating...' : 'Submit'}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;