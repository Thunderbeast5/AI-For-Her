import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../api'
import {
  CurrencyRupeeIcon,
  RocketLaunchIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ListProject = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [startups, setStartups] = useState([])
  const [selectedStartup, setSelectedStartup] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [debugInfo, setDebugInfo] = useState({
    userId: '',
    fetchAttempted: false,
    apiResponse: null,
    error: null
  })

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

  const industries = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 
    'Food & Beverage', 'Agriculture', 'Manufacturing', 'Services', 'Other'
  ]

  const fundingTypes = [
    'Equity', 'Debt', 'Convertible Note', 'SAFE', 'Revenue Share'
  ]

  // Fetch user's startups
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const userId = localStorage.getItem('userId')
        console.log('=== STARTUP FETCH DEBUG ===')
        console.log('1. Fetching startups for userId:', userId)
        
        setDebugInfo(prev => ({ ...prev, userId, fetchAttempted: true }))
        
        if (!userId) {
          console.error('❌ No userId found in localStorage')
          console.log('localStorage keys:', Object.keys(localStorage))
          setStartups([])
          setDebugInfo(prev => ({ ...prev, error: 'No userId in localStorage' }))
          return
        }
        
        const url = `${API_BASE_URL}/startups/user/${userId}`
        console.log('2. Fetching from URL:', url)
        
        const response = await fetch(url)
        console.log('3. Response status:', response.status)
        console.log('4. Response ok:', response.ok)
        
        const result = await response.json()
        console.log('5. Full API Response:', result)
        
        setDebugInfo(prev => ({ ...prev, apiResponse: result }))
        
        // Handle both response formats: { success, data } or direct array
        const startupsData = result.data || result
        console.log('6. Extracted startups data:', startupsData)
        console.log('7. Is array?', Array.isArray(startupsData))
        console.log('8. Number of startups:', startupsData?.length || 0)
        
        if (Array.isArray(startupsData) && startupsData.length > 0) {
          console.log('9. ✅ Startups found:', startupsData.map(s => ({ id: s._id, name: s.name })))
          setStartups(startupsData)
        } else {
          console.log('9. ❌ No startups found in response')
          setStartups([])
          
          // Try fetching all startups to debug
          console.log('10. Attempting to fetch ALL startups for debugging...')
          const allResponse = await fetch(`${API_BASE_URL}/startups`)
          const allStartups = await allResponse.json()
          console.log('11. All startups in database:', allStartups)
        }
        
        console.log('=== END DEBUG ===')
      } catch (error) {
        console.error('❌ Error fetching startups:', error)
        setDebugInfo(prev => ({ ...prev, error: error.message }))
        setStartups([])
      }
    }

    fetchStartups()
  }, [])

  // Handle edit mode
  useEffect(() => {
    if (location.state?.editProject) {
      const project = location.state.editProject
      setIsEditMode(true)
      setEditingProjectId(project._id)
      setCurrentStep(2) // Skip to step 2 since startup is already selected
      
      // Set the startup selection
      setSelectedStartup(project.startupId)
      
      // Populate form with project data
      setFormData({
        startupId: project.startupId?._id || project.startupId || '',
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
        milestones: Array.isArray(project.milestones) ? project.milestones.join('\n') : project.milestones || '',
        timeline: project.timeline || '',
        marketSize: project.marketSize || '',
        competitiveAdvantage: project.competitiveAdvantage || '',
        customerBase: project.customerBase || '',
        growthRate: project.growthRate || '',
        teamSize: project.teamSize || '',
        keyTeamMembers: Array.isArray(project.keyTeamMembers) ? project.keyTeamMembers.join(', ') : project.keyTeamMembers || '',
        advisors: Array.isArray(project.advisors) ? project.advisors.join(', ') : project.advisors || '',
        pitchDeckUrl: project.pitchDeckUrl || '',
        businessPlanUrl: project.businessPlanUrl || '',
        financialProjectionsUrl: project.financialProjectionsUrl || '',
        videoUrl: project.videoUrl || '',
        images: Array.isArray(project.images) ? project.images.join(', ') : project.images || '',
        registeredEntity: project.registeredEntity || '',
        registrationNumber: project.registrationNumber || '',
        taxId: project.taxId || '',
        previousFunding: project.previousFunding || '',
        existingInvestors: project.existingInvestors || '',
        risks: project.risks || '',
        exitStrategy: project.exitStrategy || ''
      })
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-populate all available data when startup is selected
    if (name === 'startupId') {
      const startup = startups.find(s => s._id === value)
      if (startup) {
        setSelectedStartup(startup)
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
          milestones: Array.isArray(startup.achievements) ? startup.achievements.join(', ') : startup.achievements || '',
          competitiveAdvantage: startup.uniqueSellingPoint || startup.competitiveAdvantage || '',
          keyTeamMembers: Array.isArray(startup.keyHires) ? startup.keyHires.join(', ') : startup.keyHires || '',
          pitchDeckUrl: startup.pitchDeck || '',
          website: startup.website || '',
          businessPlanUrl: startup.businessModel || '',
          registeredEntity: startup.name || '',
          previousFunding: startup.fundingGoal ? `Previous goal: ₹${startup.fundingGoal}` : '',
          risks: startup.problemStatement ? `Challenge: ${startup.problemStatement}` : '',
          growthRate: startup.monthlyActiveUsers ? `${startup.monthlyActiveUsers} monthly active users` : ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userId = localStorage.getItem('userId')
      
      const projectData = {
        ...formData,
        userId,
        entrepreneurId: userId,
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
        milestones: formData.milestones.split('\n').map(m => m.trim()).filter(Boolean),
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
        keyTeamMembers: formData.keyTeamMembers.split(',').map(m => m.trim()).filter(Boolean),
        advisors: formData.advisors.split(',').map(a => a.trim()).filter(Boolean),
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

      const url = isEditMode 
        ? `${API_BASE_URL}/investment-projects/${editingProjectId}`
        : `${API_BASE_URL}/investment-projects`
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'list'} project`)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'listing'} project:`, error)
      alert(`Failed to ${isEditMode ? 'update' : 'list'} project. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  if (success) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-12"
        >
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Project Updated Successfully!' : 'Project Listed Successfully!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isEditMode ? 'Your project changes have been saved.' : 'Your project is now visible to investors.'}
          </p>
        </motion.div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Investment Project' : 'List Your Project for Investment'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isEditMode ? 'Update your project details and investment information' : 'Connect with investors and raise funds for your startup'}
        </p>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-primary to-accent text-gray-800'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 2 && (
                  <div
                    className={`w-64 h-1 ${
                      currentStep > step ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Select Project</span>
            <span>Investment Details</span>
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
                    <option key={startup._id} value={startup._id}>
                      {startup.name} - {startup.industry} - {startup.stage}
                    </option>
                  ))}
                </select>
                
                {startups.length === 0 && debugInfo.fetchAttempted && (
                  <p className="text-sm text-red-500 mt-2">
                    No startups found. Please create a startup first from "Create Startup" menu.
                  </p>
                )}
              </div>

              {formData.startupId && selectedStartup && (
                <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Auto-populated Information</h3>
                  
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
                      <p className="text-sm text-gray-700">₹{formData.currentRevenue.toLocaleString()}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 italic">
                    ✓ All startup data has been automatically imported. Proceed to add investment details.
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
                Please provide only the investment-specific information below. All other details have been imported from your startup.
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., 10000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current company valuation</p>
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

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Optional: Additional Documents</h4>
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
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.startupId}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-gray-800 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Add Investment Details
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-primary to-accent text-gray-800 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading 
                  ? (isEditMode ? 'Updating Project...' : 'Listing Project...') 
                  : (isEditMode ? 'Update Project' : 'List Project for Investment')
                }
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}

export default ListProject
