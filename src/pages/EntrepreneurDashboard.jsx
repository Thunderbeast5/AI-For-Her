import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import EntrepreneurSidebar from '../components/EntrepreneurSidebar'
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const EntrepreneurDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const quickActions = [
    {
      title: "Find Mentor",
      description: "Get matched with experienced entrepreneurs",
      icon: AcademicCapIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/mentors')
    },
    {
      title: "Ask AI Coach",
      description: "Get instant business advice and insights",
      icon: ChatBubbleLeftRightIcon,
      color: "from-pink-300 to-pink-400",
      action: () => navigate('/chat')
    },
    {
      title: "View Opportunities",
      description: "Discover funding and growth opportunities",
      icon: EyeIcon,
      color: "from-pink-100 to-pink-200",
      action: () => navigate('/opportunities')
    }
  ]

  const recentActivity = [
    { title: "Completed business plan review", time: "2 hours ago", icon: SparklesIcon },
    { title: "Connected with mentor Sarah K.", time: "1 day ago", icon: AcademicCapIcon },
    { title: "Applied for SIDBI Grant", time: "3 days ago", icon: TrophyIcon },
  ]

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [currentUser])

  // Get display name
  const getDisplayName = () => {
    if (userData?.firstName) {
      return userData.firstName
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]
    }
    return currentUser?.email?.split('@')[0] || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {getDisplayName()} 
        </h1>
        <p className="text-gray-600">Ready to take your business to the next level?</p>
      </motion.div>

      {/* Your AI Mentor Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your AI Mentor Hub</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={action.action}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Mentor Connections</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">AI Conversations</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Opportunities Applied</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">85%</div>
          <div className="text-sm text-gray-600">Journey Progress</div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <activity.icon className="w-4 h-4 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default EntrepreneurDashboard
