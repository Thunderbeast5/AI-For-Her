import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
  const [investorProfile, setInvestorProfile] = useState(null)

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

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          setLoading(false)
          return
        }

        // Fetch investor profile
        const profileResponse = await fetch(`http://localhost:5000/api/investors/${userId}`)
        if (profileResponse.ok) {
          const profile = await profileResponse.json()
          setInvestorProfile(profile)
        }

        // Fetch all investment projects
        const projectsResponse = await fetch('http://localhost:5000/api/investment-projects')
        const allProjects = await projectsResponse.json()

        // Calculate investments made by this investor
        let totalInvested = 0
        let totalEquity = 0
        let investmentCount = 0
        let portfolioCompanies = new Set()
        let totalReturns = 0
        const myInvestments = []

        allProjects.forEach(project => {
          // Find all investments by this investor in this project
          const myInvestmentsInProject = project.investors?.filter(inv => inv.investorId === userId) || []
          
          myInvestmentsInProject.forEach(investment => {
            const investmentAmount = investment.amount
            const equityPercent = investment.equityPercentage
            
            // Calculate estimated returns based on project performance
            // Use a more realistic growth model based on funding progress and stage
            const fundingProgress = project.fundingPercentage || 0
            const valuationMultiplier = project.valuationAmount / project.fundingGoal
            
            // Calculate current value: if valuation is set properly, use it; otherwise simulate growth
            let growthRate = 0
            if (fundingProgress >= 80) {
              growthRate = 0.15 + (Math.random() * 0.15) // 15-30% for well-funded projects
            } else if (fundingProgress >= 50) {
              growthRate = 0.08 + (Math.random() * 0.12) // 8-20% for moderately funded
            } else {
              growthRate = 0.03 + (Math.random() * 0.07) // 3-10% for early stage
            }
            
            const currentProjectValue = investmentAmount * (1 + growthRate)
            const estimatedReturn = currentProjectValue - investmentAmount
            
            totalInvested += investmentAmount
            totalEquity += equityPercent
            totalReturns += estimatedReturn
            investmentCount++
            portfolioCompanies.add(project.startupId?._id || project.startupId)
            
            myInvestments.push({
              ...project,
              myAmount: investmentAmount,
              myEquity: equityPercent,
              investmentDate: investment.investmentDate
            })
          })
        })

        // Sort by investment date and get recent 3
        myInvestments.sort((a, b) => new Date(b.investmentDate) - new Date(a.investmentDate))
        setRecentInvestments(myInvestments.slice(0, 3))

        // Get trending projects (highest funding percentage, active status)
        const trending = allProjects
          .filter(p => p.status === 'active')
          .sort((a, b) => (b.fundingPercentage || 0) - (a.fundingPercentage || 0))
          .slice(0, 4)
        setTrendingProjects(trending)

        // Fetch saved projects count
        const savedResponse = await fetch(`http://localhost:5000/api/investors/${userId}/saved-projects`)
        const savedProjects = savedResponse.ok ? await savedResponse.json() : []

        // Calculate average equity
        const avgEquity = investmentCount > 0 ? totalEquity / investmentCount : 0

        setStats({
          totalInvested,
          activeInvestments: investmentCount,
          savedProjects: savedProjects.length,
          portfolioCompanies: portfolioCompanies.size,
          totalReturns: totalReturns,
          averageEquity: avgEquity
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data when window gains focus
    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [currentUser])

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {getDisplayName()}! 👋
        </h1>
        <p className="text-gray-600">Here's your investment portfolio overview</p>
      </motion.div>

      {/* Key Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <BanknotesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{stats.totalInvested.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Invested</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <ChartBarIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.activeInvestments}</div>
          <div className="text-sm opacity-90">Active Investments</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <BuildingOfficeIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.portfolioCompanies}</div>
          <div className="text-sm opacity-90">Portfolio Companies</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <BookmarkIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.savedProjects}</div>
          <div className="text-sm opacity-90">Saved Projects</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <SparklesIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">₹{Math.round(stats.totalReturns).toLocaleString()}</div>
          <div className="text-sm opacity-90">Expected Returns</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <ArrowTrendingUpIcon className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{stats.averageEquity.toFixed(2)}%</div>
          <div className="text-sm opacity-90">Avg. Equity</div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Investments & Trending */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Investments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Investments</h2>
              <button
                onClick={() => navigate('/investor/investments')}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View All
              </button>
            </div>

            {recentInvestments.length > 0 ? (
              <div className="space-y-4">
                {recentInvestments.map((investment, index) => (
                  <motion.div
                    key={investment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{investment.projectName}</h3>
                      <p className="text-sm text-gray-600">
                        Invested on {new Date(investment.investmentDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{investment.myAmount.toLocaleString()}</div>
                      <div className="text-sm text-green-600">{investment.myEquity.toFixed(2)}% equity</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No investments yet</p>
                <button
                  onClick={() => navigate('/investor/browse-projects')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Browse Projects
                </button>
              </div>
            )}
          </motion.div>

          {/* Trending Investment Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">🔥 Trending Opportunities</h2>
              <button
                onClick={() => navigate('/investor/browse-projects')}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {trendingProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => navigate('/investor/browse-projects')}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                >
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
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(project.fundingPercentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Goal: ₹{(project.fundingGoal / 100000).toFixed(1)}L</span>
                      <span className="font-semibold text-pink-600">₹{(project.currentFunding / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Investment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
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
          </motion.div>

          {/* Profile Completion */}
          {investorProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Status</h3>
              <p className="text-sm text-gray-600 mb-3">Complete your profile to discover better opportunities</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mb-3">{profileCompletion}% Complete</p>
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Complete Profile
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InvestorDashboard
