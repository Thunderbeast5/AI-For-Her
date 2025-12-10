import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import UnifiedChat from '../../components/UnifiedChat';

const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export default function MyGroups() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // unified chat
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchMyGroups = useCallback(async () => {
    try {
      const q = query(collection(db, 'mentorGroups'), where('mentorId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const groups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyGroups(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMyGroups([]);
      setMessage('Failed to load groups. Please try again.');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchMyGroups();
    }
  }, [currentUser, fetchMyGroups]);

  const handleOpenGroupChat = (group) => {
    // Use unified chat just like entrepreneur free groups
    setActiveChat({
      type: 'group',
      id: group.id,
      groupType: 'mentor',
      groupName: group.groupName,
    });
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(groupId);
    try {
      await deleteDoc(doc(db, 'mentorGroups', groupId));
      setMessage('Group deleted successfully (success)');
      setTimeout(() => setMessage(''), 3000);
      fetchMyGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      setMessage('Failed to delete group: ' + error.message);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (groupId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const groupRef = doc(db, 'mentorGroups', groupId);
      await updateDoc(groupRef, { status: newStatus });
      setMessage(`Group ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully (success)`);
      setTimeout(() => setMessage(''), 3000);
      fetchMyGroups();
    } catch (error) {
      console.error('Error updating group status:', error);
      setMessage('Failed to update group status');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  if (activeChat) {
    return (
      <DashboardLayout sidebar={<MentorSidebar />}>
        <UnifiedChat
          chatInfo={activeChat}
          currentUser={currentUser}
          onBack={() => setActiveChat(null)}
          userRole="mentor"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Groups</h1>
            <p className="text-gray-600">Manage your Telegram-style groups</p>
          </div>
          <button
            onClick={() => navigate('/mentor/create-group')}
            className={` text-white px-6 py-3 rounded-lg transition font-medium flex items-center space-x-2 ${primaryButtonClass}`}
          >
            
            <span>Create New Group</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : myGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Groups Yet</h2>
            <p className="text-gray-500 mb-6">Create your first Telegram-style group to connect with entrepreneurs</p>
            <button
              onClick={() => navigate('/mentor/create-group')}
            className={` text-white px-6 py-3 rounded-lg transition font-medium flex items-center space-x-2 ${primaryButtonClass}`}
            >
             
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                {/* Group Image */}
                {group.groupImage ? (
                  <img 
                    src={group.groupImage} 
                    alt={group.groupName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-linear-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">
                      {group.groupName?.charAt(0) || 'G'}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{group.groupName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      group.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {group.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Participants:</span>
                      <span className="font-semibold text-gray-800">
                        {(group.participants?.length || 0)}/{group.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Sector:</span>
                      <span className="font-medium text-gray-700">{group.sector}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Language:</span>
                      <span className="font-medium text-gray-700">{group.language}</span>
                    </div>
                  </div>

                  {/* Topics */}
                  {group.topics && group.topics.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {group.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                        {group.topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{group.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleOpenGroupChat(group)}
                      className={`w-full  text-white py-2 rounded-lg  transition font-medium flex items-center justify-center space-x-2 ${primaryButtonClass}`}
                    >
                      
                      <span>Open Chat</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleStatus(group.id, group.status)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        {group.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id, group.groupName)}
                        disabled={deletingId === group.id}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === group.id ? '' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="mygroups-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-60 w-full max-w-sm"
          >
            <div className={`p-4 rounded-lg shadow-lg text-sm font-medium ${
              message.includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
