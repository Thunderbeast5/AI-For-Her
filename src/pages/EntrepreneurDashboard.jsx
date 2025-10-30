import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    mentorConnections: 0,
    aiConversations: 0,
    opportunitiesApplied: 0,
    journeyProgress: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  const quickActions = [
    {
      title: t('actions.findMentor'),
      description: t('actions.findMentorDesc'),
      icon: AcademicCapIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/mentors')
    },
    {
      title: t('actions.askAI'),
      description: t('actions.askAIDesc'),
      icon: ChatBubbleLeftRightIcon,
      color: "from-pink-300 to-pink-400",
      action: () => navigate('/chat')
    },
    {
      title: t('actions.viewOpportunities'),
      description: t('actions.viewOpportunitiesDesc'),
      icon: EyeIcon,
      color: "from-pink-100 to-pink-200",
      action: () => navigate('/opportunities')
    }
  ]


  // Fetch user data and stats from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }

          // Fetch mentor connections count
          const connectionsQuery = query(
            collection(db, 'connections'),
            where('menteeId', '==', currentUser.uid)
          )
          const connectionsSnapshot = await getDocs(connectionsQuery)
          const mentorCount = connectionsSnapshot.size

          // Fetch AI conversations count (from chats collection)
          const chatsQuery = query(
            collection(db, 'chats'),
            where('userId', '==', currentUser.uid)
          )
          const chatsSnapshot = await getDocs(chatsQuery)
          const aiConversationsCount = chatsSnapshot.size

          // Fetch opportunities applied (mock for now - you can create an applications collection)
          const opportunitiesCount = 0 // TODO: Implement when you have applications collection

          // Calculate journey progress based on profile completion
          const profileData = userDoc.data()
          let progress = 0
          if (profileData?.firstName) progress += 20
          if (profileData?.lastName) progress += 20
          if (profileData?.email) progress += 20
          if (profileData?.sector) progress += 20
          if (profileData?.startupName) progress += 20

          setStats({
            mentorConnections: mentorCount,
            aiConversations: aiConversationsCount,
            opportunitiesApplied: opportunitiesCount,
            journeyProgress: progress
          })

          // Fetch recent activity
          const activities = []
          
          // Add recent connections
          const recentConnections = await Promise.all(
            connectionsSnapshot.docs.slice(0, 2).map(async (doc) => {
              const connection = doc.data()
              const mentorDoc = await getDoc(doc(db, 'users', connection.mentorId))
              const mentorData = mentorDoc.data()
              const mentorName = mentorData?.firstName || 'Mentor'
              return {
                title: `Connected with mentor ${mentorName}`,
                time: connection.createdAt ? new Date(connection.createdAt).toLocaleDateString() : 'Recently',
                icon: AcademicCapIcon
              }
            })
          )
          activities.push(...recentConnections)

          // Add startup creation if exists
          const startupsQuery = query(
            collection(db, 'startups'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
          )
          const startupsSnapshot = await getDocs(startupsQuery)
          if (!startupsSnapshot.empty) {
            const startup = startupsSnapshot.docs[0].data()
            activities.push({
              title: `Created startup: ${startup.name}`,
              time: startup.createdAt ? new Date(startup.createdAt.seconds * 1000).toLocaleDateString() : 'Recently',
              icon: SparklesIcon
            })
          }

          // Add default activity if no activities
          if (activities.length === 0) {
            activities.push({
              title: 'Welcome to AI For Her!',
              time: 'Just now',
              icon: SparklesIcon
            })
          }

          setRecentActivity(activities)
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
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
          {t('dashboard.welcome')}, {getDisplayName()} 
        </h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </motion.div>

      {/* Your AI Mentor Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.mentorHub')}</h2>
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
          <div className="text-2xl font-bold text-gray-900">{stats.mentorConnections}</div>
          <div className="text-sm text-gray-600">{t('dashboard.stats.mentorConnections')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.aiConversations}</div>
          <div className="text-sm text-gray-600">{t('dashboard.stats.aiConversations')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.opportunitiesApplied}</div>
          <div className="text-sm text-gray-600">{t('dashboard.stats.opportunitiesApplied')}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.journeyProgress}%</div>
          <div className="text-sm text-gray-600">{t('dashboard.stats.journeyProgress')}</div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h3>
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
