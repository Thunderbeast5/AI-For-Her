import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usersApi, startupsApi, connectionsApi } from '../../api'
import mentorGroupsApi from '../../api/mentorGroups'
import groupSessionsApi from '../../api/groupSessions'
import groupChatsApi from '../../api/groupChats'
import GroupChatInterface from '../../components/GroupChatInterface'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'

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
  const [myStartups, setMyStartups] = useState([])
  const [myFreeGroups, setMyFreeGroups] = useState([])
  const [myGroupSessions, setMyGroupSessions] = useState([])
  const [selectedGroupChat, setSelectedGroupChat] = useState(null)
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [investmentProjects, setInvestmentProjects] = useState([])
  const [selectedInvestmentProject, setSelectedInvestmentProject] = useState(null)
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(null)

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
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/chat')
    },
    {
      title: t('actions.viewOpportunities'),
      description: t('actions.viewOpportunitiesDesc'),
      icon: EyeIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/opportunities')
    }
  ]

  const handleDownloadStartupPDF = (startup) => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = 20
    const lineHeight = 10

    // Header
    doc.setFillColor(236, 72, 153)
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('Startup Proposal', doc.internal.pageSize.width / 2, 25, { align: 'center' })
    
    yPosition = 50

    const addText = (label, value, isBold = false) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      if (isBold) {
        doc.setFont(undefined, 'bold')
      } else {
        doc.setFont(undefined, 'normal')
      }
      doc.text(label, 20, yPosition)
      
      if (value) {
        doc.setFont(undefined, 'normal')
        const textLines = doc.splitTextToSize(String(value), 170)
        doc.text(textLines, 20, yPosition + 7)
        yPosition += 7 + (textLines.length * 5)
      }
      yPosition += lineHeight
    }

    // Basic Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Basic Information', 20, yPosition)
    yPosition += lineHeight

    addText('Startup Name:', startup.name || 'Not provided')
    addText('Category:', startup.category || 'Not provided')
    addText('Stage:', startup.stage || 'Not provided')
    addText('Description:', startup.description || 'Not provided')

    // Business Details
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Business Details', 20, yPosition)
    yPosition += lineHeight

    addText('Problem Statement:', startup.problemStatement || 'Not provided')
    addText('Solution:', startup.solution || 'Not provided')
    addText('Target Market:', startup.targetMarket || 'Not provided')
    addText('Unique Value Proposition:', startup.uniqueValue || 'Not provided')

    // Financial Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Financial Information', 20, yPosition)
    yPosition += lineHeight

    addText('Funding Required:', startup.fundingRequired || 'Not provided')
    addText('Current Revenue:', startup.currentRevenue || 'Not provided')
    addText('Revenue Model:', startup.revenueModel || 'Not provided')

    // Team Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Team Information', 20, yPosition)
    yPosition += lineHeight

    addText('Team Size:', startup.teamSize || 'Not provided')
    addText('Team Members:', startup.teamMembers || 'Not provided')

    // Additional Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Additional Information', 20, yPosition)
    yPosition += lineHeight

    addText('Competitors:', startup.competitors || 'Not provided')
    addText('Challenges:', startup.challenges || 'Not provided')
    addText('Milestones:', startup.milestones || 'Not provided')
    addText('Additional Notes:', startup.additionalNotes || 'Not provided')

    // Footer
    const fileName = `${startup.name?.replace(/\s+/g, '_') || 'startup'}_proposal.pdf`
    doc.save(fileName)
  }

  const handleDeleteStartup = async (startupId) => {
    try {
      await startupsApi.delete(startupId)
      setMyStartups(prev => prev.filter(s => (s._id || s.id) !== startupId))
      setShowDeleteConfirm(null)
      alert('Startup deleted successfully')
    } catch (error) {
      console.error('Error deleting startup:', error)
      alert('Failed to delete startup. Please try again.')
    }
  }

  const handleEditStartup = (startup) => {
    // Navigate to create-startup page with startup data
    navigate('/create-startup', { state: { startup } })
  }

  const handleDeleteInvestmentProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/investment-projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete project')
      }
      
      setInvestmentProjects(prev => prev.filter(p => p._id !== projectId))
      setShowDeleteProjectConfirm(null)
      alert('Investment project deleted successfully')
    } catch (error) {
      console.error('Error deleting investment project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }


  // Fetch user data and stats from MongoDB
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('🔍 EntrepreneurDashboard: Starting fetchUserData')
      console.log('👤 currentUser:', currentUser)
      
      if (currentUser) {
        try {
          // Set basic user data from currentUser
          setUserData(currentUser)
          console.log('✅ User data set:', currentUser)

          // Fetch startups from MongoDB
          try {
            console.log('📡 Fetching startups for userId:', currentUser.userId)
            const response = await startupsApi.getByUserId(currentUser.userId)
            console.log('📦 Startups response:', response)
            console.log('📦 Response type:', typeof response)
            console.log('📦 Response.data:', response.data)
            console.log('📦 Response.success:', response.success)
            
            // Handle the response format: { success: true, data: [...] }
            let startups = []
            if (response && response.data) {
              startups = Array.isArray(response.data) ? response.data : []
            } else if (Array.isArray(response)) {
              startups = response
            }
            
            console.log('🚀 Startups data:', startups)
            console.log('🚀 Startups length:', startups.length)
            console.log('🚀 Startups array:', JSON.stringify(startups))
            setMyStartups(startups)
            console.log('✅ setMyStartups called with:', startups.length, 'items')
            
            // Fetch connections for mentor connections count
            let mentorConnectionsCount = 0
            try {
              console.log('📡 Fetching connections for userId:', currentUser.userId)
              const connectionsResponse = await connectionsApi.getByUser(currentUser.userId, 'entrepreneur')
              console.log('🔗 Raw connections response:', connectionsResponse)
              
              // Handle response - it comes as { success: true, data: [...] }
              let connectionsArray = []
              if (connectionsResponse?.success && connectionsResponse?.data) {
                connectionsArray = Array.isArray(connectionsResponse.data) ? connectionsResponse.data : []
              } else if (Array.isArray(connectionsResponse)) {
                connectionsArray = connectionsResponse
              } else if (connectionsResponse?.data && Array.isArray(connectionsResponse.data)) {
                connectionsArray = connectionsResponse.data
              }
              
              console.log('🔗 Connections array:', connectionsArray)
              
              // Count active connections (active = accepted and ongoing)
              mentorConnectionsCount = connectionsArray.filter(conn => {
                console.log('🔍 Connection:', conn._id, 'Status:', conn.status)
                return conn.status === 'active' || conn.status === 'completed'
              }).length
              console.log('✅ Mentor connections count:', mentorConnectionsCount)
            } catch (error) {
              console.error('❌ Error fetching connections:', error.message, error)
              mentorConnectionsCount = 0
            }

            // Fetch free groups
            console.log('📡 Fetching free groups for userId:', currentUser.userId)
            const groupsResponse = await mentorGroupsApi.getByParticipant(currentUser.userId)
            console.log('🎯 Free groups response:', groupsResponse)
            const freeGroups = Array.isArray(groupsResponse) ? groupsResponse : []
            setMyFreeGroups(freeGroups)
            
            // Fetch paid group sessions
            console.log('📡 Fetching group sessions for userId:', currentUser.userId)
            const sessionsResponse = await groupSessionsApi.getByParticipant(currentUser.userId)
            console.log('💎 Group sessions response:', sessionsResponse)
            const groupSessions = Array.isArray(sessionsResponse) ? sessionsResponse : []
            setMyGroupSessions(groupSessions)

            // Fetch investment projects
            console.log('📡 Fetching investment projects for userId:', currentUser.userId)
            try {
              const investmentResponse = await fetch(`http://localhost:5000/api/investment-projects/user/${currentUser.userId}`)
              const investmentData = await investmentResponse.json()
              console.log('💰 Investment projects response:', investmentData)
              const projects = Array.isArray(investmentData) ? investmentData : investmentData.data || []
              setInvestmentProjects(projects)
              console.log('✅ Investment projects set:', projects.length, 'items')
            } catch (error) {
              console.error('❌ Error fetching investment projects:', error)
              setInvestmentProjects([])
            }

            // Calculate opportunities applied (startups created + groups joined)
            const opportunitiesApplied = startups.length + freeGroups.length + groupSessions.length

            // Update stats with real data
            setStats({
              mentorConnections: mentorConnectionsCount,
              aiConversations: 0, // This would need chat API integration
              opportunitiesApplied: opportunitiesApplied,
              journeyProgress: calculateJourneyProgress(startups)
            })
            console.log('✅ Stats updated with real data')
            
            // Build recent activity
            const activities = []
            if (startups.length > 0) {
              const recentStartup = startups[0]
              activities.push({
                title: `Created startup: ${recentStartup.name}`,
                time: new Date(recentStartup.createdAt).toLocaleDateString(),
                icon: SparklesIcon
              })
            }
            
            if (activities.length === 0) {
              activities.push({
                title: 'Welcome to AI For Her!',
                time: 'Just now',
                icon: SparklesIcon
              })
            }
            
            setRecentActivity(activities)
          } catch (error) {
            console.error('❌ Error fetching startups:', error)
            console.error('❌ Error details:', error.response?.data || error.message)
            setRecentActivity([{
              title: 'Welcome to AI For Her!',
              time: 'Just now',
              icon: SparklesIcon
            }])
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error)
        } finally {
          console.log('✅ Setting loading to false')
          setLoading(false)
        }
      } else {
        console.log('⚠️ No currentUser found')
        setLoading(false)
      }
    }

    fetchUserData()
  }, [currentUser])

  // Calculate journey progress based on startup stages
  const calculateJourneyProgress = (startups) => {
    if (!startups || startups.length === 0) return 0
    
    // Stage to progress mapping (matching the 8 stages from CreateStartup)
    const stageToProgress = {
      'Ideation': 12.5,
      'Concept Research': 25,
      'Prototype / MVP': 37.5,
      'Validation': 50,
      'Launch': 62.5,
      'Growth': 75,
      'Expansion / Funding': 87.5,
      'Scaling / Maturity': 100
    }
    
    // Get the highest stage progress from all startups
    let maxProgress = 0
    startups.forEach(startup => {
      const progress = stageToProgress[startup.stage] || 0
      if (progress > maxProgress) {
        maxProgress = progress
      }
    })
    
    return maxProgress
  }

  // Calculate profile progress
  const calculateProgress = (user) => {
    let progress = 0
    let totalFields = 0
    
    // Basic info (5 fields x 10% each = 50%)
    const basicFields = [
      user?.firstName,
      user?.lastName,
      user?.email,
      user?.phone,
      user?.bio
    ]
    basicFields.forEach(field => {
      totalFields++
      if (field) progress += 10
    })
    
    // Additional profile fields (5 fields x 10% each = 50%)
    const additionalFields = [
      user?.address?.city,
      user?.address?.state,
      user?.profilePhoto,
      user?.socialMedia?.linkedIn,
      user?.alternatePhone
    ]
    additionalFields.forEach(field => {
      totalFields++
      if (field) progress += 10
    })
    
    return Math.min(progress, 100)
  }

  // Memoize sidebar to prevent re-rendering on state changes
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

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
    <DashboardLayout sidebar={sidebar}>
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
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
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

      {/* My Startups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Startups ({myStartups.length})</h3>
          <button
            onClick={() => navigate('/create-startup')}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Create New +
          </button>
        </div>
        
        {console.log('🎨 Rendering startups section, myStartups.length:', myStartups.length)}
        {console.log('🎨 myStartups:', myStartups)}
        
        {myStartups.length > 0 ? (
          <div className="space-y-4">
            {console.log('✨ Rendering startup cards...')}
            {myStartups.map((startup, index) => {
              console.log(`📇 Rendering card ${index}:`, startup.name, 'ID:', startup._id || startup.id)
              return (
              <div 
                key={startup._id || startup.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedStartup(startup)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{startup.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        {startup.industry || startup.category}
                      </span>
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                        <TrophyIcon className="w-4 h-4" />
                        {startup.stage || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStartup(startup)
                      }}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                      title="Edit Startup"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(startup._id || startup.id)
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      title="Delete Startup"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadStartupPDF(startup)
                      }}
                      className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2">{startup.description}</p>

                {/* All Startup Fields */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  {startup.targetMarket && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <UsersIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Target Market</span>
                      </div>
                      <p className="text-sm text-gray-800">{startup.targetMarket}</p>
                    </div>
                  )}
                  
                  {startup.fundingGoal && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Funding Goal</span>
                      </div>
                      <p className="text-sm text-gray-800">₹{startup.fundingGoal.toLocaleString()}</p>
                    </div>
                  )}
                  
                  {startup.teamSize && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <UsersIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Team Size</span>
                      </div>
                      <p className="text-sm text-gray-800">{startup.teamSize} members</p>
                    </div>
                  )}
                </div>

                {/* Additional Fields Row */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  {startup.revenueModel && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <span className="text-xs font-semibold text-blue-900">Revenue Model</span>
                      <p className="text-sm text-blue-800 mt-1">{startup.revenueModel}</p>
                    </div>
                  )}
                  
                  {startup.uniqueSellingPoint && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <span className="text-xs font-semibold text-purple-900">USP</span>
                      <p className="text-sm text-purple-800 mt-1">{startup.uniqueSellingPoint}</p>
                    </div>
                  )}
                </div>

                {/* Checkboxes Section */}
                {(startup.hasWebsite || startup.hasPrototype || startup.hasMinimumViableProduct || startup.hasRevenue || startup.hasFunding) && (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <span className="text-xs font-semibold text-green-900 block mb-2">Milestones Achieved</span>
                    <div className="flex flex-wrap gap-2">
                      {startup.hasWebsite && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">✓ Website</span>
                      )}
                      {startup.hasPrototype && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">✓ Prototype</span>
                      )}
                      {startup.hasMinimumViableProduct && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">✓ MVP</span>
                      )}
                      {startup.hasRevenue && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">✓ Revenue</span>
                      )}
                      {startup.hasFunding && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">✓ Funding</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Revenue Info */}
                {(startup.currentRevenue || startup.projectedRevenue) && (
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {startup.currentRevenue > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <span className="text-xs font-semibold text-yellow-900">Current Revenue</span>
                        <p className="text-sm text-yellow-800 mt-1">₹{startup.currentRevenue.toLocaleString()}</p>
                      </div>
                    )}
                    {startup.projectedRevenue > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <span className="text-xs font-semibold text-orange-900">Projected Revenue</span>
                        <p className="text-sm text-orange-800 mt-1">₹{startup.projectedRevenue.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CalendarIcon className="w-4 h-4" />
                    Created: {startup.createdAt 
                      ? new Date(startup.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'Recently'
                    }
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStartup(startup)
                    }}
                    className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            )}
          )}
          </div>
        ) : (
          <div className="text-center py-12">
            {console.log('❌ Showing empty state, myStartups.length:', myStartups.length)}
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Startups Yet</h4>
            <p className="text-gray-600 mb-6">Create your first startup profile to get started!</p>
            <button
              onClick={() => navigate('/create-startup')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all font-medium"
            >
              Create Your First Startup
            </button>
          </div>
        )}
      </motion.div>

      {/* Investment Projects Listed for Funding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Projects Listed for Investment ({investmentProjects.length})</h3>
            <p className="text-sm text-gray-600">Track your funding progress</p>
          </div>
          <button
            onClick={() => navigate('/list-project')}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            List New Project +
          </button>
        </div>
        
        {console.log('💰 Rendering investment projects section, length:', investmentProjects.length)}
        {console.log('💰 Investment projects data:', investmentProjects)}
        
        {investmentProjects.length > 0 ? (
          <div className="space-y-4">
            {investmentProjects.map((project) => {
              const fundingPercentage = project.fundingPercentage || 0
              const remainingAmount = project.fundingGoal - (project.currentFunding || 0)
              const daysLeft = project.fundingDeadline 
                ? Math.max(0, Math.ceil((new Date(project.fundingDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
                : 0
              
              return (
                <div 
                  key={project._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.projectName}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${
                          project.status === 'active' ? 'bg-green-100 text-green-700' :
                          project.status === 'funded' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <CurrencyDollarIcon className="w-4 h-4" />
                          {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                        </span>
                        {daysLeft > 0 && project.status === 'active' && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {daysLeft} days left
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvestmentProject(project)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => navigate('/list-project', { state: { editProject: project } })}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteProjectConfirm(project._id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2">
                    {project.projectDescription}
                  </p>

                  {/* Funding Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Funding Progress</span>
                      <span className="text-sm font-bold text-pink-600">{fundingPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Funding Stats */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Raised</span>
                      </div>
                      <p className="text-sm font-bold text-green-900">₹{(project.currentFunding || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-700 mb-1">
                        <UsersIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Investors</span>
                      </div>
                      <p className="text-sm font-bold text-blue-900">{project.investors?.length || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span className="text-xs font-semibold">Remaining</span>
                      </div>
                      <p className="text-sm font-bold text-purple-900">₹{remainingAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Goal Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Goal: <span className="font-bold text-gray-900">₹{project.fundingGoal?.toLocaleString()}</span>
                      {' • '}
                      Equity: <span className="font-bold text-gray-900">{project.equityOffered}%</span>
                    </div>
                    {project.status === 'funded' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                        ✓ Fully Funded
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-pink-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Projects Listed Yet</h4>
            <p className="text-gray-600 mb-6">List your startup for investment to attract investors!</p>
            <button
              onClick={() => navigate('/list-project')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all font-medium"
            >
              List Your First Project
            </button>
          </div>
        )}
      </motion.div>

      {/* My Groups Section - Horizontal Layout */}
      {(myFreeGroups.length > 0 || myGroupSessions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* My Free Groups */}
          {myFreeGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Free Groups</h3>
                  <p className="text-sm text-gray-600">Community groups you've joined</p>
                </div>
                <button
                  onClick={() => navigate('/mentors')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Browse +
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {myFreeGroups.map((group) => (
                  <div 
                    key={group._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-blue-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{group.groupName}</h4>
                        <p className="text-xs text-gray-600 mb-2">by {group.mentorName}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        FREE
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{group.description}</p>

                    <div className="flex items-center text-xs text-gray-600 mb-3">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>{group.currentParticipants?.length || 0}/{group.maxParticipants} Members</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedGroupChat({
                          groupId: group._id,
                          groupName: group.groupName
                        })}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Open Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* My Group Mentoring Sessions (Paid) */}
          {myGroupSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Group Mentoring Sessions</h3>
                  <p className="text-sm text-gray-600">Paid group sessions enrolled</p>
                </div>
                <button
                  onClick={() => navigate('/mentors')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse +
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {myGroupSessions.map((session) => (
                  <div 
                    key={session._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-indigo-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{session.groupName}</h4>
                        <p className="text-xs text-blue-600 font-semibold mb-2">by {session.mentorName}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        PAID
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-700 mb-3">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span><strong>{session.schedule?.day}s</strong> at {session.schedule?.time}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{session.schedule?.duration} minutes/session</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{session.currentParticipants?.length || 0}/{session.maxParticipants} Enrolled</span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-semibold text-blue-700">₹{session.price}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <VideoCameraIcon className="w-4 h-4" />
                          Join Session
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Group Chat Modal */}
      {selectedGroupChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <GroupChatInterface
              groupId={selectedGroupChat.groupId}
              groupName={selectedGroupChat.groupName}
              currentUser={{
                userId: currentUser.userId,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
              }}
              onClose={() => setSelectedGroupChat(null)}
            />
          </div>
        </div>
      )}

      {/* Startup Details Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedStartup.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full">
                    {selectedStartup.industry || selectedStartup.category}
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full">
                    {selectedStartup.stage}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStartup(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleEditStartup(selectedStartup)
                    setSelectedStartup(null)
                  }}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Startup
                </button>
                <button
                  onClick={() => handleDownloadStartupPDF(selectedStartup)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download PDF
                </button>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Basic Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.founderName && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Founder Name</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.founderName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tagline</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.tagline || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.description || 'Not provided'}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Location</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Founded Date</label>
                      <p className="text-gray-900 font-medium">
                        {selectedStartup.foundedDate 
                          ? new Date(selectedStartup.foundedDate).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Current Stage</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.stage || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Problem & Solution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Problem & Solution
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Problem Statement</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.problemStatement || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Solution</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.solution || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Target Market</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.targetMarket || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Unique Selling Point</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.uniqueSellingPoint || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Value Proposition</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.valueProposition || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Product Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Features</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.features) 
                        ? selectedStartup.features.join(', ') 
                        : selectedStartup.features || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Technology Stack</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.technology) 
                        ? selectedStartup.technology.join(', ') 
                        : selectedStartup.technology || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funding Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Funding Goal</label>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedStartup.fundingGoal ? `₹${selectedStartup.fundingGoal.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Current Revenue</label>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedStartup.currentRevenue ? `₹${selectedStartup.currentRevenue.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Revenue Model</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.revenueModel || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Projected Revenue</label>
                    <p className="text-gray-900 font-medium">
                      {selectedStartup.projectedRevenue ? `₹${selectedStartup.projectedRevenue.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Investment Use</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.investmentUse || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Team Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Team Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Team Size</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.teamSize || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Key Hires Needed</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.keyHires) 
                        ? selectedStartup.keyHires.join(', ') 
                        : selectedStartup.keyHires || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market & Traction */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Market & Traction
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Customer Base</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.customerBase || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Monthly Active Users</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.monthlyActiveUsers || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Market Size</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.marketSize || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Competitors</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.competitors) 
                        ? selectedStartup.competitors.join(', ') 
                        : selectedStartup.competitors || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Competitive Advantage</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.competitiveAdvantage || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Key Achievements</label>
                    <p className="text-gray-900">
                      {Array.isArray(selectedStartup.achievements) 
                        ? selectedStartup.achievements.join(', ') 
                        : selectedStartup.achievements || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Business Model
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Model</label>
                    <p className="text-gray-900">{selectedStartup.businessModel || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pricing Strategy</label>
                    <p className="text-gray-900">{selectedStartup.pricingStrategy || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Links & Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Links & Documents
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <a href={selectedStartup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.website}
                      </a>
                    </div>
                  )}
                  {selectedStartup.pitchDeck && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pitch Deck</label>
                      <a href={selectedStartup.pitchDeck} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        View Pitch Deck
                      </a>
                    </div>
                  )}
                  {selectedStartup.socialMedia?.linkedIn && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                      <a href={selectedStartup.socialMedia.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.socialMedia.linkedIn}
                      </a>
                    </div>
                  )}
                  {selectedStartup.socialMedia?.twitter && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Twitter</label>
                      <a href={selectedStartup.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.socialMedia.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <a href={`mailto:${selectedStartup.email}`} className="text-blue-600 hover:underline block">
                        {selectedStartup.email}
                      </a>
                    </div>
                  )}
                  {selectedStartup.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <a href={`tel:${selectedStartup.phone}`} className="text-blue-600 hover:underline block">
                        {selectedStartup.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Looking For */}
              {selectedStartup.lookingFor && selectedStartup.lookingFor.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    What We're Looking For
                  </h3>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedStartup.lookingFor.map((item, index) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-white text-purple-700 rounded-full text-sm font-medium shadow-sm border border-purple-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Investment Project Confirmation Modal */}
      {showDeleteProjectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Investment Project?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this investment project? All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteProjectConfirm(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteInvestmentProject(showDeleteProjectConfirm)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Investment Project Detail Modal */}
      {selectedInvestmentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedInvestmentProject.projectName}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedInvestmentProject.status === 'active' ? 'bg-green-500 text-white' :
                    selectedInvestmentProject.status === 'funded' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {selectedInvestmentProject.status?.charAt(0).toUpperCase() + selectedInvestmentProject.status?.slice(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvestmentProject(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigate('/list-project', { state: { editProject: selectedInvestmentProject } })
                    setSelectedInvestmentProject(null)
                  }}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Project
                </button>
                <button
                  onClick={() => {
                    setShowDeleteProjectConfirm(selectedInvestmentProject._id)
                    setSelectedInvestmentProject(null)
                  }}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete Project
                </button>
              </div>

              {/* Funding Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Overview
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Funding Goal</label>
                      <p className="text-xl font-bold text-gray-900">₹{selectedInvestmentProject.fundingGoal?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Funding</label>
                      <p className="text-xl font-bold text-green-600">₹{selectedInvestmentProject.currentFunding?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Remaining</label>
                      <p className="text-xl font-bold text-gray-900">₹{(selectedInvestmentProject.fundingGoal - selectedInvestmentProject.currentFunding)?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(selectedInvestmentProject.fundingPercentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Min. Investment</label>
                      <p className="font-semibold text-gray-900">₹{selectedInvestmentProject.minimumInvestment?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Equity Offered</label>
                      <p className="font-semibold text-gray-900">{selectedInvestmentProject.equityOffered}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Valuation</label>
                      <p className="font-semibold text-gray-900">₹{(selectedInvestmentProject.valuationAmount / 10000000).toFixed(1)}Cr</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Total Investors</label>
                      <p className="font-semibold text-gray-900">{selectedInvestmentProject.totalInvestors || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Project Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{selectedInvestmentProject.projectDescription}</p>
                </div>
              </div>

              {/* Funding Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedInvestmentProject.fundingDeadline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Deadline</label>
                        <p className="text-gray-900">
                          {new Date(selectedInvestmentProject.fundingDeadline).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedInvestmentProject.maximumInvestment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Max Investment</label>
                        <p className="text-gray-900">₹{selectedInvestmentProject.maximumInvestment?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {selectedInvestmentProject.fundingPurpose && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Funding Purpose</label>
                      <p className="text-gray-900">{selectedInvestmentProject.fundingPurpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              {(selectedInvestmentProject.revenueModel || selectedInvestmentProject.currentRevenue !== undefined) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Financial Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedInvestmentProject.currentRevenue !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Current Revenue</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.currentRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.projectedRevenue && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Projected Revenue</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.projectedRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.revenueModel && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Revenue Model</label>
                          <p className="text-gray-900">{selectedInvestmentProject.revenueModel}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.monthlyBurnRate && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Monthly Burn Rate</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.monthlyBurnRate?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Milestones & Timeline */}
              {(selectedInvestmentProject.milestones?.length > 0 || selectedInvestmentProject.timeline) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Milestones & Timeline
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedInvestmentProject.milestones?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Milestones</label>
                        <ul className="mt-2 space-y-1">
                          {selectedInvestmentProject.milestones.map((milestone, idx) => (
                            <li key={idx} className="text-gray-900 flex items-start gap-2">
                              <span className="text-pink-500">•</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedInvestmentProject.timeline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Timeline</label>
                        <p className="text-gray-900">{selectedInvestmentProject.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Market & Traction */}
              {(selectedInvestmentProject.marketSize || selectedInvestmentProject.customerBase) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Market & Traction
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedInvestmentProject.marketSize && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Market Size</label>
                          <p className="text-gray-900">{selectedInvestmentProject.marketSize}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.customerBase !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Base</label>
                          <p className="text-gray-900">{selectedInvestmentProject.customerBase?.toLocaleString()} customers</p>
                        </div>
                      )}
                    </div>
                    {selectedInvestmentProject.competitiveAdvantage && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Competitive Advantage</label>
                        <p className="text-gray-900">{selectedInvestmentProject.competitiveAdvantage}</p>
                      </div>
                    )}
                    {selectedInvestmentProject.growthRate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Growth Rate</label>
                        <p className="text-gray-900">{selectedInvestmentProject.growthRate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team */}
              {(selectedInvestmentProject.teamSize || selectedInvestmentProject.keyTeamMembers?.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Team Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedInvestmentProject.teamSize && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Team Size</label>
                        <p className="text-gray-900">{selectedInvestmentProject.teamSize} members</p>
                      </div>
                    )}
                    {selectedInvestmentProject.keyTeamMembers?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Team Members</label>
                        <ul className="mt-2 space-y-1">
                          {selectedInvestmentProject.keyTeamMembers.map((member, idx) => (
                            <li key={idx} className="text-gray-900">{member}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Investors List */}
              {selectedInvestmentProject.investors?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Current Investors ({selectedInvestmentProject.investors.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedInvestmentProject.investors.map((investor, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{investor.investorName}</p>
                            <p className="text-sm text-gray-600">{investor.investorEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{investor.amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{investor.equityPercentage?.toFixed(2)}% equity</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Startup?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this startup? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStartup(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default EntrepreneurDashboard
