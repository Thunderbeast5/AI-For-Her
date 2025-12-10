import { useState, useEffect, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import {
  RocketLaunchIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth';

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const ListProject = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [startups, setStartups] = useState([])
  const [selectedStartup, setSelectedStartup] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  
  const [formData, setFormData] = useState({
    // Project Selection
    startupId: '',
    projectName: '',
    
    // Funding Details
    fundingGoal: '',
    minimumInvestment: '',
    maximumInvestment: '',
    fundingDeadline: '',
    equityOffered: '',
    valuationAmount: '',
    
    // Project Details
    projectDescription: '',
    fundingPurpose: '',
    revenueModel: '',
    currentRevenue: '',
    projectedRevenue: '',
    monthlyBurnRate: '',
    
    // Milestones & Timeline
    milestones: '',
    timeline: '',
    
    // Market & Traction
    marketSize: '',
    competitiveAdvantage: '',
    customerBase: '',
    growthRate: '',
    
    // Team & Credentials
    teamSize: '',
    keyTeamMembers: '',
    advisors: '',
    
    // Documents & Media
    pitchDeckUrl: '',
    businessPlanUrl: '',
    financialProjectionsUrl: '',
    videoUrl: '',
    images: '',
    
    // Legal & Compliance
    registeredEntity: '',
    registrationNumber: '',
    taxId: '',
    
    // Additional Information
    previousFunding: '',
    existingInvestors: '',
    risks: '',
    exitStrategy: ''
  })

  // Pink Gradient Classes for consistency
  const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
  const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
  const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  
  useEffect(() => {
    const fetchStartups = async () => {
      if (!currentUser?.uid) {
        setStartups([]);
        return;
      }
      try {
        const userId = currentUser.uid;
        const startupsQuery = query(collection(db, 'startups'), where('userId', '==', userId));
        const startupsSnapshot = await getDocs(startupsQuery);
        const startupsData = startupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStartups(startupsData);
      } catch (error) {
        console.error('Error fetching startups:', error);
        setStartups([]);
      }
    };

    fetchStartups();
  }, [currentUser.uid]);

  // Handle edit mode
  useEffect(() => {
    if (location.state?.editProject) {
      const project = location.state.editProject
      setIsEditMode(true)
      setEditingProjectId(project._id || project.id) // Ensure we capture the ID
      setCurrentStep(2) // Skip to step 2 since startup is already selected
      
      // Set the startup selection (assuming it's a simple ID string)
      setSelectedStartup(project.startupId) 
      
      // Helper to format arrays to comma-separated strings
      const arrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || '';
      
      // Populate form with project data
      setFormData({
        startupId: project.startupId || '',
        projectName: project.projectName || '',
        fundingGoal: project.fundingGoal || '',
        minimumInvestment: project.minimumInvestment || '',
        maximumInvestment: project.maximumInvestment || '',
        fundingDeadline: project.fundingDeadline ? new Date(project.fundingDeadline).toISOString().split('T')[0] : '',
        equityOffered: project.equityOffered || '',
        valuationAmount: project.valuationAmount || '',
        projectDescription: project.projectDescription || '',
        fundingPurpose: project.fundingPurpose || '',
        revenueModel: project.revenueModel || '',
        currentRevenue: project.currentRevenue || '',
        projectedRevenue: project.projectedRevenue || '',
        monthlyBurnRate: project.monthlyBurnRate || '',
        milestones: arrayToString(project.milestones).replace(/, /g, '\n'), // Keep newline for milestones
        timeline: project.timeline || '',
        marketSize: project.marketSize || '',
        competitiveAdvantage: project.competitiveAdvantage || '',
        customerBase: project.customerBase || '',
        growthRate: project.growthRate || '',
        teamSize: project.teamSize || '',
        keyTeamMembers: arrayToString(project.keyTeamMembers),
        advisors: arrayToString(project.advisors),
        pitchDeckUrl: project.pitchDeckUrl || '',
        businessPlanUrl: project.businessPlanUrl || '',
        financialProjectionsUrl: project.financialProjectionsUrl || '',
        videoUrl: project.videoUrl || '',
        images: arrayToString(project.images),
        registeredEntity: project.registeredEntity || '',
        registrationNumber: project.registrationNumber || '',
        taxId: project.taxId || '',
        previousFunding: project.previousFunding || '',
        existingInvestors: project.existingInvestors || '',
        risks: project.risks || '',
        exitStrategy: project.exitStrategy || ''
      })
      
      // Fetch the selected startup data if available (for auto-population display in step 1)
      if (project.startupId) {
        const startup = startups.find(s => s.id === project.startupId);
        if (startup) {
          setSelectedStartup(startup);
        }
      }
    }
  }, [location.state, startups]) // Add startups as dependency for initial population

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-populate all available data when startup is selected
    if (name === 'startupId') {
      const startup = startups.find(s => s.id === value)
      if (startup) {
        setSelectedStartup(startup)
        
        // Helper to format arrays to strings
        const arrayToInputString = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || '';

        setFormData(prev => ({
          ...prev,
          projectName: startup.name || '',
          projectDescription: startup.description || '',
          revenueModel: startup.revenueModel || '',
          currentRevenue: startup.currentRevenue || '',
          projectedRevenue: startup.projectedRevenue || '',
          teamSize: startup.teamSize || '',
          marketSize: startup.marketSize || '',
          competitiveAdvantage: startup.competitiveAdvantage || '',
          customerBase: startup.customerBase || '',
          fundingPurpose: startup.investmentUse || '',
          milestones: arrayToInputString(startup.achievements).replace(/, /g, '\n'), // Newline separation for milestones input
          keyTeamMembers: arrayToInputString(startup.keyHires),
          pitchDeckUrl: startup.pitchDeck || '',
          website: startup.website || '',
          businessPlanUrl: startup.businessModel || '',
          registeredEntity: startup.name || '',
          previousFunding: startup.fundingGoal ? `Previous goal: ₹${parseFloat(startup.fundingGoal).toLocaleString('en-IN')}` : '',
          risks: startup.problemStatement ? `Challenge: ${startup.problemStatement}` : '',
          growthRate: startup.monthlyActiveUsers ? `${startup.monthlyActiveUsers} monthly active users` : ''
        }))
      } else {
        setSelectedStartup(null);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userId = currentUser.uid
      
      // Helper to process string inputs to arrays
      const processStringToArray = (str) => str.split(/[\n,]/).map(m => m.trim()).filter(Boolean);

      const projectData = {
        ...formData,
        userId,
        entrepreneurId: userId,
        // Convert to float/int
        fundingGoal: parseFloat(formData.fundingGoal),
        minimumInvestment: parseFloat(formData.minimumInvestment),
        maximumInvestment: parseFloat(formData.maximumInvestment),
        equityOffered: parseFloat(formData.equityOffered),
        valuationAmount: parseFloat(formData.valuationAmount),
        currentRevenue: parseFloat(formData.currentRevenue) || 0,
        projectedRevenue: parseFloat(formData.projectedRevenue) || 0,
        monthlyBurnRate: parseFloat(formData.monthlyBurnRate) || 0,
        customerBase: parseInt(formData.customerBase) || 0,
        teamSize: parseInt(formData.teamSize) || 0,
        // Process array fields
        milestones: processStringToArray(formData.milestones),
        images: processStringToArray(formData.images),
        keyTeamMembers: processStringToArray(formData.keyTeamMembers),
        advisors: processStringToArray(formData.advisors),
        updatedAt: new Date()
      }

      // Add fields only for new projects
      if (!isEditMode) {
        projectData.currentFunding = 0
        projectData.fundingPercentage = 0
        projectData.investors = []
        projectData.status = 'active'
        projectData.createdAt = new Date()
      }

      if (isEditMode && editingProjectId) {
        const projectRef = doc(db, 'investment-projects', editingProjectId);
        await updateDoc(projectRef, projectData);
      } else {
        await addDoc(collection(db, 'investment-projects'), projectData);
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      setMessage(isEditMode ? 'Project updated successfully!' : 'Project listed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'listing'} project:`, error)
      setMessage(`Failed to ${isEditMode ? 'update' : 'list'} project. Please try again.`);
      setTimeout(() => setMessage(''), 5000);
      alert(`Failed to ${isEditMode ? 'update' : 'list'} project. Please try again.`);
      setSuccess(false); // Ensure success state is reset on error
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    // Basic validation for Step 1 before proceeding
    if (currentStep === 1 && formData.startupId) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 1 && !formData.startupId) {
      alert('Please select a startup before proceeding.');
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  const steps = [
    { number: 1, title: 'Select Project' },
    { number: 2, title: 'Investment Details' }
  ];

  if (success) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="max-w-2xl mx-auto text-center py-12">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Project Updated Successfully!' : 'Project Listed Successfully!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isEditMode ? 'Your project changes have been saved.' : 'Your project is now visible to investors.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-8 py-3 ${primaryButtonClass} w-auto`}
          >
            Go to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardLayout sidebar={sidebar}>
      <div>
        <div className="flex items-center space-x-3 mb-2">
          {/* <RocketLaunchIcon className="w-8 h-8 text-pink-400" /> */}
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Investment Project' : 'List Your Project for Investment'}
          </h1>
        </div>
        <p className="text-gray-600 mb-8">
          {isEditMode ? 'Update your project details and investment information' : 'Connect with investors and raise funds for your startup'}
        </p>
        

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center w-full max-w-lg mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Number Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step.number
                        ? `${pinkGradient} text-white`
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  {/* Step Title */}
                  <span className={`text-xs mt-2 text-center ${currentStep >= step.number ? 'text-pink-500 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 transition-colors ${currentStep > step.number ? 'bg-pink-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>


        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Step 1: Project Selection & Auto-populated Data */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Startup</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Startup to List for Investment *
                </label>
                
                <select
                  name="startupId"
                  value={formData.startupId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">Select a startup</option>
                  {startups.map(startup => (
                    <option key={startup.id} value={startup.id}>
                      {startup.name} - {startup.industry} - {startup.stage}
                    </option>
                  ))}
                </select>
                
                {startups.length === 0 && (
                  <p className="text-sm text-pink-600 mt-2">
                    No startups found. Please create a startup first from the "Create Startup" menu.
                  </p>
                )}
              </div>

              {formData.startupId && selectedStartup && (
                <div className="bg-pink-50 rounded-lg p-6 space-y-4 border border-pink-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">Auto-populated Startup Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Project Name</label>
                      <p className="font-medium text-gray-900">{formData.projectName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Industry</label>
                      <p className="font-medium text-gray-900">{selectedStartup.industry}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Stage</label>
                      <p className="font-medium text-gray-900">{selectedStartup.stage}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Team Size</label>
                      <p className="font-medium text-gray-900">{formData.teamSize || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Description</label>
                    <p className="text-sm text-gray-700">{formData.projectDescription}</p>
                  </div>

                  {formData.revenueModel && (
                    <div>
                      <label className="text-xs text-gray-500">Revenue Model</label>
                      <p className="text-sm text-gray-700">{formData.revenueModel}</p>
                    </div>
                  )}

                  {formData.currentRevenue && (
                    <div>
                      <label className="text-xs text-gray-500">Current Revenue</label>
                      <p className="text-sm text-gray-700">₹{parseFloat(formData.currentRevenue).toLocaleString('en-IN')}</p>
                    </div>
                  )}

                  <p className="text-xs text-pink-600 italic mt-4">
                    ✓ All startup data has been automatically imported. Proceed to add investment-specific details in the next step.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Investment-Specific Details Only */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Details</h2>
              <p className="text-sm text-gray-600 mb-4">
                Please provide the financial and investment-specific information below.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Funding Goal (₹) *
                  </label>
                  <input
                    type="number"
                    name="fundingGoal"
                    value={formData.fundingGoal}
                    onChange={handleChange}
                    required
                    step="10000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 1000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">How much total funding do you need?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment (₹) *
                  </label>
                  <input
                    type="number"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleChange}
                    required
                    step="10000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 50000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum amount per investor</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Investment (₹)
                  </label>
                  <input
                    type="number"
                    name="maximumInvestment"
                    value={formData.maximumInvestment}
                    onChange={handleChange}
                    step="10000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 500000 (Optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum amount per investor (optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Deadline *
                  </label>
                  <input
                    type="date"
                    name="fundingDeadline"
                    value={formData.fundingDeadline}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Last date to accept investments</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Equity Offered (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="equityOffered"
                    value={formData.equityOffered}
                    onChange={handleChange}
                    required
                    min="0.1"
                    max="100"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">What percentage of equity are you offering?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Valuation (₹) *
                  </label>
                  <input
                    type="number"
                    name="valuationAmount"
                    value={formData.valuationAmount}
                    onChange={handleChange}
                    required
                    step="100000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 10000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current company valuation (Pre-money)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How will you use the funding? *
                </label>
                <textarea
                  name="fundingPurpose"
                  value={formData.fundingPurpose}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., Product development 40%, Marketing 30%, Team expansion 20%, Operations 10%"
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Optional: Supporting Documents & Media</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Pitch Deck URL
                    </label>
                    <input
                      type="url"
                      name="pitchDeckUrl"
                      value={formData.pitchDeckUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Video Pitch URL
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className={`px-6 py-3 w-48 ${primaryButtonClass}`}
              >
                Previous
              </button>
            ) : (
              // Empty div to maintain spacing consistency when 'Previous' is disabled/hidden
              <div className='w-48'></div> 
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.startupId || loading}
                className={`px-6 py-3 w-58 ${primaryButtonClass}`}
              >
                Next:Investment Details
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center px-8 py-3 w-48 ${primaryButtonClass}`}
              >
                <RocketLaunchIcon className={`w-5 h-5 ${loading ? 'hidden' : 'inline mr-2'}`} />
                <span>
                  {loading 
                    ? (isEditMode ? 'Updating...' : 'Listing...') 
                    : (isEditMode ? 'Update Project' : 'List Project')
                  }
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>

    {/* Toast Notification */}
    <AnimatePresence>
      {message && (
        <motion.div
          key="project-toast"
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-9999 w-full max-w-sm"
        >
          <div className={`p-4 rounded-lg shadow-xl text-sm font-medium border ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  )
}

export default ListProject