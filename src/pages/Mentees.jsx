import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import MentorSidebar from '../components/MentorSidebar';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Mentees = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedMentees, setAcceptedMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch connection requests
  useEffect(() => {
    if (!currentUser) return;

    // Query for pending requests
    const pendingQuery = query(
      collection(db, 'connections'),
      where('mentorId', '==', currentUser.uid),
      where('status', '==', 'pending')
    );

    // Query for accepted connections
    const acceptedQuery = query(
      collection(db, 'connections'),
      where('mentorId', '==', currentUser.uid),
      where('status', '==', 'accepted')
    );

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setPendingRequests(requests);
    });

    const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
      const mentees = [];
      snapshot.forEach((doc) => {
        mentees.push({ id: doc.id, ...doc.data() });
      });
      setAcceptedMentees(mentees);
      setLoading(false);
    });

    return () => {
      unsubscribePending();
      unsubscribeAccepted();
    };
  }, [currentUser]);

  const handleAccept = async (request) => {
    try {
      // Update connection status
      await updateDoc(doc(db, 'connections', request.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });

      // Notify mentee
      await addDoc(collection(db, 'notifications'), {
        userId: request.menteeId,
        title: 'Connection Accepted',
        message: `${currentUser.displayName || 'Your mentor'} has accepted your connection request!`,
        link: '/chat-sessions',
        read: false,
        createdAt: serverTimestamp()
      });

      alert('Connection accepted!');
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Failed to accept connection.');
    }
  };

  const handleReject = async (request) => {
    try {
      // Update connection status
      await updateDoc(doc(db, 'connections', request.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      // Notify mentee
      await addDoc(collection(db, 'notifications'), {
        userId: request.menteeId,
        title: 'Connection Declined',
        message: `Your connection request was declined.`,
        link: '/mentors',
        read: false,
        createdAt: serverTimestamp()
      });

      alert('Connection rejected.');
    } catch (error) {
      console.error('Error rejecting connection:', error);
      alert('Failed to reject connection.');
    }
  };
  
  const mockMentees = [
    {
      id: 1,
      name: 'Priya Sharma',
      business: 'Fashion Startup',
      lastContact: '2 days ago',
      status: 'active',
      sessionsCompleted: 5,
      nextSession: 'Tomorrow, 3:00 PM'
    },
    {
      id: 2,
      name: 'Anjali Verma',
      business: 'Food Tech',
      lastContact: '5 days ago',
      status: 'active',
      sessionsCompleted: 3,
      nextSession: 'Next Week'
    },
    {
      id: 3,
      name: 'Meera Patel',
      business: 'EdTech Platform',
      lastContact: '1 week ago',
      status: 'pending',
      sessionsCompleted: 1,
      nextSession: 'Not Scheduled'
    }
  ];

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
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
        className="grid md:grid-cols-3 gap-6 mb-8"
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
            <ClockIcon className="w-6 h-6 text-orange-500" />
            <span className="text-sm text-gray-600">Pending Requests</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Active Chats</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{acceptedMentees.length}</p>
        </div>
      </motion.div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Connection Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{request.menteeName?.charAt(0) || 'M'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.menteeName || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-600">{request.menteeStartup || 'Startup'}</p>
                    <p className="text-xs text-gray-500">{request.menteeSector || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    title="Accept"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

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
                key={mentee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{mentee.menteeName?.charAt(0) || 'M'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mentee.menteeName || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-600">{mentee.menteeStartup || 'Startup'}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">{mentee.menteeSector || 'N/A'}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate('/chat-sessions')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Start chat"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Send email">
                      <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Mentees;
