import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import InvestorSidebar from '../../components/InvestorSidebar';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

const BrowseProjects = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investing, setInvesting] = useState(false);
  const [investmentSuccess, setInvestmentSuccess] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [savingProject, setSavingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);

  const categories = [
    'all',
    'Food Processing',
    'Handicrafts',
    'Beauty & Personal Care',
    'Tailoring & Garments',
    'Health & Wellness',
    'Home Decor',
    'Agriculture & Farming',
    'Catering & Food Services',
    'Retail & E-commerce',
    'Education & Training',
    'Technology',
    'Finance',
    'Other'
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, 'investment-projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Enrich projects with startup info from 'startups' collection when needed
        const enhancedProjects = await Promise.all(
          projectsData.map(async (project) => {
            const startupRefValue = project.startupId;

            // If startup info is already embedded with name/founderName, keep it
            if (
              startupRefValue &&
              typeof startupRefValue === 'object' &&
              (startupRefValue.name || startupRefValue.founderName)
            ) {
              return project;
            }

            // Determine startupId string from either a plain string or an object with _id
            const startupIdString =
              typeof startupRefValue === 'string'
                ? startupRefValue
                : (startupRefValue && typeof startupRefValue === 'object' && startupRefValue._id) || null;

            if (startupIdString) {
              try {
                const startupRef = doc(db, 'startups', startupIdString);
                const startupSnap = await getDoc(startupRef);
                if (startupSnap.exists()) {
                  const startupData = startupSnap.data();
                  return {
                    ...project,
                    startupId: {
                      id: startupIdString,
                      name: startupData.name,
                      founderName: startupData.founderName,
                      industry: startupData.industry,
                      stage: startupData.stage,
                      email: startupData.email,
                    },
                  };
                }
              } catch (err) {
                console.error('Error fetching startup for project', project.id, err);
              }
            }

            return project;
          })
        );

        setProjects(enhancedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    const handleFocus = () => {
      fetchProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const fetchSavedProjects = async () => {
      if (!currentUser?.uid) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setSavedProjects(userDoc.data().savedProjects || []);
        }
      } catch (error) {
        console.error('Error fetching saved projects:', error);
      }
    };

    fetchSavedProjects();
  }, [currentUser]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.startupId?.industry === selectedCategory;
    const isActive = project.status === 'active' || project.status === 'funded';
    return matchesSearch && matchesCategory && isActive;
  });

  const handleInvest = async () => {
    if (!investmentAmount || !selectedProject) return;

    const amount = parseFloat(investmentAmount);

    if (amount < selectedProject.minimumInvestment) {
      alert(`Minimum investment is ₹${selectedProject.minimumInvestment.toLocaleString()}`);
      return;
    }

    if (selectedProject.maximumInvestment && amount > selectedProject.maximumInvestment) {
      alert(`Maximum investment is ₹${selectedProject.maximumInvestment.toLocaleString()}`);
      return;
    }

    const remainingFunding = selectedProject.fundingGoal - selectedProject.currentFunding;
    if (amount > remainingFunding) {
      alert(`Only ₹${remainingFunding.toLocaleString()} remaining. Please invest up to this amount.`);
      return;
    }

    setInvesting(true);

    try {
      const projectRef = doc(db, 'investment-projects', selectedProject.id);
      const newFunding = selectedProject.currentFunding + amount;
      const newFundingPercentage = (newFunding / selectedProject.fundingGoal) * 100;

      // Calculate the investor's equity share for this amount
      const equityPercentage =
        selectedProject.fundingGoal > 0 && selectedProject.equityOffered
          ? (amount / selectedProject.fundingGoal) * selectedProject.equityOffered
          : 0;

      const newInvestorEntry = {
        investorId: currentUser.uid,
        investorName: currentUser.displayName || currentUser.email,
        amount: amount,
        equityPercentage,
        date: new Date(),
      };

      // Compute unique investor count so the same investor is only counted once per startup
      const existingInvestors = Array.isArray(selectedProject.investors)
        ? selectedProject.investors
        : [];
      const uniqueInvestorIds = new Set([
        ...existingInvestors.map(inv => inv.investorId),
        currentUser.uid,
      ]);
      const newTotalInvestors = uniqueInvestorIds.size;

      await updateDoc(projectRef, {
        currentFunding: newFunding,
        fundingPercentage: newFundingPercentage,
        investors: arrayUnion(newInvestorEntry),
        totalInvestors: newTotalInvestors,
      });

      setInvestmentSuccess(true);

      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === selectedProject.id
            ? {
                ...p,
                currentFunding: newFunding,
                fundingPercentage: newFundingPercentage,
                totalInvestors: newTotalInvestors,
                investors: [...existingInvestors, newInvestorEntry],
              }
            : p
        )
      );

      setSelectedProject(prev =>
        prev
          ? {
              ...prev,
              currentFunding: newFunding,
              fundingPercentage: newFundingPercentage,
              totalInvestors: newTotalInvestors,
              investors: [...existingInvestors, newInvestorEntry],
            }
          : prev
      );

      setTimeout(() => {
        setSelectedProject(null);
        setInvestmentAmount('');
        setInvestmentSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error investing:', error);
      alert('Failed to process investment');
    } finally {
      setInvesting(false);
    }
  };

  const handleSaveProject = async (projectId, e) => {
    e.stopPropagation();
    if (!currentUser?.uid) return;
    setSavingProject(projectId);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const isSaved = savedProjects.includes(projectId);

      if (isSaved) {
        await updateDoc(userRef, {
          savedProjects: arrayRemove(projectId)
        });
        setSavedProjects(prev => prev.filter(id => id !== projectId));
      } else {
        await updateDoc(userRef, {
          savedProjects: arrayUnion(projectId)
        });
        setSavedProjects(prev => [...prev, projectId]);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setSavingProject(null);
    }
  };

  const sidebar = useMemo(() => <InvestorSidebar />, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investment opportunities...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Opportunities</h1>
        <p className="text-gray-600">Discover and invest in innovative women-led startups</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for projects, founders, or ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-700">Filter by Industry</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-pink-400 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Industries' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {filteredProjects.length} Investment {filteredProjects.length === 1 ? 'Opportunity' : 'Opportunities'}
        </h3>
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              {projects.length === 0 
                ? "No projects are currently seeking investment."
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const remainingFunding = project.fundingGoal - project.currentFunding;
              const remainingDays = Math.ceil((new Date(project.fundingDeadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {project.projectName
                          || project.startupId?.name
                          || project.name
                          || project.startupId?.tagline
                          || 'Untitled Project'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        by {
                          project.startupId?.founderName
                          || project.startupId?.name
                          || `${project.startupId?.firstName || ''} ${project.startupId?.lastName || ''}`.trim()
                          || project.startupId?.ownerName
                          || project.startupId?.email
                          || 'Entrepreneur'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleSaveProject(project.id, e)}
                        disabled={savingProject === project.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={savedProjects.includes(project.id) ? 'Unsave project' : 'Save project'}
                      >
                        {savedProjects.includes(project.id) ? (
                          <BookmarkSolidIcon className="w-6 h-6 text-pink-500" />
                        ) : (
                          <BookmarkIcon className="w-6 h-6 text-gray-400 hover:text-pink-500" />
                        )}
                      </button>
                      <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                        <UsersIcon className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">{project.totalInvestors || 0}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.projectDescription}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Funding Goal</span>
                      <span className="font-semibold text-gray-900">₹{project.fundingGoal?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-linear-to-r from-pink-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(Math.min(project.fundingPercentage || 0, 100), project.currentFunding > 0 ? 2 : 0)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Raised ({Math.round(project.fundingPercentage || 0)}%)</span>
                      <span className="font-semibold text-green-600">₹{project.currentFunding?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-gray-900">₹{remainingFunding?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Min. Investment</span>
                        <p className="font-semibold text-gray-900">₹{project.minimumInvestment?.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Equity Offered</span>
                        <p className="font-semibold text-gray-900">{project.equityOffered}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Valuation</span>
                        <p className="font-semibold text-gray-900">₹{(project.valuationAmount / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Days Left</span>
                        <p className="font-semibold text-gray-900">{remainingDays > 0 ? remainingDays : 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {project.startupId?.stage || 'Growth'}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {project.startupId?.industry || 'Tech'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setViewingProject(project)}
                    className={`px-4 py-2  text-white text-sm font-medium rounded-lg hover:shadow-md transition-all ${primaryButtonClass}`}
                      >
                        {/* <EyeIcon className="w-4 h-4" /> */}
                        View Details
                      </button>
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="px-4 py-2 bg-linear-to-r from-primary to-accent text-gray-800 text-sm font-medium rounded-lg hover:shadow-md transition-all"
                      >
                        Invest Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Investment Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !investing && setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
              {investmentSuccess ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Successful!</h2>
                  <p className="text-gray-600">Your investment has been processed successfully.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Invest in {selectedProject.projectName}</h2>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={investing}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Project Details</h3>
                      <p className="text-sm text-gray-600 mb-3">{selectedProject.projectDescription}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Funding Goal</span>
                          <p className="font-semibold text-gray-900">₹{selectedProject.fundingGoal?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Already Raised</span>
                          <p className="font-semibold text-green-600">₹{selectedProject.currentFunding?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Remaining</span>
                          <p className="font-semibold text-gray-900">₹{(selectedProject.fundingGoal - selectedProject.currentFunding)?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress</span>
                          <p className="font-semibold text-gray-900">{Math.round(selectedProject.fundingPercentage || 0)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Investment Terms</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Minimum Investment</span>
                          <p className="font-semibold text-gray-900">₹{selectedProject.minimumInvestment?.toLocaleString()}</p>
                        </div>
                        {selectedProject.maximumInvestment && (
                          <div>
                            <span className="text-gray-500">Maximum Investment</span>
                            <p className="font-semibold text-gray-900">₹{selectedProject.maximumInvestment?.toLocaleString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Total Equity Offered</span>
                          <p className="font-semibold text-gray-900">{selectedProject.equityOffered}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Company Valuation</span>
                          <p className="font-semibold text-gray-900">₹{(selectedProject.valuationAmount / 10000000).toFixed(2)} Cr</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount (₹) *
                      </label>
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        placeholder={`Min: ₹${selectedProject.minimumInvestment?.toLocaleString()}`}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        disabled={investing}
                      />
                      {investmentAmount && (
                        <p className="text-sm text-gray-600 mt-2">
                          You will receive approximately {((parseFloat(investmentAmount) / selectedProject.fundingGoal) * selectedProject.equityOffered).toFixed(4)}% equity
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setSelectedProject(null)}
                      disabled={investing}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInvest}
                      disabled={investing || !investmentAmount}
                      className="flex-1 px-6 py-3 bg-pink-400 text-gray-800 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {investing ? 'Processing...' : 'Confirm Investment'}
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
      )}
      
      {/* Detailed Project View Modal */}
      {viewingProject && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto border-pink-50"
          onClick={() => setViewingProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
          >
              {/* Header */}
              <div className="sticky top-0 bg-pink-400 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{viewingProject.projectName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white text-pink-600 text-sm font-semibold rounded-full">
                      {viewingProject.startupId?.industry}
                    </span>
                    <span className="px-3 py-1 bg-white text-purple-600 text-sm font-semibold rounded-full">
                      {viewingProject.startupId?.stage}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingProject(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Investment Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Investment Overview
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Funding Goal</label>
                        <p className="text-xl font-bold text-gray-900">₹{viewingProject.fundingGoal?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Current Funding</label>
                        <p className="text-xl font-bold text-green-600">₹{viewingProject.currentFunding?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Remaining</label>
                        <p className="text-xl font-bold text-gray-900">₹{(viewingProject.fundingGoal - viewingProject.currentFunding)?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-linear-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(viewingProject.fundingPercentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Min. Investment</label>
                        <p className="font-semibold text-gray-900">₹{viewingProject.minimumInvestment?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Equity Offered</label>
                        <p className="font-semibold text-gray-900">{viewingProject.equityOffered}%</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Valuation</label>
                        <p className="font-semibold text-gray-900">₹{(viewingProject.valuationAmount / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Investors</label>
                        <p className="font-semibold text-gray-900">{viewingProject.totalInvestors || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Basic Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {viewingProject.startupId?.founderName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Founder Name</label>
                        <p className="text-gray-900">{viewingProject.startupId.founderName}</p>
                      </div>
                    )}
                    {viewingProject.startupId?.tagline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tagline</label>
                        <p className="text-gray-900">{viewingProject.startupId.tagline}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{viewingProject.projectDescription}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {viewingProject.startupId?.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Location</label>
                          <p className="text-gray-900">{viewingProject.startupId.location}</p>
                        </div>
                      )}
                      {viewingProject.startupId?.foundedDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Founded Date</label>
                          <p className="text-gray-900">
                            {new Date(viewingProject.startupId.foundedDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(viewingProject.startupId?.email || viewingProject.startupId?.phone) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Contact Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-2 gap-3">
                      {viewingProject.startupId?.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <a href={`mailto:${viewingProject.startupId.email}`} className="text-blue-600 hover:underline">
                            {viewingProject.startupId.email}
                          </a>
                        </div>
                      )}
                      {viewingProject.startupId?.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <a href={`tel:${viewingProject.startupId.phone}`} className="text-blue-600 hover:underline">
                            {viewingProject.startupId.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Problem & Solution */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Problem & Solution
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {(viewingProject.problemStatement || viewingProject.startupId?.problemStatement) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Problem Statement</label>
                        <p className="text-gray-900">{viewingProject.problemStatement || viewingProject.startupId?.problemStatement}</p>
                      </div>
                    )}
                    {(viewingProject.solution || viewingProject.startupId?.solution) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Solution</label>
                        <p className="text-gray-900">{viewingProject.solution || viewingProject.startupId?.solution}</p>
                      </div>
                    )}
                    {(viewingProject.targetMarket || viewingProject.startupId?.targetMarket) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Target Market</label>
                        <p className="text-gray-900">{viewingProject.targetMarket || viewingProject.startupId?.targetMarket}</p>
                      </div>
                    )}
                    {(viewingProject.uniqueSellingPoint || viewingProject.startupId?.uniqueSellingPoint) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Unique Selling Point</label>
                        <p className="text-gray-900">{viewingProject.uniqueSellingPoint || viewingProject.startupId?.uniqueSellingPoint}</p>
                      </div>
                    )}
                    {(viewingProject.valueProposition || viewingProject.startupId?.valueProposition) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Value Proposition</label>
                        <p className="text-gray-900">{viewingProject.valueProposition || viewingProject.startupId?.valueProposition}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Information */}
                {(viewingProject.startupId?.features || viewingProject.startupId?.technology) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Product Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {viewingProject.startupId?.features && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Features</label>
                          <p className="text-gray-900">
                            {Array.isArray(viewingProject.startupId.features)
                              ? viewingProject.startupId.features.join(', ')
                              : viewingProject.startupId.features}
                          </p>
                        </div>
                      )}
                      {viewingProject.startupId?.technology && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Technology Stack</label>
                          <p className="text-gray-900">
                            {Array.isArray(viewingProject.startupId.technology)
                              ? viewingProject.startupId.technology.join(', ')
                              : viewingProject.startupId.technology}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Financial Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {(viewingProject.currentRevenue !== undefined || viewingProject.startupId?.currentRevenue !== undefined) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Current Revenue</label>
                          <p className="text-gray-900">₹{(viewingProject.currentRevenue ?? viewingProject.startupId?.currentRevenue)?.toLocaleString()}</p>
                        </div>
                      )}
                      {(viewingProject.projectedRevenue || viewingProject.startupId?.projectedRevenue) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Projected Revenue</label>
                          <p className="text-gray-900">₹{(viewingProject.projectedRevenue || viewingProject.startupId?.projectedRevenue)?.toLocaleString()}</p>
                        </div>
                      )}
                      {(viewingProject.revenueModel || viewingProject.startupId?.revenueModel) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Revenue Model</label>
                          <p className="text-gray-900">{viewingProject.revenueModel || viewingProject.startupId?.revenueModel}</p>
                        </div>
                      )}
                      {(viewingProject.businessModel || viewingProject.startupId?.businessModel) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Business Model</label>
                          <p className="text-gray-900">{viewingProject.businessModel || viewingProject.startupId?.businessModel}</p>
                        </div>
                      )}
                    </div>
                    {(viewingProject.investmentUse || viewingProject.startupId?.investmentUse) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">How Funds Will Be Used</label>
                        <p className="text-gray-900">{viewingProject.investmentUse || viewingProject.startupId?.investmentUse}</p>
                      </div>
                    )}
                    {(viewingProject.pricingStrategy || viewingProject.startupId?.pricingStrategy) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Pricing Strategy</label>
                        <p className="text-gray-900">{viewingProject.pricingStrategy || viewingProject.startupId?.pricingStrategy}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Information */}
                {(viewingProject.startupId?.teamSize || viewingProject.startupId?.keyHires) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Team Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {viewingProject.startupId?.teamSize && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Team Size</label>
                          <p className="text-gray-900">{viewingProject.startupId.teamSize} members</p>
                        </div>
                      )}
                      {viewingProject.startupId?.keyHires && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Team Members</label>
                          <p className="text-gray-900">
                            {Array.isArray(viewingProject.startupId.keyHires)
                              ? viewingProject.startupId.keyHires.join(', ')
                              : viewingProject.startupId.keyHires}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Market & Traction */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Market & Traction
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {(viewingProject.marketSize || viewingProject.startupId?.marketSize) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Market Size</label>
                          <p className="text-gray-900">{viewingProject.marketSize || viewingProject.startupId?.marketSize}</p>
                        </div>
                      )}
                      {(viewingProject.customerBase !== undefined || viewingProject.startupId?.customerBase !== undefined) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Base</label>
                          <p className="text-gray-900">{(viewingProject.customerBase ?? viewingProject.startupId?.customerBase)?.toLocaleString()} customers</p>
                        </div>
                      )}
                      {(viewingProject.monthlyActiveUsers !== undefined || viewingProject.startupId?.monthlyActiveUsers !== undefined) && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Monthly Active Users</label>
                          <p className="text-gray-900">{(viewingProject.monthlyActiveUsers ?? viewingProject.startupId?.monthlyActiveUsers)?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {(viewingProject.competitors || viewingProject.startupId?.competitors) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Competitors</label>
                        <p className="text-gray-900">
                          {Array.isArray(viewingProject.competitors || viewingProject.startupId?.competitors)
                            ? (viewingProject.competitors || viewingProject.startupId?.competitors).join(', ')
                            : (viewingProject.competitors || viewingProject.startupId?.competitors)}
                        </p>
                      </div>
                    )}
                    {(viewingProject.competitiveAdvantage || viewingProject.startupId?.competitiveAdvantage) && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Competitive Advantage</label>
                        <p className="text-gray-900">{viewingProject.competitiveAdvantage || viewingProject.startupId?.competitiveAdvantage}</p>
                      </div>
                    )}
                    {viewingProject.startupId?.achievements && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Achievements</label>
                        <p className="text-gray-900">
                          {Array.isArray(viewingProject.startupId.achievements)
                            ? viewingProject.startupId.achievements.join(', ')
                            : viewingProject.startupId.achievements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links & Resources */}
                {(viewingProject.startupId?.website || viewingProject.startupId?.pitchDeck || viewingProject.startupId?.socialMedia) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Links & Resources
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {viewingProject.startupId?.website && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Website</label>
                          <a 
                            href={viewingProject.startupId.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {viewingProject.startupId.website}
                          </a>
                        </div>
                      )}
                      {viewingProject.startupId?.pitchDeck && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Pitch Deck</label>
                          <a 
                            href={viewingProject.startupId.pitchDeck} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Pitch Deck
                          </a>
                        </div>
                      )}
                      {viewingProject.startupId?.socialMedia && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {viewingProject.startupId.socialMedia.linkedIn && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                              <a 
                                href={viewingProject.startupId.socialMedia.linkedIn} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {viewingProject.startupId.socialMedia.twitter && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Twitter</label>
                              <a 
                                href={viewingProject.startupId.socialMedia.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Twitter Profile
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* What We're Looking For */}
                {viewingProject.startupId?.lookingFor && viewingProject.startupId.lookingFor.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      What We're Looking For
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {viewingProject.startupId.lookingFor.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setViewingProject(null);
                      setSelectedProject(viewingProject);
                    }}
                    className={`px-4 py-2  text-white text-sm font-medium rounded-lg hover:shadow-md transition-all ${primaryButtonClass}`}
                  >
                    Invest in This Project
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProject(viewingProject._id, e);
                    }}
                    className="px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-all font-medium flex items-center gap-2"
                  >
                    {savedProjects.includes(viewingProject._id) ? (
                      <>
                        <BookmarkSolidIcon className="w-5 h-5" />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkIcon className="w-5 h-5" />
                        Save Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </DashboardLayout>
  );
};

export default BrowseProjects;
