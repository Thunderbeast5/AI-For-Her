import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import MentorSidebar from '../components/MentorSidebar'
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const MentorDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectedMentees, setConnectedMentees] = useState([])
  const [activeTab, setActiveTab] = useState('mentees') // mentees, chats, group
  const [chatSessionsCount, setChatSessionsCount] = useState(0)
  const [groupSessionsCount, setGroupSessionsCount] = useState(0)

  // Fetch user data and connected mentees
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }

          // Fetch connected mentees from connections collection
          const connectionsQuery = query(
            collection(db, 'connections'),
            where('mentorId', '==', currentUser.uid)
          )
          const connectionsSnapshot = await getDocs(connectionsQuery)
          
          const menteesData = await Promise.all(
            connectionsSnapshot.docs.map(async (connectionDoc) => {
              const connection = connectionDoc.data()
              // Fetch mentee user data
              const menteeDoc = await getDoc(doc(db, 'users', connection.menteeId))
              const menteeData = menteeDoc.data()
              
              // Get display name
              let name = 'Anonymous User'
              if (menteeData?.firstName && menteeData?.lastName) {
                name = `${menteeData.firstName} ${menteeData.lastName}`
              } else if (menteeData?.firstName) {
                name = menteeData.firstName
              } else if (menteeData?.email) {
                name = menteeData.email.split('@')[0]
              }
              
              return {
                id: connectionDoc.id,
                name: name,
                business: menteeData?.startupName || menteeData?.sector || 'Entrepreneur',
                lastContact: connection.lastContact || 'Recently',
                status: connection.status || 'active',
                email: menteeData?.email
              }
            })
          )
          
          setConnectedMentees(menteesData)

          // Fetch chat sessions count
          const chatsQuery = query(
            collection(db, 'chats'),
            where('mentorId', '==', currentUser.uid)
          )
          const chatsSnapshot = await getDocs(chatsQuery)
          setChatSessionsCount(chatsSnapshot.size)

          // Fetch group sessions count
          const groupSessionsQuery = query(
            collection(db, 'sessions'),
            where('mentorId', '==', currentUser.uid),
            where('type', '==', 'group')
          )
          const groupSessionsSnapshot = await getDocs(groupSessionsQuery)
          setGroupSessionsCount(groupSessionsSnapshot.size)
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
    return currentUser?.email?.split('@')[0] || 'Mentor'
  }

  const quickActions = [
    {
      title: "Connected Mentees",
      description: "View and manage your mentees",
      icon: UserGroupIcon,
      color: "from-pink-200 to-pink-300",
      count: connectedMentees.length,
      action: () => setActiveTab('mentees')
    },
    {
      title: "Chat Sessions",
      description: "Individual mentoring conversations",
      icon: ChatBubbleLeftRightIcon,
      color: "from-pink-300 to-pink-400",
      count: chatSessionsCount,
      action: () => setActiveTab('chats')
    },
    {
      title: "Group Mentoring",
      description: "Host group sessions and workshops",
      icon: VideoCameraIcon,
      color: "from-pink-100 to-pink-200",
      count: groupSessionsCount,
      action: () => setActiveTab('group')
    }
  ]

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
    <DashboardLayout sidebar={<MentorSidebar />}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {getDisplayName()}
        </h1>
        <p className="text-gray-600">Empowering the next generation of women entrepreneurs</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentoring Hub</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={action.action}
              className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                activeTab === ['mentees', 'chats', 'group'][index] ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                <span className="text-2xl font-bold text-purple-600">{action.count}</span>
              </div>
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
          <div className="text-2xl font-bold text-gray-900">{connectedMentees.length}</div>
          <div className="text-sm text-gray-600">Active Mentees</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Sessions This Month</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Total Hours Mentored</div>
        </div>
      </motion.div>

      {/* Content Area Based on Active Tab */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        {/* Connected Mentees Tab */}
        {activeTab === 'mentees' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Mentees</h3>
            <div className="space-y-4">
              {connectedMentees.map((mentee) => (
                <div key={mentee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{mentee.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{mentee.name}</h4>
                      <p className="text-sm text-gray-600">{mentee.business}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Last contact: {mentee.lastContact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      mentee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {mentee.status}
                    </span>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                      <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Sessions Tab */}
        {activeTab === 'chats' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Chat Sessions</h3>
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Start individual mentoring sessions with your mentees</p>
              <button 
                onClick={() => navigate('/chat')}
                className="px-6 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
              >
                Go to Chat
              </button>
            </div>
          </div>
        )}

        {/* Group Mentoring Tab */}
        {activeTab === 'group' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Mentoring Sessions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Business Strategy Workshop</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Upcoming</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Learn essential business strategies for scaling your startup</p>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>Tomorrow, 3:00 PM</span>
                  <span className="mx-2">•</span>
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  <span>12 participants</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Funding & Pitch Preparation</h4>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Live</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Master the art of pitching to investors</p>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>Now</span>
                  <span className="mx-2">•</span>
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  <span>8 participants</span>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors">
                + Schedule New Group Session
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default MentorDashboard
