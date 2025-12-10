import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout'
import InvestorSidebar from '../../components/InvestorSidebar'
import { 
  BanknotesIcon,
  ChartBarIcon,
  BookmarkIcon,
  ArrowTrendingUpIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';

const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';

const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

const InvestorDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    savedProjects: 0,
    portfolioCompanies: 0,
    totalReturns: 0,
    averageEquity: 0
  })
  const [recentInvestments, setRecentInvestments] = useState([])
  const [trendingProjects, setTrendingProjects] = useState([])
  const [investorProfile, setInvestorProfile] = useState(null);

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    if (!investorProfile) return 0

    const fields = [
      investorProfile.firstName,
      investorProfile.lastName,
      investorProfile.email,
      investorProfile.phone,
      investorProfile.bio,
      investorProfile.firm,
      investorProfile.address?.city,
      investorProfile.address?.state,
      investorProfile.address?.country,
      investorProfile.investmentAreas?.length > 0,
      investorProfile.investmentRange?.min,
      investorProfile.investmentRange?.max,
      investorProfile.investmentStage?.length > 0,
      investorProfile.socialMedia?.linkedIn
    ]

    const filledFields = fields.filter(field => field).length
    return Math.round((filledFields / fields.length) * 100)
  }, [investorProfile])

  const isProfileComplete = profileCompletion >= 100

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch investor profile
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setInvestorProfile(profileSnap.data());
        }

        // Fetch all investment projects
        const projectsQuery = query(collection(db, 'investment-projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let totalInvested = 0;
        let totalEquity = 0;
        let investmentCount = 0;
        let portfolioCompanies = new Set();
        let totalReturns = 0;
        const myInvestments = [];

        allProjects.forEach(project => {
          const myInvestmentsInProject = project.investors?.filter(inv => inv.investorId === currentUser.uid) || [];
          
          myInvestmentsInProject.forEach(investment => {
            const investmentAmount = investment.amount;
            const equityPercent = investment.equityPercentage;
            
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
            
            totalInvested += investmentAmount;
            totalEquity += equityPercent;
            totalReturns += estimatedReturn;
            investmentCount++;
            portfolioCompanies.add(project.startupId);
            
            myInvestments.push({
              ...project,
              myAmount: investmentAmount,
              myEquity: equityPercent,
              investmentDate: investment.date.toDate(),
            });
          });
        });

        myInvestments.sort((a, b) => b.investmentDate - a.investmentDate);
        // Show only the two most recent investments on the dashboard
        setRecentInvestments(myInvestments.slice(0, 2));

        const trending = allProjects
          .filter(p => p.status === 'active')
          .sort((a, b) => (b.fundingPercentage || 0) - (a.fundingPercentage || 0))
          .slice(0, 4);
        setTrendingProjects(trending);

        const savedProjects = investorProfile?.savedProjects || [];

        const avgEquity = investmentCount > 0 ? totalEquity / investmentCount : 0;

        setStats({
          totalInvested,
          activeInvestments: investmentCount,
          savedProjects: savedProjects.length,
          portfolioCompanies: portfolioCompanies.size,
          totalReturns: totalReturns,
          averageEquity: avgEquity,
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser, investorProfile]);

  // Memoize sidebar to prevent re-rendering on state changes
  const sidebar = useMemo(() => <InvestorSidebar />, [])

  const getDisplayName = () => {
    if (investorProfile?.firstName) {
      return investorProfile.firstName
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]
    }
    return currentUser?.email?.split('@')[0] || 'Investor'
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {getDisplayName()}!
        </h1>
        <p className="text-gray-600">Here's your investment portfolio overview</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <BanknotesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{stats.totalInvested.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Invested</div>
        </div>

        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <ChartBarIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.activeInvestments}</div>
          <div className="text-sm opacity-90">Active Investments</div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <BuildingOfficeIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.portfolioCompanies}</div>
          <div className="text-sm opacity-90">Portfolio Companies</div>
        </div>

        <div className="bg-linear-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <BookmarkIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.savedProjects}</div>
          <div className="text-sm opacity-90">Saved Projects</div>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <SparklesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.totalReturns).toLocaleString()}</div>
          <div className="text-sm opacity-90">Expected Returns</div>
        </div>

        <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <ArrowTrendingUpIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.averageEquity.toFixed(2)}%</div>
          <div className="text-sm opacity-90">Avg. Equity</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Investments & Trending */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Investments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Investments</h2>
              <button
                onClick={() => navigate('/investments')}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View All
              </button>
            </div>

            {recentInvestments.length > 0 ? (
              <div className="space-y-4">
                {recentInvestments.map((investment, index) => {
                  const myAmount = Number(investment.myAmount) || 0;
                  const myEquity = Number(investment.myEquity) || 0;
                  return (
                  <div
                    key={`${investment.id || 'project'}-${investment.investmentDate?.getTime?.() || index}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{investment.projectName}</h3>
                      <p className="text-sm text-gray-600">
                        Invested on {new Date(investment.investmentDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{myAmount.toLocaleString()}</div>
                      <div className="text-sm text-green-600">{myEquity.toFixed(2)}% equity</div>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No investments yet</p>
                <button
                  onClick={() => navigate('/investor/browse-projects')}
                  className="mt-4 px-6 py-2 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Browse Projects
                </button>
              </div>
            )}
          </div>

          {/* Trending Investment Opportunities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Trending Opportunities</h2>
              <button
                onClick={() => navigate('/browse-projects')}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {trendingProjects.map((project) => (
                <div key={project.id} onClick={() => navigate('/browse-projects')} className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{project.projectName}</h3>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        {project.totalInvestors || 0} investors
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {Math.round(project.fundingPercentage || 0)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-linear-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(project.fundingPercentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        Goal: ₹{((Number(project.fundingGoal) || 0) / 100000).toFixed(1)}L
                      </span>
                      <span className="font-semibold text-pink-600">
                        ₹{((Number(project.currentFunding) || 0) / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Investment Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Active Projects</span>
                <span className="font-semibold text-gray-900">{stats.activeInvestments}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Portfolio Value</span>
                <span className="font-semibold text-green-600">₹{Math.round(stats.totalInvested + stats.totalReturns).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Avg Investment</span>
                <span className="font-semibold text-gray-900">
                  ₹{stats.activeInvestments > 0 ? Math.round(stats.totalInvested / stats.activeInvestments).toLocaleString() : 0}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Returns</span>
                <span className="font-semibold text-purple-600">₹{Math.round(stats.totalReturns).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ROI</span>
                <span className={`font-semibold ${stats.totalInvested > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {stats.totalInvested > 0 ? `+${((stats.totalReturns / stats.totalInvested) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          {investorProfile && (
            <div className={isProfileComplete ? "bg-green-50 rounded-2xl p-6" : "bg-blue-50 rounded-2xl p-6"}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Status</h3>
              <p className="text-sm text-gray-600 mb-3">
                {isProfileComplete
                  ? 'Your profile is complete. Great job!'
                  : 'Complete your profile to discover better opportunities'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={isProfileComplete ? "bg-green-500 h-2 rounded-full transition-all duration-300" : "bg-blue-500 h-2 rounded-full transition-all duration-300"}
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                {isProfileComplete ? 'Profile complete' : `${profileCompletion}% Complete`}
              </p>
              <button
                onClick={() => navigate('/profile')}
                className={isProfileComplete
                  ? "w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  : "w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"}
              >
                {isProfileComplete ? 'View Profile' : 'Complete Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InvestorDashboard
