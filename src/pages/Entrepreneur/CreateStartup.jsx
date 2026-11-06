import { useState, useEffect } from 'react';
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
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  UsersIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

const CreateStartup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStartupId, setEditingStartupId] = useState(null);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.state?.startup) {
        const startup = location.state.startup;
        setIsEditMode(true);
        setEditingStartupId(startup._id || startup.id);
        
        let formattedDate = '';
        if (startup.foundedDate) {
          const date = new Date(startup.foundedDate);
          formattedDate = date.toISOString().split('T')[0];
        }
        
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
      setInitialLoading(false);
    }, 300);

    return () => clearTimeout(timer);
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

  const handleCheckboxToggle = (name, itemValue) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updated = current.includes(itemValue)
        ? current.filter(i => i !== itemValue)
        : [...current, itemValue];
      return { ...prev, [name]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const processStringToArray = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

      const startupData = {
        ...formData,
        userId: currentUser.uid,
        features: processStringToArray(formData.features),
        technology: processStringToArray(formData.technology),
        competitors: processStringToArray(formData.competitors),
        achievements: processStringToArray(formData.achievements),
        keyHires: processStringToArray(formData.keyHires),
        fundingGoal: parseFloat(formData.fundingGoal) || 0,
        currentRevenue: parseFloat(formData.currentRevenue) || 0,
        projectedRevenue: parseFloat(formData.projectedRevenue) || 0,
        teamSize: parseInt(formData.teamSize) || 1,
        customerBase: parseInt(formData.customerBase) || 0,
        monthlyActiveUsers: parseInt(formData.monthlyActiveUsers) || 0,
        socialMedia: {
          linkedIn: formData.linkedIn || '',
          twitter: formData.twitter || ''
        },
        updatedAt: new Date()
      };

      if (isEditMode && editingStartupId) {
        const startupRef = doc(db, 'startups', editingStartupId);
        await updateDoc(startupRef, startupData);
        setMessage('Startup profile updated successfully!');
      } else {
        startupData.createdAt = new Date();
        await addDoc(collection(db, 'startups'), startupData);
        setMessage('Startup profile registered successfully!');
      }
      
      setSuccess(true);
      setTimeout(() => setMessage(''), 3000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating/updating startup:', error);
      setMessage(`Failed to ${isEditMode ? 'update' : 'create'} startup. Please try again.`);
      setTimeout(() => setMessage(''), 5000);
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

    doc.setFillColor(141, 70, 36);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(formData.name || 'Startup Proposal', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    yPosition = 50;

    const addSection = (title) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(141, 70, 36);
      doc.text(title, 20, yPosition);
      yPosition += 10;
    };

    const addText = (label, value) => {
      if (!value) return;
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10.5);
      doc.setTextColor(45, 40, 35);
      doc.setFont(undefined, 'bold');
      doc.text(label + ':', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const textLines = doc.splitTextToSize(String(value), 170);
      doc.text(textLines, 20, yPosition + 5);
      yPosition += 5 + (textLines.length * lineHeight);
    };

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

    doc.save(`${formData.name.replace(/\s+/g, '_') || 'Startup'}_Proposal.pdf`);
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
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: BuildingOfficeIcon },
    { number: 2, title: 'Problem & Solution', icon: LightBulbIcon },
    { number: 3, title: 'Funding & Revenue', icon: CurrencyDollarIcon },
    { number: 4, title: 'Team & Market', icon: UsersIcon },
    { number: 5, title: 'Links & Goals', icon: LinkIcon }
  ];

  const sectionClass = "p-6 sm:p-8 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-6 transition-colors";
  const inputClass = "h-11 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] transition-all text-stone-900 placeholder:text-stone-400";
  const selectClass = "w-full h-11 rounded-xl border border-[#8d4624]/25 bg-transparent px-3 text-sm text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8d4624] transition-all";

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="space-y-8 pb-20">
        
        {/* Header */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-transparent border border-[#8d4624]/25">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#f5e9dd] text-[#8d4624] mb-2.5">
              <SparklesIcon className="w-3.5 h-3.5" /> Venture Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {isEditMode ? 'Edit Startup Profile' : 'Create New Startup'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500">
              Formulate your venture profile for investors, incubators, and automated deck generation
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

        {/* Success Action Notification */}
        {success && (
          <div className="p-6 rounded-2xl bg-transparent border border-emerald-600/30">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              <p className="text-emerald-800 font-semibold text-sm">
                {isEditMode ? 'Startup updated successfully!' : 'Startup created successfully!'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl gap-2 text-xs"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download PDF Dossier
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10 text-xs"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={handleCreateAnother}
                className="rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs"
              >
                Create Another
              </Button>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="p-5 sm:p-6 rounded-2xl bg-transparent border border-[#8d4624]/20">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isPassed = currentStep > step.number;
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  onClick={() => !loading && setCurrentStep(step.number)}
                  className={`flex flex-col items-center text-center cursor-pointer group transition-all`}
                >
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
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
                    className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight hidden sm:block ${
                      isActive ? 'text-[#8d4624] font-bold' : isPassed ? 'text-stone-700' : 'text-stone-400'
                    }`}
                  >
                    {step.title}
                  </span>
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
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-[#8d4624]/15">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={sectionClass}>
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Basic Information</h2>
                    <p className="text-xs text-stone-500">Core identity and foundational parameters</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Startup Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., GreenHarvest Tech"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Tagline</Label>
                    <Input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleChange}
                      placeholder="A punchy one-liner summarizing your venture"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Industry Sector *</Label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Current Stage *</Label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleChange}
                      required
                      className={selectClass}
                    >
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Headquarters / Location *</Label>
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Nashik, Maharashtra"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Founded Date</Label>
                    <Input
                      type="date"
                      name="foundedDate"
                      value={formData.foundedDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Executive Overview *</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Comprehensive overview of what your enterprise does and aims to achieve..."
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Founder Name *</Label>
                    <Input
                      type="text"
                      name="founderName"
                      value={formData.founderName}
                      onChange={handleChange}
                      required
                      placeholder="Your full legal name"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Problem & Solution */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <LightBulbIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Problem & Solution</h2>
                    <p className="text-xs text-stone-500">Value proposition and product architecture</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Problem Statement *</Label>
                    <Textarea
                      name="problemStatement"
                      value={formData.problemStatement}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="What exact market gap or friction point are you eliminating?"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Your Solution *</Label>
                    <Textarea
                      name="solution"
                      value={formData.solution}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="How does your product solve this friction directly?"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Target Market *</Label>
                    <Textarea
                      name="targetMarket"
                      value={formData.targetMarket}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Who are your primary consumer personas or B2B clients?"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Unique Selling Proposition (USP)</Label>
                    <Textarea
                      name="uniqueSellingPoint"
                      value={formData.uniqueSellingPoint}
                      onChange={handleChange}
                      rows={2}
                      placeholder="What is your defensible differentiator?"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Key Features (comma-separated)</Label>
                    <Input
                      type="text"
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      placeholder="Automated dispatch, Vernacular UI, Instant reconciliation"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Technology Stack (comma-separated)</Label>
                    <Input
                      type="text"
                      name="technology"
                      value={formData.technology}
                      onChange={handleChange}
                      placeholder="React, Node.js, Firebase, Tailwind CSS"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Funding & Revenue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <CurrencyDollarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Funding & Revenue</h2>
                    <p className="text-xs text-stone-500">Commercial parameters and financial milestones</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Funding Goal * (₹ INR)</Label>
                    <Input
                      type="number"
                      name="fundingGoal"
                      value={formData.fundingGoal}
                      onChange={handleChange}
                      required
                      min="0"
                      step="10000"
                      placeholder="500000"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Current Revenue (₹ INR)</Label>
                    <Input
                      type="number"
                      name="currentRevenue"
                      value={formData.currentRevenue}
                      onChange={handleChange}
                      min="0"
                      step="10000"
                      placeholder="200000"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Projected Revenue (₹ INR)</Label>
                    <Input
                      type="number"
                      name="projectedRevenue"
                      value={formData.projectedRevenue}
                      onChange={handleChange}
                      min="0"
                      step="10000"
                      placeholder="1000000"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Core Team Size *</Label>
                    <Input
                      type="number"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="4"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Customer Base</Label>
                    <Input
                      type="number"
                      name="customerBase"
                      value={formData.customerBase}
                      onChange={handleChange}
                      min="0"
                      placeholder="1200"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Monthly Active Users (MAU)</Label>
                    <Input
                      type="number"
                      name="monthlyActiveUsers"
                      value={formData.monthlyActiveUsers}
                      onChange={handleChange}
                      min="0"
                      placeholder="450"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Revenue & Monetization Model</Label>
                    <Textarea
                      name="revenueModel"
                      value={formData.revenueModel}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Subscription tiers, commission per transaction, direct enterprise sales..."
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Allocation of Capital / Use of Funds</Label>
                    <Textarea
                      name="investmentUse"
                      value={formData.investmentUse}
                      onChange={handleChange}
                      rows={3}
                      placeholder="40% product R&D, 35% user acquisition, 25% inventory..."
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Team & Market */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Team & Market Context</h2>
                    <p className="text-xs text-stone-500">Competitive landscape and organizational hiring</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Market Size (TAM / SAM)</Label>
                    <Input
                      type="text"
                      name="marketSize"
                      value={formData.marketSize}
                      onChange={handleChange}
                      placeholder="e.g., $10B TAM, $2.5B SAM across Western India"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Direct Competitors (comma-separated)</Label>
                    <Input
                      type="text"
                      name="competitors"
                      value={formData.competitors}
                      onChange={handleChange}
                      placeholder="Competitor A, Competitor B, Legacy Alternatives"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Competitive Advantage</Label>
                    <Textarea
                      name="competitiveAdvantage"
                      value={formData.competitiveAdvantage}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Why cannot competitors replicate your distribution or product margin?"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Key Achievements & Traction (comma-separated)</Label>
                    <Textarea
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleChange}
                      rows={2}
                      placeholder="State hackathon winner, 100 paid pilot users, MSME registration"
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Priority Hires Needed (comma-separated)</Label>
                    <Input
                      type="text"
                      name="keyHires"
                      value={formData.keyHires}
                      onChange={handleChange}
                      placeholder="Lead Engineer, Growth Marketer, Operations Lead"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Links & Goals */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Channels & Objectives</h2>
                    <p className="text-xs text-stone-500">Contact touchpoints and current platform goals</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Official Email *</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="contact@enterprise.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Phone Number *</Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91-9876543210"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Website URL</Label>
                    <Input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourstartup.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Pitch Deck Link (Drive / DocSend)</Label>
                    <Input
                      type="url"
                      name="pitchDeck"
                      value={formData.pitchDeck}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">LinkedIn Profile / Company Page</Label>
                    <Input
                      type="url"
                      name="linkedIn"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-stone-600">Twitter / X</Label>
                    <Input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/..."
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3 pt-2">
                    <Label className="text-xs font-semibold text-stone-600 block">
                      What are you actively seeking on this platform? *
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {lookingForOptions.map(option => {
                        const isChecked = formData.lookingFor.includes(option);
                        return (
                          <div
                            key={option}
                            onClick={() => handleCheckboxToggle('lookingFor', option)}
                            className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'border-[#8d4624] bg-[#f5e9dd]/40 text-[#8d4624]'
                                : 'border-[#8d4624]/20 hover:border-[#8d4624]/40 text-stone-700'
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleCheckboxToggle('lookingFor', option)}
                              className="border-[#8d4624]/40 data-[state=checked]:bg-[#8d4624] data-[state=checked]:border-[#8d4624]"
                            />
                            <span className="text-xs font-medium">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[#8d4624]/15">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs px-4 gap-1.5"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="text-xs font-medium text-stone-400">
                Step {currentStep} of {steps.length}
              </span>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-5 font-semibold gap-1.5"
                >
                  Continue
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-6 font-semibold gap-2 shadow-xs"
                >
                  <RocketLaunchIcon className="w-4 h-4" />
                  <span>{loading ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update Venture' : 'Launch Venture')}</span>
                </Button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Floating Status Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="startup-toast"
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
    </DashboardLayout>
  );
};

export default CreateStartup;