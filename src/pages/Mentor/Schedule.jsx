import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import UnifiedChat from '../../components/UnifiedChat';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Schedule = () => {
  const { currentUser } = useAuth();
  const [connections, setConnections] = useState([]);
  const [groupSessions, setGroupSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // unified chat
  const [showAllOneOnOne, setShowAllOneOnOne] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const fetchScheduleData = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const connectionsQuery = query(collection(db, 'connections'), where('mentorId', '==', currentUser.uid));
      const connectionsSnapshot = await getDocs(connectionsQuery);
      const connectionsData = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConnections(connectionsData);

      const groupSessionsQuery = query(collection(db, 'groupSessions'), where('mentorId', '==', currentUser.uid));
      const groupSessionsSnapshot = await getDocs(groupSessionsQuery);
      const groupSessionsData = groupSessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroupSessions(groupSessionsData);
    } catch (error) {
      console.error('Error fetching group sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchScheduleData();
    const interval = setInterval(fetchScheduleData, 30000);
    return () => clearInterval(interval);
  }, [fetchScheduleData]);

  // Filter active connections only
  const activeConnections = useMemo(() => 
    connections.filter(conn => conn.status === 'active'),
    [connections]
  );

  // Filter active and upcoming group sessions
  const activeGroupSessions = useMemo(() => 
    groupSessions.filter(session => 
      session.status === 'active' || session.status === 'upcoming'
    ),
    [groupSessions]
  );

  // Helper to get participant count for a group session (supports legacy fields)
  const getSessionParticipantCount = useCallback((session) => {
    return (session.participants?.length || session.currentParticipants?.length || 0);
  }, []);

  // Calculate stats
  const stats = useMemo(() => ({
    totalSessions: activeConnections.length + activeGroupSessions.length,
    oneOnOne: activeConnections.length,
    groupSessions: activeGroupSessions.length,
    totalParticipants: activeGroupSessions.reduce(
      (sum, session) => sum + getSessionParticipantCount(session),
      0
    )
  }), [activeConnections, activeGroupSessions, getSessionParticipantCount]);

  const sidebar = useMemo(() => <MentorSidebar />, []);

  if (activeChat) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <UnifiedChat
          chatInfo={activeChat}
          currentUser={currentUser}
          onBack={() => setActiveChat(null)}
          userRole="mentor"
        />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading schedule...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
        <p className="text-gray-600">Manage your mentoring sessions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-pink-500" />
            <span className="text-sm text-gray-600">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserIcon className="w-6 h-6 text-pink-500" />
            <span className="text-sm text-gray-600">One-on-One</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.oneOnOne}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <VideoCameraIcon className="w-6 h-6 text-pink-500" />
            <span className="text-sm text-gray-600">Group Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.groupSessions}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm ">
          <div className="flex items-center space-x-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Total Participants</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">One-on-One Mentoring Sessions</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {activeConnections.length} Active
          </span>
        </div>

        {activeConnections.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active one-on-one sessions</p>
            <p className="text-sm text-gray-400 mt-1">Your mentees will appear here once they connect with you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllOneOnOne ? activeConnections : activeConnections.slice(0, 1)).map((connection) => (
              <div key={connection.id} onClick={() => setSelectedSession({ ...connection, type: 'one-on-one' })} className="flex items-center justify-between p-4 bg-linear-to-br from-pink-50 to-pink-50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-pink-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {connection.entrepreneurName?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{connection.entrepreneurName || 'Entrepreneur'}</h3>
                    <p className="text-sm text-gray-600">{connection.entrepreneurEmail}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Connected: {new Date(connection.acceptedAt || connection.createdAt).toLocaleDateString()}
                      </span>
                      {connection.sessionCount > 0 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {connection.sessionCount} sessions
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {connection.mentorType === 'personal' ? 'Personal' : 'Group'}
                      </span>
                      {connection.paymentStatus === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChat({
                        type: 'personal',
                        id: connection.id,
                        otherPersonName: connection.entrepreneurName || 'Entrepreneur',
                      });
                    }}
                    className="px-4 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
            {activeConnections.length > 1 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllOneOnOne(!showAllOneOnOne)}
                  className="text-sm text-pink-600 font-medium hover:underline"
                >
                  {showAllOneOnOne ? 'Show less' : `Show ${activeConnections.length - 1} more`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Group Mentoring Sessions</h2>
          <span className="px-3 py-1 bg-purple-100 text-pink-700 rounded-full text-sm font-medium">
            {activeGroupSessions.length} Active
          </span>
        </div>

        {activeGroupSessions.length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active group sessions</p>
            <p className="text-sm text-gray-400 mt-1">Create group sessions from the Group Sessions page</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllGroups ? activeGroupSessions : activeGroupSessions.slice(0, 1)).map((session) => (
              <div key={session.id} onClick={() => setSelectedSession({ ...session, type: 'group' })} className="flex items-center justify-between p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-purple-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-pink-500 rounded-full flex items-center justify-center">
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.groupName}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{session.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {session.schedule?.day} - {session.schedule?.time}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {session.schedule?.duration} min
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {session.sector}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {getSessionParticipantCount(session)}/{session.maxParticipants} participants
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveChat({
                        type: 'group',
                        id: session.id,
                        groupType: 'mentor',
                        groupName: session.groupName,
                      });
                    }}
                    className="px-4 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                  >
                    Open Chat
                  </button> */}
                  {session.meetingLink && (
                    <button onClick={(e) => { e.stopPropagation(); window.open(session.meetingLink, '_blank'); }} className="px-4 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm">
                      Join Meeting
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 ${selectedSession.type === 'one-on-one' ? 'bg-linear-to-br from-blue-500 to-indigo-500' : 'bg-linear-to-br from-purple-500 to-pink-500'} text-white p-6 rounded-t-2xl flex justify-between items-center`}>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedSession.type === 'one-on-one' 
                    ? selectedSession.entrepreneurName 
                    : selectedSession.groupName}
                </h2>
                <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-sm rounded-full">
                  {selectedSession.type === 'one-on-one' ? 'One-on-One Session' : 'Group Session'}
                </span>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedSession.type === 'one-on-one' ? (
                <>
                  {/* One-on-One Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded"></div>
                      Mentee Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Name</label>
                        <p className="text-gray-900 font-medium">{selectedSession.entrepreneurName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Email</label>
                        <p className="text-gray-900 font-medium">{selectedSession.entrepreneurEmail}</p>
                      </div>
                      <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Connection Status</label>
                          <p className="text-gray-900 font-medium capitalize">{selectedSession.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Payment Status</label>
                          <p className="text-gray-900 font-medium capitalize">{selectedSession.paymentStatus}</p>
                        </div>
                      </div>
                      {selectedSession.requestMessage && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Request Message</label>
                          <p className="text-gray-900 font-medium">{selectedSession.requestMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded"></div>
                      Session History
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Total Sessions</label>
                          <p className="text-gray-900 font-bold text-lg">{selectedSession.sessionCount || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Last Session</label>
                          <p className="text-gray-900 font-medium">
                            {selectedSession.lastSessionDate 
                              ? new Date(selectedSession.lastSessionDate).toLocaleDateString() 
                              : 'No sessions yet'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Connected Since</label>
                        <p className="text-gray-900 font-medium">
                          {new Date(selectedSession.acceptedAt || selectedSession.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Group Session Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Session Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <p className="text-gray-900 font-medium">{selectedSession.description}</p>
                      </div>
                      <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Sector</label>
                          <p className="text-gray-900 font-medium">{selectedSession.sector}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Language</label>
                          <p className="text-gray-900 font-medium">{selectedSession.language}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Schedule Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Day</label>
                          <p className="text-gray-900 font-medium">{selectedSession.schedule?.day}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Time</label>
                          <p className="text-gray-900 font-medium">{selectedSession.schedule?.time}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Duration</label>
                          <p className="text-gray-900 font-medium">{selectedSession.schedule?.duration} minutes</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Frequency</label>
                          <p className="text-gray-900 font-medium">{selectedSession.schedule?.frequency}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Participants ({selectedSession.currentParticipants?.length || 0}/{selectedSession.maxParticipants})
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedSession.currentParticipants?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSession.currentParticipants.map((participant, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {participant.userName?.charAt(0) || 'P'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium">{participant.userName}</p>
                                  <p className="text-xs text-gray-500">
                                    Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                participant.paymentStatus === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {participant.paymentStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No participants yet</p>
                      )}
                    </div>
                  </div>

                  {selectedSession.topics && selectedSession.topics.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-500 rounded"></div>
                        Topics Covered
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedSession.topics.map((topic, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Pricing
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-3xl font-bold text-gray-900">₹{selectedSession.price}</p>
                      <p className="text-sm text-gray-600 mt-1">per session</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Schedule;
