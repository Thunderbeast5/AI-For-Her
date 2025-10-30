import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = role selection, 1-3 = form steps
  const [selectedRole, setSelectedRole] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    sector: '',
    startupName: '',
    companyName: '',
    yearsOfExperience: '',
    expertise: '',
    investmentFocus: '',
    portfolioSize: ''
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
    { number: 2, title: 'Contact Details' },
    { number: 3, title: 'Professional Info' },
    { number: 4, title: 'Account Setup' }
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Food & Beverage', 
    'Fashion', 'Finance', 'Manufacturing', 'Services', 'Other'
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
      const emailRegex = /^[^\s@]+@gmail\.com$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid Gmail address (must end with @gmail.com)');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.sector) {
        setError('Please select your sector');
        return false;
      }
      if (selectedRole === 'entrepreneur' && !formData.startupName) {
        setError('Please enter your startup name');
        return false;
      }
      if (selectedRole === 'mentor' && (!formData.companyName || !formData.yearsOfExperience || !formData.expertise)) {
        setError('Please fill in all mentor fields');
        return false;
      }
      if (selectedRole === 'investor' && (!formData.investmentFocus || !formData.portfolioSize)) {
        setError('Please fill in all investor fields');
        return false;
      }
    } else if (currentStep === 4) {
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

    try {
      setError('');
      setLoading(true);
      const profileData = {
        sector: formData.sector,
        ...(selectedRole === 'entrepreneur' && { startupName: formData.startupName }),
        ...(selectedRole === 'mentor' && { 
          companyName: formData.companyName,
          yearsOfExperience: formData.yearsOfExperience,
          expertise: formData.expertise
        }),
        ...(selectedRole === 'investor' && { 
          investmentFocus: formData.investmentFocus,
          portfolioSize: formData.portfolioSize
        })
      };
      
      await signup(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName, 
        selectedRole,
        profileData
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/10 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <AnimatePresence mode="wait">
          {/* Role Selection - Step 0 */}
          {currentStep === 0 && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  AI For Her
                </h1>
                <p className="text-gray-600 text-lg">
                  Choose your role to get started with the registration process
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {roles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className="cursor-pointer group"
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-pink-400 transition-all duration-300 hover:shadow-lg h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-xl border-2 border-gray-200 group-hover:border-pink-400 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                          <role.icon className="w-8 h-8 text-gray-700 group-hover:text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-500 transition-colors">
                          {role.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-pink-500 hover:text-pink-600 font-semibold transition-colors underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* Multi-Step Form - Steps 1-3 */}
          {currentStep > 0 && (
            <motion.div
              key="form-steps"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              {/* Progress Steps */}
              <div className="mb-12">
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-pink-400 transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                          currentStep > step.number
                            ? 'bg-pink-400 text-white'
                          : currentStep === step.number
                          ? 'bg-pink-400 text-white ring-4 ring-pink-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckIcon className="w-6 h-6" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
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
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="First Name"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="Last Name"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Contact Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="you@gmail.com"
                        />
                      </div>

                      <div className="pt-4">
                        <p className="text-sm text-gray-600">
                          Only Gmail addresses are accepted. We'll use this email to send you important updates and notifications.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Professional Info */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                          Sector *
                        </label>
                        <select
                          id="sector"
                          name="sector"
                          value={formData.sector}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                        >
                          <option value="">Select your sector</option>
                          {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))}
                        </select>
                      </div>

                      {selectedRole === 'entrepreneur' && (
                        <div>
                          <label htmlFor="startupName" className="block text-sm font-medium text-gray-700 mb-2">
                            Startup Name *
                          </label>
                          <input
                            type="text"
                            id="startupName"
                            name="startupName"
                            value={formData.startupName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                            placeholder="Your startup name"
                          />
                        </div>
                      )}

                      {selectedRole === 'mentor' && (
                        <>
                          <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                              Company Name *
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                              placeholder="Current or previous company"
                            />
                          </div>
                          <div>
                            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                              Years of Experience *
                            </label>
                            <input
                              type="number"
                              id="yearsOfExperience"
                              name="yearsOfExperience"
                              value={formData.yearsOfExperience}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                              placeholder="Years of experience"
                              min="0"
                            />
                          </div>
                          <div>
                            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                              Areas of Expertise *
                            </label>
                            <textarea
                              id="expertise"
                              name="expertise"
                              value={formData.expertise}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all h-24 resize-none"
                              placeholder="e.g., Product Development, Team Building, Fundraising"
                            />
                          </div>
                        </>
                      )}

                      {selectedRole === 'investor' && (
                        <>
                          <div>
                            <label htmlFor="investmentFocus" className="block text-sm font-medium text-gray-700 mb-2">
                              Investment Focus *
                            </label>
                            <textarea
                              id="investmentFocus"
                              name="investmentFocus"
                              value={formData.investmentFocus}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all h-24 resize-none"
                              placeholder="e.g., Early-stage tech startups, Healthcare innovation"
                            />
                          </div>
                          <div>
                            <label htmlFor="portfolioSize" className="block text-sm font-medium text-gray-700 mb-2">
                              Portfolio Size *
                            </label>
                            <select
                              id="portfolioSize"
                              name="portfolioSize"
                              value={formData.portfolioSize}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                            >
                              <option value="">Select portfolio size</option>
                              <option value="0-5">0-5 investments</option>
                              <option value="6-10">6-10 investments</option>
                              <option value="11-20">11-20 investments</option>
                              <option value="20+">20+ investments</option>
                            </select>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Account Setup */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="Create a password"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="Confirm your password"
                        />
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-gray-600">
                          Password must be at least 6 characters long.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 bg-pink-400 text-white rounded-lg font-medium hover:bg-pink-500 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-8 py-3 bg-pink-400 text-white rounded-lg font-medium hover:bg-pink-500 transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-pink-500 hover:text-pink-600 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
