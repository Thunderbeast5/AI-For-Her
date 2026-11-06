import { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

const ListProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  
  const [formData, setFormData] = useState({
    startupId: '',
    projectName: '',
    fundingGoal: '',
    minimumInvestment: '',
    maximumInvestment: '',
    fundingDeadline: '',
    equityOffered: '',
    valuationAmount: '',
    projectDescription: '',
    fundingPurpose: '',
    revenueModel: '',
    currentRevenue: '',
    projectedRevenue: '',
    monthlyBurnRate: '',
    milestones: '',
    timeline: '',
    marketSize: '',
    competitiveAdvantage: '',
    customerBase: '',
    growthRate: '',
    teamSize: '',
    keyTeamMembers: '',
    advisors: '',
    pitchDeckUrl: '',
    businessPlanUrl: '',
    financialProjectionsUrl: '',
    videoUrl: '',
    images: '',
    registeredEntity: '',
    registrationNumber: '',
    taxId: '',
    previousFunding: '',
    existingInvestors: '',
    risks: '',
    exitStrategy: ''
  });

  useEffect(() => {
    const fetchStartups = async () => {
      if (!currentUser?.uid) {
        setStartups([]);
        setInitialLoading(false);
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
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStartups();
  }, [currentUser?.uid]);

  // Handle edit mode
  useEffect(() => {
    if (location.state?.editProject) {
      const project = location.state.editProject;
      setIsEditMode(true);
      setEditingProjectId(project._id || project.id);
      setCurrentStep(2);

      const arrayToString = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || '';
      
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
        milestones: arrayToString(project.milestones).replace(/, /g, '\n'),
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
      });
      
      if (project.startupId && startups.length > 0) {
        const startup = startups.find(s => s.id === project.startupId);
        if (startup) {
          setSelectedStartup(startup);
        }
      }
    }
  }, [location.state, startups]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'startupId') {
      const startup = startups.find(s => s.id === value);
      if (startup) {
        setSelectedStartup(startup);
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
          milestones: arrayToInputString(startup.achievements).replace(/, /g, '\n'),
          keyTeamMembers: arrayToInputString(startup.keyHires),
          pitchDeckUrl: startup.pitchDeck || '',
          website: startup.website || '',
          businessPlanUrl: startup.businessModel || '',
          registeredEntity: startup.name || '',
          previousFunding: startup.fundingGoal ? `Previous goal: ₹${parseFloat(startup.fundingGoal).toLocaleString('en-IN')}` : '',
          risks: startup.problemStatement ? `Challenge: ${startup.problemStatement}` : '',
          growthRate: startup.monthlyActiveUsers ? `${startup.monthlyActiveUsers} monthly active users` : ''
        }));
      } else {
        setSelectedStartup(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = currentUser.uid;
      const processStringToArray = (str) => str ? str.split(/[\n,]/).map(m => m.trim()).filter(Boolean) : [];

      const projectData = {
        ...formData,
        userId,
        entrepreneurId: userId,
        fundingGoal: parseFloat(formData.fundingGoal) || 0,
        minimumInvestment: parseFloat(formData.minimumInvestment) || 0,
        maximumInvestment: parseFloat(formData.maximumInvestment) || 0,
        equityOffered: parseFloat(formData.equityOffered) || 0,
        valuationAmount: parseFloat(formData.valuationAmount) || 0,
        currentRevenue: parseFloat(formData.currentRevenue) || 0,
        projectedRevenue: parseFloat(formData.projectedRevenue) || 0,
        monthlyBurnRate: parseFloat(formData.monthlyBurnRate) || 0,
        customerBase: parseInt(formData.customerBase) || 0,
        teamSize: parseInt(formData.teamSize) || 0,
        milestones: processStringToArray(formData.milestones),
        images: processStringToArray(formData.images),
        keyTeamMembers: processStringToArray(formData.keyTeamMembers),
        advisors: processStringToArray(formData.advisors),
        updatedAt: new Date()
      };

      if (!isEditMode) {
        projectData.currentFunding = 0;
        projectData.fundingPercentage = 0;
        projectData.investors = [];
        projectData.status = 'active';
        projectData.createdAt = new Date();
      }

      if (isEditMode && editingProjectId) {
        const projectRef = doc(db, 'investment-projects', editingProjectId);
        await updateDoc(projectRef, projectData);
      } else {
        await addDoc(collection(db, 'investment-projects'), projectData);
      }

      setSuccess(true);
      setMessage(isEditMode ? 'Project updated successfully!' : 'Project listed successfully!');
      setTimeout(() => setMessage(''), 3000);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'listing'} project:`, error);
      setMessage(`Failed to ${isEditMode ? 'update' : 'list'} project. Please try again.`);
      setTimeout(() => setMessage(''), 5000);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.startupId) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 1 && !formData.startupId) {
      setMessage('Please select a startup first.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sidebar = useMemo(() => <EntrepreneurSidebar />, []);

  const steps = [
    { number: 1, title: 'Select Project', icon: BuildingOfficeIcon },
    { number: 2, title: 'Investment Terms', icon: CurrencyDollarIcon }
  ];

  const sectionClass = "p-6 sm:p-8 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-6 transition-colors";
  const inputClass = "h-11 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] transition-all text-stone-900 placeholder:text-stone-400";
  const selectClass = "w-full h-11 rounded-xl border border-[#8d4624]/25 bg-transparent px-3 text-sm text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8d4624] transition-all";

  if (success) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="max-w-2xl mx-auto text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
          <CheckCircleIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3 tracking-tight">
            {isEditMode ? 'Portfolio Updated Successfully!' : 'Venture Listed for Investment!'}
          </h2>
          <p className="text-sm text-stone-600 mb-6">
            {isEditMode ? 'Your fundraising parameters have been revised.' : 'Your venture is now open to verified investors on the platform.'}
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-6 py-2.5 font-medium shadow-xs"
          >
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout sidebar={sidebar}>
        <div className="space-y-8 pb-20">
          
          {/* Header */}
          {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-transparent border border-[#8d4624]/25">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#f5e9dd] text-[#8d4624] mb-2.5">
                <SparklesIcon className="w-3.5 h-3.5" /> Investment Marketplace
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {isEditMode ? 'Edit Investment Terms' : 'List Project for Investment'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500">
                Setup your capital round, equity parameters, and investment requirements
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10 w-fit text-xs px-4"
            >
              Back to Dashboard
            </Button>
          </div> */}

          {/* Stepper Indicator */}
          <div className="p-5 sm:p-6 rounded-2xl bg-transparent border border-[#8d4624]/20">
            <div className="flex justify-between items-center max-w-md mx-auto">
              {steps.map((step, index) => {
                const isActive = currentStep === step.number;
                const isPassed = currentStep > step.number;
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div
                      onClick={() => !loading && (!isEditMode && step.number === 2 && !formData.startupId ? null : setCurrentStep(step.number))}
                      className="flex flex-col items-center flex-1 cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                          isActive
                            ? 'bg-[#8d4624] text-white shadow-md ring-2 ring-[#8d4624]/30'
                            : isPassed
                            ? 'bg-[#f5e9dd] text-[#8d4624] border border-[#8d4624]/25'
                            : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight ${
                          isActive ? 'text-[#8d4624] font-bold' : isPassed ? 'text-stone-700' : 'text-stone-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-4 transition-colors ${currentStep > step.number ? 'bg-[#8d4624]' : 'bg-[#8d4624]/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Container with Skeletal Fallback */}
          {initialLoading ? (
            <div className={sectionClass}>
              <div className="flex items-center gap-3 border-b border-[#8d4624]/15 pb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
              <div className="flex justify-between pt-6 border-t border-[#8d4624]/15">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={sectionClass}>
              
              {/* Step 1: Select Startup */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                      <BuildingOfficeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900">Select Registered Venture</h2>
                      <p className="text-xs text-stone-500">Pick an active startup profile to attach to this fundraising round</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Select Startup Profile *</Label>
                    <select
                      name="startupId"
                      value={formData.startupId}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      <option value="">Select a registered startup</option>
                      {startups.map(startup => (
                        <option key={startup.id} value={startup.id}>
                          {startup.name} • {startup.industry || 'General'} ({startup.stage || 'Active'})
                        </option>
                      ))}
                    </select>
                    
                    {startups.length === 0 && (
                      <p className="text-xs text-[#8d4624] font-medium pt-1">
                        No registered ventures found. Please create your startup first from the "Create Startup" page.
                      </p>
                    )}
                  </div>

                  {formData.startupId && selectedStartup && (
                    <div className="p-5 rounded-2xl border border-[#8d4624]/20 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#8d4624]/15 pb-2.5">
                        <h3 className="text-sm font-bold text-stone-900">Imported Venture Overview</h3>
                        <span className="text-[11px] font-semibold text-[#8d4624] bg-[#f5e9dd] px-2.5 py-0.5 rounded-full">
                          Auto-Linked
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-[11px] text-stone-400 uppercase font-medium">Venture</span>
                          <p className="text-sm font-bold text-stone-900 mt-0.5">{formData.projectName}</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 uppercase font-medium">Industry</span>
                          <p className="text-sm font-bold text-stone-900 mt-0.5">{selectedStartup.industry || 'General'}</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 uppercase font-medium">Stage</span>
                          <p className="text-sm font-bold text-stone-900 mt-0.5">{selectedStartup.stage || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 uppercase font-medium">Core Team</span>
                          <p className="text-sm font-bold text-stone-900 mt-0.5">{formData.teamSize || '1'} members</p>
                        </div>
                      </div>

                      {formData.projectDescription && (
                        <div className="pt-2 border-t border-[#8d4624]/10">
                          <span className="text-[11px] text-stone-400 uppercase font-medium">Description</span>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                            {formData.projectDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Investment Terms */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                      <CurrencyDollarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-900">Fundraising & Equity Terms</h2>
                      <p className="text-xs text-stone-500">Financial targets, minimum ticket sizes, and round limits</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Total Funding Goal (₹) *</Label>
                      <Input
                        type="number"
                        name="fundingGoal"
                        value={formData.fundingGoal}
                        onChange={handleChange}
                        required
                        step="10000"
                        placeholder="e.g., 1000000"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Minimum Ticket Size (₹) *</Label>
                      <Input
                        type="number"
                        name="minimumInvestment"
                        value={formData.minimumInvestment}
                        onChange={handleChange}
                        required
                        step="10000"
                        placeholder="e.g., 50000"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Maximum Investment Cap (₹)</Label>
                      <Input
                        type="number"
                        name="maximumInvestment"
                        value={formData.maximumInvestment}
                        onChange={handleChange}
                        step="10000"
                        placeholder="e.g., 500000 (Optional)"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Funding Round Deadline *</Label>
                      <Input
                        type="date"
                        name="fundingDeadline"
                        value={formData.fundingDeadline}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Total Equity Offered (%) *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        name="equityOffered"
                        value={formData.equityOffered}
                        onChange={handleChange}
                        required
                        min="0.1"
                        max="100"
                        placeholder="e.g., 10"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Pre-Money Company Valuation (₹) *</Label>
                      <Input
                        type="number"
                        name="valuationAmount"
                        value={formData.valuationAmount}
                        onChange={handleChange}
                        required
                        step="100000"
                        placeholder="e.g., 10000000"
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Allocation / Use of Capital *</Label>
                      <Textarea
                        name="fundingPurpose"
                        value={formData.fundingPurpose}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="e.g., 40% Product development, 30% User acquisition, 20% Team expansion, 10% Operations"
                        className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Pitch Deck Link</Label>
                      <Input
                        type="url"
                        name="pitchDeckUrl"
                        value={formData.pitchDeckUrl}
                        onChange={handleChange}
                        placeholder="https://drive.google.com/..."
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-stone-600">Video Pitch Link</Label>
                      <Input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        placeholder="https://youtube.com/..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#8d4624]/15">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={loading}
                    className="rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs px-4 gap-1.5"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.startupId || loading}
                    className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-5 font-semibold gap-1.5"
                  >
                    Proceed to Terms
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-6 font-semibold gap-2 shadow-xs"
                  >
                    <RocketLaunchIcon className="w-4 h-4" />
                    <span>
                      {loading 
                        ? (isEditMode ? 'Updating...' : 'Listing...') 
                        : (isEditMode ? 'Update Portfolio' : 'List Portfolio')
                      }
                    </span>
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      </DashboardLayout>

      {/* Floating Status Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="project-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="fixed top-6 right-6 z-50 w-full max-w-sm"
          >
            <div className={`p-4 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md border ${
              message.toLowerCase().includes('success') 
                ? 'bg-[#f5e9dd]/95 text-[#8d4624] border-[#8d4624]/30' 
                : 'bg-red-50/95 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListProject;