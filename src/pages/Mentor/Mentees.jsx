import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import UnifiedChat from '../../components/UnifiedChat';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Mentees = () => {
    const { currentUser } = useAuth();
  const [acceptedMentees, setAcceptedMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchConnections = async () => {
      try {
        const connectionsQuery = query(collection(db, 'connections'), where('mentorId', '==', currentUser.uid), where('status', '==', 'active'));
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const accepted = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAcceptedMentees(accepted);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setAcceptedMentees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [currentUser]);

  
  
  const sidebar = useMemo(() => <MentorSidebar />, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mentees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (selectedConnection) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <UnifiedChat
          chatInfo={{
            type: 'personal',
            id: selectedConnection.id,
            otherPersonName:
              selectedConnection.entrepreneurName ||
              selectedConnection.entrepreneurEmail?.split('@')[0] ||
              'Entrepreneur',
          }}
          currentUser={{
            uid: currentUser.uid,
            name:
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'Mentor',
          }}
          onBack={() => setSelectedConnection(null)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentees</h1>
        <p className="text-gray-600">Manage and track your mentee relationships</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Connected Mentees</h2>
        {acceptedMentees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No connected mentees yet</p>
            <p className="text-sm mt-2">Accept connection requests to start mentoring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedMentees.map((mentee) => (
              <div key={mentee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-linear-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
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
              </div>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};

export default Mentees;
