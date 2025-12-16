import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import { 
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const CreateStartup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStartupId, setEditingStartupId] = useState(null);
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    tagline: '',
    description: '',
    industry: 'Technology',
    stage: 'Ideation',
    location: '',
    foundedDate: '',
    
    // Founder Information
    founderName: '',
    email: currentUser?.email || '',
    phone: '',
    
    // Problem & Solution
    problemStatement: '',
    solution: '',
    targetMarket: '',
    uniqueSellingPoint: '',
    valueProposition: '',
    
    // Product Information
    features: '',
    technology: '',
    
    // Funding Information
    fundingGoal: '',
    currentRevenue: '',
    revenueModel: '',
    projectedRevenue: '',
    investmentUse: '',
    
    // Team Information
    teamSize: '',
    keyHires: '',
    
    // Market & Traction
    customerBase: '',
    monthlyActiveUsers: '',
    marketSize: '',
    competitors: '',
    competitiveAdvantage: '',
    achievements: '',
    
    // Business Model
    businessModel: '',
    pricingStrategy: '',
    
    // Documents & Links
    website: '',
    pitchDeck: '',
    linkedIn: '',
    twitter: '',
    
    // What you're looking for
    lookingFor: []
  });

  const industries = [
    'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
    'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
    'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
    'Education & Training', 'Technology', 'Finance', 'Other'
  ];

  const stages = [
    'Ideation',
    'Concept Research',
    'Prototype / MVP',
    'Validation',
    'Launch',
    'Growth',
    'Expansion / Funding',
    'Scaling / Maturity'
  ];
  
  const lookingForOptions = ['Funding', 'Mentorship', 'Partnership', 'Advisory', 'Talent', 'Market Access'];

  // Load startup data if editing
  useEffect(() => {
    if (location.state?.startup) {
      const startup = location.state.startup;
      setIsEditMode(true);
      setEditingStartupId(startup._id || startup.id);
      
      // Convert date to YYYY-MM-DD format for date input
      let formattedDate = '';
      if (startup.foundedDate) {
        const date = new Date(startup.foundedDate);
        formattedDate = date.toISOString().split('T')[0];
      }
      
      // Convert arrays back to comma-separated strings if needed
      const arrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || '';

      setFormData({
        name: startup.name || '',
        tagline: startup.tagline || '',
        description: startup.description || '',
        industry: startup.industry || 'Technology',
        stage: startup.stage || 'Ideation',
        location: startup.location || '',
        foundedDate: formattedDate,
        founderName: startup.founderName || '',
        email: startup.email || currentUser?.email || '',
        phone: startup.phone || '',
        problemStatement: startup.problemStatement || '',
        solution: startup.solution || '',
        targetMarket: startup.targetMarket || '',
        uniqueSellingPoint: startup.uniqueSellingPoint || '',
        valueProposition: startup.valueProposition || '',
        features: arrayToString(startup.features),
        technology: arrayToString(startup.technology),
        fundingGoal: startup.fundingGoal || '',
        currentRevenue: startup.currentRevenue || '',
        revenueModel: startup.revenueModel || '',
        projectedRevenue: startup.projectedRevenue || '',
        investmentUse: startup.investmentUse || '',
        teamSize: startup.teamSize || '',
        keyHires: arrayToString(startup.keyHires),
        customerBase: startup.customerBase || '',
        monthlyActiveUsers: startup.monthlyActiveUsers || '',
        marketSize: startup.marketSize || '',
        competitors: arrayToString(startup.competitors),
        competitiveAdvantage: startup.competitiveAdvantage || '',
        achievements: arrayToString(startup.achievements),
        businessModel: startup.businessModel || '',
        pricingStrategy: startup.pricingStrategy || '',
        website: startup.website || '',
        pitchDeck: startup.pitchDeck || '',
        linkedIn: startup.socialMedia?.linkedIn || startup.linkedIn || '',
        twitter: startup.socialMedia?.twitter || startup.twitter || '',
        lookingFor: startup.lookingFor || []
      });
    }
  }, [location.state, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => {
        const currentArray = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...currentArray, value] };
        } else {
          return { ...prev, [name]: currentArray.filter(item => item !== value) };
        }
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper function to process comma-separated strings
      const processStringToArray = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

      const startupData = {
        ...formData,
        userId: currentUser.uid,
        // Convert comma-separated strings to arrays
        features: processStringToArray(formData.features),
        technology: processStringToArray(formData.technology),
        competitors: processStringToArray(formData.competitors),
        achievements: processStringToArray(formData.achievements),
        keyHires: processStringToArray(formData.keyHires),
        // Convert numbers, handling potential empty strings
        fundingGoal: parseFloat(formData.fundingGoal) || 0,
        currentRevenue: parseFloat(formData.currentRevenue) || 0,
        projectedRevenue: parseFloat(formData.projectedRevenue) || 0,
        teamSize: parseInt(formData.teamSize) || 1,
        customerBase: parseInt(formData.customerBase) || 0,
        monthlyActiveUsers: parseInt(formData.monthlyActiveUsers) || 0,
        // Social media object
        socialMedia: {
          linkedIn: formData.linkedIn || '',
          twitter: formData.twitter || ''
        },
        updatedAt: new Date()
      };

      if (isEditMode && editingStartupId) {
        // Update existing startup
        const startupRef = doc(db, 'startups', editingStartupId);
        await updateDoc(startupRef, startupData);
        setMessage('Startup updated successfully!');
      } else {
        // Create new startup
        startupData.createdAt = new Date();
        await addDoc(collection(db, 'startups'), startupData);
        setMessage('Startup created successfully!');
      }
      
      setTimeout(() => setMessage(''), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating/updating startup:', error);
      setMessage('Failed to save startup. Please try again.');
      setTimeout(() => setMessage(''), 5000);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} startup. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 20;
    const lineHeight = 7;

    // Header
    doc.setFillColor(236, 72, 153);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(formData.name || 'Startup Proposal', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    yPosition = 50;

    const addSection = (title) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(236, 72, 153);
      doc.text(title, 20, yPosition);
      yPosition += 10;
    };

    const addText = (label, value) => {
      if (!value) return;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const textLines = doc.splitTextToSize(String(value), 170);
      doc.text(textLines, 20, yPosition + 5);
      yPosition += 5 + (textLines.length * lineHeight);
    };

    // Sections
    addSection('Basic Information');
    addText('Startup Name', formData.name);
    addText('Tagline', formData.tagline);
    addText('Industry', formData.industry);
    addText('Stage', formData.stage);
    addText('Location', formData.location);
    addText('Description', formData.description);

    yPosition += 5;
    addSection('Problem & Solution');
    addText('Problem Statement', formData.problemStatement);
    addText('Solution', formData.solution);
    addText('Target Market', formData.targetMarket);
    addText('Unique Selling Point', formData.uniqueSellingPoint);

    yPosition += 5;
    addSection('Funding Information');
    addText('Funding Goal', formData.fundingGoal ? `₹${parseFloat(formData.fundingGoal).toLocaleString('en-IN')}` : '');
    addText('Current Revenue', formData.currentRevenue ? `₹${parseFloat(formData.currentRevenue).toLocaleString('en-IN')}` : '');
    addText('Revenue Model', formData.revenueModel);
    addText('Investment Use', formData.investmentUse);

    yPosition += 5;
    addSection('Team & Market');
    addText('Team Size', formData.teamSize);
    addText('Customer Base', formData.customerBase);
    addText('Market Size', formData.marketSize);
    addText('Competitive Advantage', formData.competitiveAdvantage);

    yPosition += 5;
    addSection('Contact Information');
    addText('Founder Name', formData.founderName);
    addText('Email', formData.email);
    addText('Phone', formData.phone);
    addText('Website', formData.website);

    doc.save(`${formData.name.replace(/\s+/g, '_')}_Proposal.pdf`);
  };

  const handleCreateAnother = () => {
    setFormData({
      name: '',
      tagline: '',
      description: '',
      industry: 'Technology',
      stage: 'Ideation',
      location: '',
      foundedDate: '',
      founderName: '',
      email: currentUser?.email || '',
      phone: '',
      problemStatement: '',
      solution: '',
      targetMarket: '',
      uniqueSellingPoint: '',
      valueProposition: '',
      features: '',
      technology: '',
      fundingGoal: '',
      currentRevenue: '',
      revenueModel: '',
      projectedRevenue: '',
      investmentUse: '',
      teamSize: '',
      keyHires: '',
      customerBase: '',
      monthlyActiveUsers: '',
      marketSize: '',
      competitors: '',
      competitiveAdvantage: '',
      achievements: '',
      businessModel: '',
      pricingStrategy: '',
      website: '',
      pitchDeck: '',
      linkedIn: '',
      twitter: '',
      lookingFor: []
    });
    setSuccess(false);
    setCurrentStep(1);
    setIsEditMode(false);
    setEditingStartupId(null);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Problem & Solution' },
    { number: 3, title: 'Funding & Revenue' },
    { number: 4, title: 'Team & Market' },
    { number: 5, title: 'Links & Goals' }
  ];

  const buttonClass = "flex items-center justify-center px-6 py-3 w-40 rounded-lg font-medium transition-all duration-200";
  // const primaryButtonClass = "text-white bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed";
  // const secondaryButtonClass = "text-gray-900 bg-gradient-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const ghostButtonClass = "text-gray-700 bg-gray-100 hover:bg-gray-200";

const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
  const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
  const secondaryPinkGradient = 'bg-gradient-to-r from-pink-200 to-pink-300';
  const secondaryPinkGradientHover = 'hover:from-pink-300 hover:to-pink-400';
  const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  const secondaryButtonClass = `text-gray-900 ${secondaryPinkGradient} ${secondaryPinkGradientHover} font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  return (
    <>
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          {/* <RocketLaunchIcon className="w-8 h-8 text-pink-400" /> */}
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Your Startup' : 'Create Your Startup'}
          </h1>
        </div>
        <p className="text-gray-600">
          {isEditMode ? 'Update your startup information' : 'Share your vision with potential investors and mentors'}
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <p className="text-green-700 font-medium">
              {isEditMode ? 'Startup updated successfully!' : 'Startup created successfully!'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadPDF}
              className={`${buttonClass} bg-linear-to-r from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-white w-auto`}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className={`${buttonClass} ${primaryButtonClass} w-auto`}
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleCreateAnother}
              className={`${buttonClass} ${ghostButtonClass} w-auto`}
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white' // Active/Complete Color
                      : 'bg-gray-200 text-gray-500' // Inactive Color
                  }`}
                >
                  {step.number}
                </div>
                <span className={`text-xs mt-2 text-center ${currentStep >= step.number ? 'text-pink-500 font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 transition-colors ${currentStep > step.number ? 'bg-pink-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startup Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Enter your startup name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="A catchy one-liner describing your startup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage *
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founded Date
                </label>
                <input
                  type="date"
                  name="foundedDate"
                  value={formData.foundedDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Describe your startup in detail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Founder Name *
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Your full name"
                />
              </div>

            </div>
          </div>
        )}

        {/* Step 2: Problem & Solution */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem & Solution</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Statement *
              </label>
              <textarea
                name="problemStatement"
                value={formData.problemStatement}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="What problem are you solving?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Solution *
              </label>
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="How does your startup solve this problem?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market *
              </label>
              <textarea
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Who are your target customers?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique Selling Point
              </label>
              <textarea
                name="uniqueSellingPoint"
                value={formData.uniqueSellingPoint}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="What makes you different from competitors?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value Proposition
              </label>
              <textarea
                name="valueProposition"
                value={formData.valueProposition}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="What value do you provide to customers?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Features (comma-separated)
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technology Stack (comma-separated)
              </label>
              <input
                type="text"
                name="technology"
                value={formData.technology}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>
        )}

        {/* Step 3: Funding & Revenue */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Funding & Revenue</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Goal * (₹ INR)
                </label>
                <input
                  type="number"
                  name="fundingGoal"
                  value={formData.fundingGoal}
                  onChange={handleChange}
                  required
                  min="0"
                  step="10000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Revenue (₹ INR)
                </label>
                <input
                  type="number"
                  name="currentRevenue"
                  value={formData.currentRevenue}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projected Revenue (₹ INR)
                </label>
                <input
                  type="number"
                  name="projectedRevenue"
                  value={formData.projectedRevenue}
                  onChange={handleChange}
                  min="0"
                  step="10000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Base
                </label>
                <input
                  type="number"
                  name="customerBase"
                  value={formData.customerBase}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Active Users
                </label>
                <input
                  type="number"
                  name="monthlyActiveUsers"
                  value={formData.monthlyActiveUsers}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size *
                </label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenue Model
                </label>
                <textarea
                  name="revenueModel"
                  value={formData.revenueModel}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Describe how you generate revenue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How Will You Use Investment?
                </label>
                <textarea
                  name="investmentUse"
                  value={formData.investmentUse}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Describe how you plan to use the funding"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Model
                </label>
                <textarea
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Describe your business model"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Strategy
                </label>
                <input
                  type="text"
                  name="pricingStrategy"
                  value={formData.pricingStrategy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., Freemium, Subscription, One-time"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Team & Market */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team & Market</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Size
              </label>
              <input
                type="text"
                name="marketSize"
                value={formData.marketSize}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="e.g., $10B TAM, $2B SAM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitors (comma-separated)
              </label>
              <input
                type="text"
                name="competitors"
                value={formData.competitors}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Competitor A, Competitor B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitive Advantage
              </label>
              <textarea
                name="competitiveAdvantage"
                value={formData.competitiveAdvantage}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="What gives you an edge over competitors?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements (comma-separated)
              </label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Award won, Partnership secured, Milestone reached"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Hires Needed (comma-separated)
              </label>
              <input
                type="text"
                name="keyHires"
                value={formData.keyHires}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="CTO, Marketing Manager, Sales Lead"
              />
            </div>
          </div>
        )}

        {/* Step 5: Links & Goals */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Links</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="contact@startup.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="https://yourstartup.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Deck URL
                </label>
                <input
                  type="url"
                  name="pitchDeck"
                  value={formData.pitchDeck}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What Are You Looking For? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {lookingForOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="lookingFor"
                        value={option}
                        checked={formData.lookingFor.includes(option)}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-500 rounded focus:ring-pink-400"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
            className={`${buttonClass} ${primaryButtonClass}`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of 5
          </div>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className={`${buttonClass} ${primaryButtonClass}`}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`${buttonClass} ${primaryButtonClass} w-48`}
            >
              <RocketLaunchIcon className={`w-5 h-5 ${loading ? 'hidden' : 'inline mr-2'}`} />
              <span>{loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Startup' : 'Create Startup')}</span>
            </button>
          )}
        </div>
      </form>
    </DashboardLayout>

    {/* Toast Notification */}
    <AnimatePresence>
      {message && (
        <motion.div
          key="startup-toast"
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
  );
};

export default CreateStartup;