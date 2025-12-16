import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import InvestorSidebar from '../../components/InvestorSidebar';
import { db } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Load all investment projects and filter by investorId client-side,
        // because investors is an array of objects, not plain IDs
        const projectsQuery = query(collection(db, 'investment-projects'));
        const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
          const allProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const myInvestments = [];
          let totalInv = 0;
          let totalEq = 0;
          const portfolioCompanies = new Set();
          const uniqueProjects = new Set();

          allProjects.forEach(project => {
            const investorData = project.investors?.filter(inv => inv.investorId === currentUser.uid) || [];
            
            if (investorData.length > 0) {
              uniqueProjects.add(project.id);
              portfolioCompanies.add(project.startupId);
            }
            
            investorData.forEach(investment => {
              const investmentAmount = investment.amount;
              const equityPercent = Number(investment.equityPercentage) || 0;
              
              let growthRate = 0;
              if (project.fundingPercentage >= 80) {
                growthRate = 0.15 + (Math.random() * 0.15);
              } else if (project.fundingPercentage >= 50) {
                growthRate = 0.08 + (Math.random() * 0.12);
              } else {
                growthRate = 0.03 + (Math.random() * 0.07);
              }
              
              const currentProjectValue = investmentAmount * (1 + growthRate);
              const estimatedReturn = currentProjectValue - investmentAmount;
              
              totalInv += investmentAmount;
              totalEq += equityPercent;

              myInvestments.push({
                investmentId: investment.id,
                projectId: project.id,
                projectName: project.projectName,
                startupName: project.startupId?.name || 'Unnamed Startup',
                industry: project.startupId?.industry || 'Other',
                stage: project.startupId?.stage || 'Growth',
                investedAmount: investmentAmount,
                equityPercentage: equityPercent,
                investmentDate: investment.date.toDate(),
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

          myInvestments.sort((a, b) => b.investmentDate - a.investmentDate);
          setInvestments(myInvestments);

          const totalReturns = myInvestments.reduce((sum, inv) => sum + inv.estimatedReturn, 0);
          const portfolioValue = totalInv + totalReturns;
          const totalTransactions = myInvestments.length;

          setStats({
            totalInvested: totalInv,
            totalEquity: totalEq,
            portfolioValue: portfolioValue,
            totalReturns: totalReturns,
            activeProjects: uniqueProjects.size,
            totalTransactions: totalTransactions,
            avgInvestment: totalTransactions > 0 ? totalInv / totalTransactions : 0
          });

          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setLoading(false);
      }
    };

    fetchPortfolio();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
        <p className="text-gray-600">Track your investments and returns across all projects</p>
      </div>

      {/* Stats Overview - Only key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <BanknotesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.totalInvested).toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Invested</div>
        </div>

        <div className="bg-linear-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <ChartPieIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{(Number(stats.totalEquity) || 0).toFixed(2)}%</div>
          <div className="text-sm opacity-90">Total Equity</div>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <BriefcaseIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.activeProjects}</div>
          <div className="text-sm opacity-90">Active Projects</div>
        </div>
      </div>

      {/* Portfolio Distribution Chart */}
      {investments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Distribution</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* By Amount */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">By Investment Amount</h3>
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv, idx) => {
                  const amt = Number(inv.investedAmount) || 0;
                  const totalInv = Number(stats.totalInvested) || 0;
                  const pct = totalInv > 0 ? (amt / totalInv) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{inv.projectName}</span>
                        <span className="font-semibold text-gray-900">₹{amt.toLocaleString()}</span>
                      </div>
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-linear-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Equity */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">By Equity Ownership</h3>
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv, idx) => {
                  const eq = Number(inv.equityPercentage) || 0;
                  const totalEq = Number(stats.totalEquity) || 0;
                  const pct = totalEq > 0 ? (eq / totalEq) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">{inv.projectName}</span>
                        <span className="font-semibold text-gray-900">{eq.toFixed(2)}%</span>
                      </div>
                      <div
                        style={{ width: `${pct}%` }}
                        className="bg-linear-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
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
            {investments.map((investment) => (
              <div key={investment.investmentId} onClick={() => setSelectedInvestment(investment)} className="p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-gray-200">
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
                    <span className="font-semibold text-purple-600">
                      {(Number(investment.equityPercentage) || 0).toFixed(2)}%
                    </span>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <div onClick={() => setSelectedInvestment(null)} className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-pink-400 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
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
            <div className="p-6">
              {/* Investment Overview */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">Invested Amount</span>
                    <BanknotesIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">₹{selectedInvestment.investedAmount.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 font-medium">Current Value</span>
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">₹{Math.round(selectedInvestment.currentValue).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-600 font-medium">Equity Owned</span>
                    <ChartPieIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {(Number(selectedInvestment.equityPercentage) || 0).toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-600 font-medium">ROI</span>
                    <TrophyIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className={`text-2xl font-bold ${selectedInvestment.roi >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {selectedInvestment.roi >= 0 ? '+' : ''}{selectedInvestment.roi.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Investment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Investment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Investment Date</span>
                    <p className="font-medium text-gray-900">{new Date(selectedInvestment.investmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <p className="font-medium text-green-600 capitalize">{selectedInvestment.status}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Industry</span>
                    <p className="font-medium text-gray-900">{selectedInvestment.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Stage</span>
                    <p className="font-medium text-gray-900">{selectedInvestment.stage}</p>
                  </div>
                </div>

                {/* Funding Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Funding Progress</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(selectedInvestment.fundingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-linear-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(selectedInvestment.fundingProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>₹{selectedInvestment.currentFunding?.toLocaleString() || 0}</span>
                    <span>₹{selectedInvestment.fundingGoal?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Returns Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Returns Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estimated Return</span>
                      <span className={`font-semibold ${selectedInvestment.estimatedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.round(selectedInvestment.estimatedReturn).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Investors</span>
                      <span className="font-semibold text-gray-900">{selectedInvestment.totalInvestors}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Portfolio;