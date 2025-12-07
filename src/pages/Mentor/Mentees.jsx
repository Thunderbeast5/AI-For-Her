import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import PersonalChatInterface from '../../components/PersonalChatInterface';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { connectionsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Mentees = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [acceptedMentees, setAcceptedMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);
  
  // Fetch connection requests
  useEffect(() => {
    if (!currentUser) return;

    const fetchConnections = async () => {
      try {
        const response = await connectionsApi.getByUser(currentUser.userId, 'mentor')
        // Handle both response formats: { success, data } or direct array
        const connections = response?.data || response || []
        const connectionsArray = Array.isArray(connections) ? connections : []
        
        // Get only accepted/active mentees
        const accepted = connectionsArray.filter(conn => conn.status === 'active')
        
        setAcceptedMentees(accepted)
      } catch (error) {
        console.error('Error fetching connections:', error)
        setPendingRequests([])
        setAcceptedMentees([])
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [currentUser])

  const handleAcceptRequest = async (connectionId) => {
    if (!window.confirm('Accept this connection request? The entrepreneur will be prompted to complete payment before chatting.')) {
      return;
    }
    
    try {
      // Use the accept endpoint which keeps status as 'pending' until payment
      await connectionsApi.accept(connectionId)
      
      // Refresh connections
      const response = await connectionsApi.getByUser(currentUser.userId, 'mentor')
      const connections = response?.data || response || []
      const connectionsArray = Array.isArray(connections) ? connections : []
      
      const accepted = connectionsArray.filter(conn => conn.status === 'active')
      
      setAcceptedMentees(accepted)
      alert('Connection accepted! The entrepreneur will be notified to complete payment.')
    } catch (error) {
      console.error('Error accepting connection:', error)
      alert('Failed to accept connection.')
    }
  }

  const handleRejectRequest = async (connectionId) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled
    
    try {
      // Use the reject endpoint
      await connectionsApi.reject(connectionId, reason)
      
      // Refresh connections
      const response = await connectionsApi.getByUser(currentUser.userId, 'mentor')
      const connections = response?.data || response || []
      const connectionsArray = Array.isArray(connections) ? connections : []
      
      const accepted = connectionsArray.filter(conn => conn.status === 'active')
      
      setAcceptedMentees(accepted)
      alert('Connection request rejected.')
    } catch (error) {
      console.error('Error rejecting connection:', error)
      alert('Failed to reject connection.')
    }
  }

  const sidebar = useMemo(() => <MentorSidebar />, [])

  return (
    <DashboardLayout sidebar={sidebar}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentees</h1>
        <p className="text-gray-600">Manage and track your mentee relationships</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">Total Mentees</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{acceptedMentees.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Active Chats</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{acceptedMentees.length}</p>
        </div>
      </motion.div>

      {/* Mentees List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Connected Mentees</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : acceptedMentees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No connected mentees yet</p>
            <p className="text-sm mt-2">Accept connection requests to start mentoring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedMentees.map((mentee, index) => (
              <motion.div
                key={mentee._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {(mentee.entrepreneurName || mentee.entrepreneurEmail)?.charAt(0).toUpperCase() || 'E'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {mentee.entrepreneurName || mentee.entrepreneurEmail?.split('@')[0] || 'Entrepreneur'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {mentee.entrepreneurId?.company || mentee.entrepreneurId?.startup || 'Entrepreneur'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500 flex items-center">
                        <EnvelopeIcon className="w-3 h-3 mr-1" />
                        {mentee.entrepreneurEmail || 'No email'}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedConnection(mentee)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Start chat"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => window.location.href = `mailto:${mentee.entrepreneurEmail}`}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors" 
                      title="Send email"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Personal Chat Modal */}
      {selectedConnection && (
        <PersonalChatInterface
          connection={selectedConnection}
          currentUser={{
            userId: currentUser.userId,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Mentor'
          }}
          userRole="mentor"
          onClose={() => setSelectedConnection(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Mentees;
