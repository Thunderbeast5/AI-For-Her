import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import axios from 'axios';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Schedule = () => {
  const [connections, setConnections] = useState([]);
  const [groupSessions, setGroupSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchScheduleData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchScheduleData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchScheduleData = async () => {
    try {
      const mentorId = localStorage.getItem('userId');
      
      // Fetch one-on-one connections
      const connectionsRes = await axios.get(
        `http://localhost:5000/api/connections/user/${mentorId}?role=mentor`
      );
      
      // Fetch group sessions
      const groupSessionsRes = await axios.get(
        `http://localhost:5000/api/group-sessions/mentor/${mentorId}`
      );
      
      setConnections(connectionsRes.data.data || []);
      setGroupSessions(groupSessionsRes.data || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate stats
  const stats = useMemo(() => ({
    totalSessions: activeConnections.length + activeGroupSessions.length,
    oneOnOne: activeConnections.length,
    groupSessions: activeGroupSessions.length,
    totalParticipants: activeGroupSessions.reduce((sum, session) => 
      sum + (session.currentParticipants?.length || 0), 0
    )
  }), [activeConnections, activeGroupSessions]);

  const sidebar = useMemo(() => <MentorSidebar />, []);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
        <p className="text-gray-600">Manage your mentoring sessions</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-pink-500" />
            <span className="text-sm text-gray-600">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">One-on-One</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.oneOnOne}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <VideoCameraIcon className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-600">Group Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.groupSessions}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Total Participants</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
        </div>
      </motion.div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
      >
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
            {activeConnections.map((connection, index) => (
              <motion.div
                key={connection._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setSelectedSession({ ...connection, type: 'one-on-one' })}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-blue-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
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
                      window.open(`/chat?connection=${connection._id}`, '_blank');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
                  >
                    Start Chat
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Group Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Group Mentoring Sessions</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
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
            {activeGroupSessions.map((session, index) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => setSelectedSession({ ...session, type: 'group' })}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all cursor-pointer border border-purple-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
                        {session.currentParticipants?.length || 0}/{session.maxParticipants} participants
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {session.meetingLink && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(session.meetingLink, '_blank');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
                    >
                      Join Meeting
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className={`sticky top-0 ${selectedSession.type === 'one-on-one' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white p-6 rounded-t-2xl flex justify-between items-center`}>
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
                  <div>
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
                      <div className="grid md:grid-cols-2 gap-3">
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

                  <div>
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-500 rounded"></div>
                      Session Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Description</label>
                        <p className="text-gray-900 font-medium">{selectedSession.description}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
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

                  <div>
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
                      <div className="grid md:grid-cols-2 gap-3">
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

                  <div>
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
                    <div>
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

                  <div>
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
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Schedule;
