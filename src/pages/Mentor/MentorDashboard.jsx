import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupChatInterface from '../../components/GroupChatInterface'
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout'
import MentorSidebar from '../../components/MentorSidebar'
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

const MentorDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectedMentees, setConnectedMentees] = useState([])
                const [pendingRequests, setPendingRequests] = useState(0)
  const [myFreeGroups, setMyFreeGroups] = useState([])
  const [myGroupSessions, setMyGroupSessions] = useState([])
  const [selectedGroupChat, setSelectedGroupChat] = useState(null)
  const [showAllFreeGroups, setShowAllFreeGroups] = useState(false)
  const [showAllGroupSessions, setShowAllGroupSessions] = useState(false)

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      try {
        setUserData(currentUser);

        // Fetch connections
        const connectionsQuery = query(collection(db, 'connections'), where('mentorId', '==', currentUser.uid));
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const connectionsData = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const pending = connectionsData.filter(conn => conn.status === 'pending' && conn.paymentStatus === 'pending' && conn.mentorType === 'personal').length;
        setPendingRequests(pending);

        const menteesData = connectionsData.map(conn => ({
          id: conn.id,
          name: conn.menteeName || 'Mentee',
          email: conn.menteeEmail || '',
          status: conn.status || 'pending',
          since: new Date(conn.createdAt.toDate()).toLocaleDateString(),
        }));
        setConnectedMentees(menteesData);

        // Fetch free groups
        const groupsQuery = query(collection(db, 'mentorGroups'), where('mentorId', '==', currentUser.uid));
        const groupsSnapshot = await getDocs(groupsQuery);
        setMyFreeGroups(groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch group sessions
        const groupSessionsQuery = query(collection(db, 'groupSessions'), where('mentorId', '==', currentUser.uid));
        const groupSessionsSnapshot = await getDocs(groupSessionsQuery);
        setMyGroupSessions(groupSessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Helper function to get display name
  const getDisplayName = () => {
    if (userData?.firstName) {
      return userData.firstName
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]
    }
    return currentUser?.email?.split('@')[0] || 'Mentor'
  }

  const sidebar = useMemo(() => <MentorSidebar />, [])

  const quickActions = [
    {
      title: "Pending Requests",
      description: "Review connection requests",
      icon: EnvelopeIcon,
      color: "from-yellow-400 to-orange-400",
      count: pendingRequests,
      action: () => navigate('/mentor/requests'),
      badge: pendingRequests > 0 ? 'New' : null
    },
    {
      title: "My Mentees",
      description: "View and manage your mentees",
      icon: UserGroupIcon,
      color: "from-pink-400 to-pink-500",
      count: connectedMentees.length,
      action: () => navigate('/mentor/mentees')
    },
    {
      title: "Free Groups",
      description: "Telegram-style community groups",
      icon: UsersIcon,
      color: "from-green-400 to-emerald-500",
      count: myFreeGroups.length,
      action: () => navigate('/mentor/my-groups')
    },
    {
      title: "Paid Sessions",
      description: "Group mentoring sessions",
      icon: VideoCameraIcon,
      color: "from-blue-400 to-indigo-500",
      count: myGroupSessions.length,
      action: () => navigate('/mentor/group-sessions')
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
    <DashboardLayout sidebar={sidebar}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {getDisplayName()}
        </h1>
        <p className="text-gray-600">Empowering the next generation of women entrepreneurs</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentoring Hub</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div key={index} onClick={action.action} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-100">
              <div className={`w-12 h-12 bg-linear-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">{action.title}</h3>
                {action.badge && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium animate-pulse">
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {action.count}
              </span>
              <p className="text-gray-600 text-sm mt-2">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards - Only show if there's actual data */}
      {(connectedMentees.length > 0 || myFreeGroups.length > 0 || myGroupSessions.length > 0) && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-linear-to-br from-pink-50 to-pink-100 rounded-xl p-5 shadow-sm border border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="w-8 h-8 text-pink-600" />
              <span className="text-xs font-medium text-pink-600 bg-pink-200 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{connectedMentees.length}</div>
            <div className="text-sm text-gray-700 font-medium">Connected Mentees</div>
          </div>
          
          <div className="bg-linear-to-br from-green-50 to-emerald-100 rounded-xl p-5 shadow-sm border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-8 h-8 text-green-600" />
              <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">Free</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{myFreeGroups.length}</div>
            <div className="text-sm text-gray-700 font-medium">Community Groups</div>
          </div>
          
          <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl p-5 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Paid</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{myGroupSessions.length}</div>
            <div className="text-sm text-gray-700 font-medium">Group Sessions</div>
          </div>
        </div>
      )}

      {/* Recent Activity or Getting Started Guide */}
      {connectedMentees.length === 0 && myFreeGroups.length === 0 && myGroupSessions.length === 0 ? (
        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-200">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Mentoring Journey! 🚀</h3>
            <p className="text-gray-600 mb-6">Welcome to the platform! Here's how you can get started:</p>
            
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Accept Mentees</h4>
                <p className="text-sm text-gray-600">Review connection requests and start building mentor relationships</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create Free Groups</h4>
                <p className="text-sm text-gray-600">Build community by creating Telegram-style groups</p>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">💰</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Host Paid Sessions</h4>
                <p className="text-sm text-gray-600">Create group mentoring sessions and monetize your expertise</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Content Area - Remove tabs, show all active content */}
      
      {/* Recent Mentees - Only show if there are connected mentees */}
      {connectedMentees.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Mentees</h3>
            <button
              onClick={() => navigate('/mentees')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {connectedMentees.slice(0, 4).map((mentee) => (
              <div key={mentee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-linear-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{mentee.name?.charAt(0) || 'M'}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{mentee.name}</h4>
                    <p className="text-xs text-gray-500">Connected: {mentee.since}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Free Groups and My Group Mentoring Sessions - Horizontal Layout */}
      {(myFreeGroups.length > 0 || myGroupSessions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* My Free Groups */}
          {myFreeGroups.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Free Groups</h3>
                  <p className="text-sm text-gray-600">Telegram-style groups</p>
                </div>
                <button
                  onClick={() => navigate('/mentor/create-group')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                >
                  Create
                </button>
              </div>
              <div className="space-y-3">
                {(showAllFreeGroups ? myFreeGroups : myFreeGroups.slice(0, 1)).map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-pink-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{group.groupName}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          group.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {group.status}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Admin
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{group.description}</p>

                    <div className="space-y-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        <span>{group.currentParticipants?.length || 0}/{group.maxParticipants} Members</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{group.sector}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedGroupChat({
                          groupId: group.id,
                          groupName: group.groupName
                        })}
                        className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-1 ${primaryButtonClass}`}
                      >
                        {/* <ChatBubbleLeftRightIcon className="w-4 h-4" /> */}
                        Open Chat
                      </button>
                      <button
                        onClick={() => navigate('/mentor/my-groups')}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
                {myFreeGroups.length > 1 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllFreeGroups(!showAllFreeGroups)}
                      className="text-sm text-pink-600 font-medium hover:underline"
                    >
                      {showAllFreeGroups ? 'Show less' : `Show ${myFreeGroups.length - 1} more`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Group Mentoring Sessions (Paid) */}
          {myGroupSessions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Group Mentoring Sessions</h3>
                  <p className="text-sm text-gray-600">Paid group sessions</p>
                </div>
                <button
                  onClick={() => navigate('/group-sessions')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-3">
                {(showAllGroupSessions ? myGroupSessions : myGroupSessions.slice(0, 1)).map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-pink-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">{session.groupName}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Admin
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
                        <UserGroupIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{session.currentParticipants?.length || 0}/{session.maxParticipants} Enrolled</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-blue-700">₹{session.price} • Revenue: ₹{session.totalRevenue || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 px-4 py-2 text-sm flex items-center justify-center gap-2 ${primaryButtonClass}`}
                        >
                          <VideoCameraIcon className="w-4 h-4" />
                          Start Session
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {myGroupSessions.length > 1 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllGroupSessions(!showAllGroupSessions)}
                      className="text-sm text-pink-600 font-medium hover:underline"
                    >
                      {showAllGroupSessions ? 'Show less' : `Show ${myGroupSessions.length - 1} more`}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                name: userData?.firstName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Mentor'
              }}
              onClose={() => setSelectedGroupChat(null)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default MentorDashboard
