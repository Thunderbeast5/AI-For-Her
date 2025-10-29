import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import InvestorSidebar from '../components/InvestorSidebar'
import { 
  MagnifyingGlassIcon,
  LightBulbIcon,
  BanknotesIcon,
  ChartBarIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const InvestorDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [projects, setProjects] = useState([])

  // Fetch user data and projects
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }

          // Mock project data - in production, fetch from Firestore
          setProjects([
            {
              id: 1,
              name: 'EcoFashion Marketplace',
              founder: 'Priya Sharma',
              category: 'Fashion',
              description: 'Sustainable fashion marketplace connecting eco-conscious designers with consumers',
              fundingGoal: '₹25,00,000',
              raised: '₹8,00,000',
              stage: 'Seed',
              location: 'Mumbai',
              rating: 4.5
            },
            {
              id: 2,
              name: 'HealthTech AI',
              founder: 'Anjali Verma',
              category: 'HealthTech',
              description: 'AI-powered health diagnostics platform for rural areas',
              fundingGoal: '₹50,00,000',
              raised: '₹15,00,000',
              stage: 'Series A',
              location: 'Bangalore',
              rating: 4.8
            },
            {
              id: 3,
              name: 'EdLearn Platform',
              founder: 'Meera Patel',
              category: 'EdTech',
              description: 'Interactive learning platform for K-12 students in regional languages',
              fundingGoal: '₹35,00,000',
              raised: '₹12,00,000',
              stage: 'Seed',
              location: 'Delhi',
              rating: 4.6
            },
            {
              id: 4,
              name: 'FarmFresh Connect',
              founder: 'Kavita Singh',
              category: 'AgriTech',
              description: 'Direct farm-to-consumer organic produce delivery platform',
              fundingGoal: '₹20,00,000',
              raised: '₹5,00,000',
              stage: 'Pre-Seed',
              location: 'Pune',
              rating: 4.3
            }
          ])
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [currentUser])

  const getDisplayName = () => {
    if (userData?.firstName) {
      return userData.firstName
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]
    }
    return currentUser?.email?.split('@')[0] || 'Investor'
  }

  const categories = ['all', 'Fashion', 'HealthTech', 'EdTech', 'AgriTech', 'FoodTech', 'FinTech']

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {getDisplayName()}
        </h1>
        <p className="text-gray-600">Discover and invest in innovative women-led startups</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Active Investments</div>
            </div>
            <BanknotesIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">₹2.5Cr</div>
              <div className="text-sm text-gray-600">Total Invested</div>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">48</div>
              <div className="text-sm text-gray-600">Projects Reviewed</div>
            </div>
            <LightBulbIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Portfolio Companies</div>
            </div>
            <StarIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Investment Opportunities</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for projects, founders, or ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {filteredProjects.length} Projects Found
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                  <p className="text-sm text-gray-600">Founded by {project.founder}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{project.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Funding Goal</span>
                  <span className="font-semibold text-gray-900">{project.fundingGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(parseInt(project.raised.replace(/[^0-9]/g, '')) / parseInt(project.fundingGoal.replace(/[^0-9]/g, ''))) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-semibold text-purple-600">{project.raised}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {project.stage}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {project.category}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {project.location}
                  </span>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default InvestorDashboard
