import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import InvestorSidebar from '../../components/InvestorSidebar';
import { API_BASE_URL } from '../../api';
import { 
  BriefcaseIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  ClockIcon,
  XMarkIcon,
  ChartPieIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const Portfolio = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalEquity: 0,
    portfolioValue: 0,
    totalReturns: 0,
    activeProjects: 0,
    totalTransactions: 0,
    avgInvestment: 0
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch all investment projects
        const response = await fetch(`${API_BASE_URL}/investment-projects`);
        const allProjects = await response.json();

        // Filter investments by this investor
        const myInvestments = [];
        let totalInv = 0;
        let totalEq = 0;
        const portfolioCompanies = new Set();
        const uniqueProjects = new Set();

        allProjects.forEach(project => {
          const investorData = project.investors?.filter(inv => inv.investorId === userId) || [];
          
          if (investorData.length > 0) {
            // Track unique projects
            uniqueProjects.add(project._id);
            portfolioCompanies.add(project.startupId?._id || project.startupId);
          }
          
          investorData.forEach(investment => {
            const investmentAmount = investment.amount;
            const equityPercent = investment.equityPercentage;
            
            // Calculate estimated returns based on project performance and stage
            const fundingProgress = project.fundingPercentage || 0;
            
            // Simulate realistic growth based on project maturity
            let growthRate = 0;
            if (fundingProgress >= 80) {
              growthRate = 0.15 + (Math.random() * 0.15); // 15-30% for well-funded projects
            } else if (fundingProgress >= 50) {
              growthRate = 0.08 + (Math.random() * 0.12); // 8-20% for moderately funded
            } else {
              growthRate = 0.03 + (Math.random() * 0.07); // 3-10% for early stage
            }
            
            const currentProjectValue = investmentAmount * (1 + growthRate);
            const estimatedReturn = currentProjectValue - investmentAmount;
            
            totalInv += investmentAmount;
            totalEq += equityPercent;

            myInvestments.push({
              investmentId: investment._id,
              projectId: project._id,
              projectName: project.projectName,
              startupName: project.startupId?.name || 'Unnamed Startup',
              industry: project.startupId?.industry || 'Other',
              stage: project.startupId?.stage || 'Growth',
              investedAmount: investmentAmount,
              equityPercentage: equityPercent,
              investmentDate: investment.investmentDate,
              status: investment.status || 'confirmed',
              fundingProgress: project.fundingPercentage || 0,
              currentValue: currentProjectValue,
              estimatedReturn: estimatedReturn,
              roi: investmentAmount > 0 ? ((estimatedReturn / investmentAmount) * 100) : 0,
              totalInvestors: project.totalInvestors || 0,
              fundingGoal: project.fundingGoal,
              currentFunding: project.currentFunding
            });
          });
        });

        // Sort by investment date (most recent first)
        myInvestments.sort((a, b) => new Date(b.investmentDate) - new Date(a.investmentDate));
        setInvestments(myInvestments);

        const totalReturns = myInvestments.reduce((sum, inv) => sum + inv.estimatedReturn, 0);
        const portfolioValue = totalInv + totalReturns;
        const totalTransactions = myInvestments.length;

        setStats({
          totalInvested: totalInv,
          totalEquity: totalEq,
          portfolioValue: portfolioValue,
          totalReturns: totalReturns,
          activeProjects: uniqueProjects.size, // Count unique projects, not transactions
          totalTransactions: totalTransactions, // Total number of investment transactions
          avgInvestment: totalTransactions > 0 ? totalInv / totalTransactions : 0
        });

      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();

    // Refresh on focus
    const handleFocus = () => fetchPortfolio();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser]);

  const sidebar = useMemo(() => <InvestorSidebar />, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
        <p className="text-gray-600">Track your investments and returns across all projects</p>
      </motion.div>

      {/* Stats Overview - 6 Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
        >
          <BanknotesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.totalInvested).toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Invested</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
        >
          <ChartBarIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.portfolioValue).toLocaleString()}</div>
          <div className="text-sm opacity-90">Portfolio Value</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg"
        >
          <ArrowTrendingUpIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.totalReturns).toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Returns</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
        >
          <ChartPieIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.totalEquity.toFixed(2)}%</div>
          <div className="text-sm opacity-90">Total Equity</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
        >
          <BriefcaseIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <div className="text-sm opacity-90">Active Projects</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg"
        >
          <TrophyIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">
            {stats.totalInvested > 0 ? `+${((stats.totalReturns / stats.totalInvested) * 100).toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm opacity-90">ROI</div>
        </motion.div>
      </motion.div>

      {/* Portfolio Distribution Chart */}
      {investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Distribution</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* By Amount */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">By Investment Amount</h3>
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{inv.projectName}</span>
                      <span className="font-semibold text-gray-900">₹{inv.investedAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(inv.investedAmount / stats.totalInvested) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Equity */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">By Equity Ownership</h3>
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{inv.projectName}</span>
                      <span className="font-semibold text-gray-900">{inv.equityPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(inv.equityPercentage / stats.totalEquity) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Investment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Investments</h2>
          <span className="text-sm text-gray-600">{investments.length} investments</span>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No investments yet</p>
            <p className="text-sm text-gray-500">Start investing in startups to build your portfolio</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {investments.map((investment, index) => (
              <motion.div
                key={investment.investmentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => setSelectedInvestment(investment)}
                className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{investment.projectName}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {investment.industry}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {investment.stage}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    investment.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {investment.roi >= 0 ? '+' : ''}{investment.roi.toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Invested</span>
                    <span className="font-semibold text-gray-900">₹{investment.investedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Value</span>
                    <span className="font-semibold text-green-600">₹{Math.round(investment.currentValue).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Equity</span>
                    <span className="font-semibold text-purple-600">{investment.equityPercentage.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(investment.investmentDate).toLocaleDateString('en-IN')}
                  </span>
                  <span className="text-gray-600">
                    Funding: {Math.round(investment.fundingProgress)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Investment Detail Modal */}
      <AnimatePresence>
        {selectedInvestment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInvestment(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedInvestment.projectName}</h2>
                  <p className="text-sm opacity-90">{selectedInvestment.startupName}</p>
                </div>
                <button
                  onClick={() => setSelectedInvestment(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Investment Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Investment Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Amount Invested</p>
                      <p className="text-2xl font-bold text-gray-900">₹{selectedInvestment.investedAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Equity Owned</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedInvestment.equityPercentage.toFixed(2)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Current Value</p>
                      <p className="text-2xl font-bold text-green-600">₹{Math.round(selectedInvestment.currentValue).toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Estimated Return</p>
                      <p className={`text-2xl font-bold ${selectedInvestment.estimatedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedInvestment.estimatedReturn >= 0 ? '+' : ''}₹{Math.round(selectedInvestment.estimatedReturn).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Project Progress
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Funding Goal</span>
                      <span className="font-semibold text-gray-900">₹{selectedInvestment.fundingGoal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(selectedInvestment.fundingProgress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Funding ({Math.round(selectedInvestment.fundingProgress)}%)</span>
                      <span className="font-semibold text-green-600">₹{selectedInvestment.currentFunding.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Investors</span>
                        <span className="font-semibold text-gray-900">{selectedInvestment.totalInvestors}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Investment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Investment Date</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedInvestment.investmentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {selectedInvestment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Industry</span>
                      <span className="font-medium text-gray-900">{selectedInvestment.industry}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Stage</span>
                      <span className="font-medium text-gray-900">{selectedInvestment.stage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Portfolio;
