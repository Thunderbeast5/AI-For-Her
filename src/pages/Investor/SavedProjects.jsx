import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import InvestorSidebar from '../../components/InvestorSidebar';
import { 
  BookmarkIcon,
  StarIcon,
  MapPinIcon,
  TrashIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';

const SavedProjects = () => {
  const { currentUser } = useAuth();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState(null);

  useEffect(() => {
    const fetchSavedProjects = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/investors/${userId}/saved-projects`);
        if (response.ok) {
          const data = await response.json();
          console.log('📚 Fetched saved projects:', data);
          setSavedProjects(data);
        }
      } catch (error) {
        console.error('Error fetching saved projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProjects();

    // Re-fetch when window gains focus (user returns to page)
    const handleFocus = () => {
      fetchSavedProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleUnsaveProject = async (projectId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(
        `http://localhost:5000/api/investors/${userId}/save-project/${projectId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setSavedProjects(prev => prev.filter(p => p._id !== projectId));
      }
    } catch (error) {
      console.error('Error unsaving project:', error);
      alert('Failed to remove project');
    }
  };

  const sidebar = useMemo(() => <InvestorSidebar />, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading saved projects...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Projects</h1>
        <p className="text-gray-600">Projects you're interested in</p>
      </motion.div>

      {savedProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {savedProjects.map((project, index) => {
            const remainingFunding = project.fundingGoal - project.currentFunding;
            const daysLeft = Math.ceil((new Date(project.fundingDeadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.projectName}</h3>
                    <p className="text-sm text-gray-600">by {project.startupId?.founderName || 'Entrepreneur'}</p>
                  </div>
                  <button
                    onClick={() => handleUnsaveProject(project._id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Remove from saved"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.projectDescription}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Funding Goal</span>
                    <span className="font-semibold text-gray-900">₹{project.fundingGoal?.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(Math.min(project.fundingPercentage || 0, 100), project.currentFunding > 0 ? 2 : 0)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Raised ({Math.round(project.fundingPercentage || 0)}%)</span>
                    <span className="font-semibold text-green-600">₹{project.currentFunding?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <CurrencyRupeeIcon className="w-3 h-3" />
                        Min. Investment
                      </span>
                      <p className="font-semibold text-gray-900">₹{project.minimumInvestment?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Days Left
                      </span>
                      <p className="font-semibold text-gray-900">{daysLeft > 0 ? daysLeft : 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Equity Offered</span>
                      <p className="font-semibold text-gray-900">{project.equityOffered}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        Investors
                      </span>
                      <p className="font-semibold text-gray-900">{project.totalInvestors || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {project.startupId?.stage || 'Growth'}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {project.startupId?.industry || 'Tech'}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingProject(project)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 shadow-sm text-center"
        >
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Projects</h3>
          <p className="text-gray-600 mb-6">Start saving projects you're interested in</p>
          <button 
            onClick={() => window.location.href = '/investor/browse-projects'}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-md transition-colors"
          >
            Browse Projects
          </button>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {viewingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingProject(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
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
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
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
                    Project Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{viewingProject.projectDescription}</p>
                    </div>
                    {viewingProject.fundingPurpose && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Funding Purpose</label>
                        <p className="text-gray-900">{viewingProject.fundingPurpose}</p>
                      </div>
                    )}
                    {viewingProject.revenueModel && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Revenue Model</label>
                        <p className="text-gray-900">{viewingProject.revenueModel}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financials */}
                {(viewingProject.currentRevenue || viewingProject.projectedRevenue) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Financials
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-2 gap-3">
                      {viewingProject.currentRevenue > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Current Revenue</label>
                          <p className="text-gray-900">₹{viewingProject.currentRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {viewingProject.projectedRevenue > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Projected Revenue</label>
                          <p className="text-gray-900">₹{viewingProject.projectedRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {viewingProject.monthlyBurnRate > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Monthly Burn Rate</label>
                          <p className="text-gray-900">₹{viewingProject.monthlyBurnRate?.toLocaleString()}</p>
                        </div>
                      )}
                      {viewingProject.customerBase > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Base</label>
                          <p className="text-gray-900">{viewingProject.customerBase?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Team */}
                {(viewingProject.keyTeamMembers?.length > 0 || viewingProject.teamSize) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Team
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {viewingProject.teamSize && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Team Size</label>
                          <p className="text-gray-900">{viewingProject.teamSize} members</p>
                        </div>
                      )}
                      {viewingProject.keyTeamMembers?.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Team Members</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {viewingProject.keyTeamMembers.map((member, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border">
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Market */}
                {(viewingProject.marketSize || viewingProject.competitiveAdvantage) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-pink-500 rounded"></div>
                      Market & Competition
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {viewingProject.marketSize && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Market Size</label>
                          <p className="text-gray-900">{viewingProject.marketSize}</p>
                        </div>
                      )}
                      {viewingProject.competitiveAdvantage && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Competitive Advantage</label>
                          <p className="text-gray-900">{viewingProject.competitiveAdvantage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setViewingProject(null);
                      window.location.href = '/investor/browse-projects';
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    Invest Now
                  </button>
                  <button
                    onClick={() => setViewingProject(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SavedProjects;
