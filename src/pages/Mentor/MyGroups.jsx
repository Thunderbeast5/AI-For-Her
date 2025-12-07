import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import mentorGroupsApi from '../../api/mentorGroups';
import groupChatsApi from '../../api/groupChats';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import GroupChatInterface from '../../components/GroupChatInterface';

export default function MyGroups() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyGroups();
  }, [currentUser]);

  const fetchMyGroups = async () => {
    try {
      if (currentUser?.userId) {
        const data = await mentorGroupsApi.getByMentor(currentUser.userId);
        setMyGroups(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGroupChat = (group) => {
    setSelectedGroupChat({
      groupId: group._id,
      groupName: group.groupName
    });
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(groupId);
    try {
      await mentorGroupsApi.delete(groupId, currentUser.userId);
      alert('Group deleted successfully');
      fetchMyGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (groupId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await mentorGroupsApi.update(groupId, { status: newStatus });
      alert(`Group ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchMyGroups();
    } catch (error) {
      console.error('Error updating group status:', error);
      alert('Failed to update group status');
    }
  };

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
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                {/* Group Image */}
                {group.groupImage ? (
                  <img 
                    src={group.groupImage} 
                    alt={group.groupName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
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
                        {group.currentParticipants?.length || 0}/{group.maxParticipants}
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
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Open Chat</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleStatus(group._id, group.status)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        {group.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group._id, group.groupName)}
                        disabled={deletingId === group._id}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === group._id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Chat Interface */}
        {selectedGroupChat && (
          <GroupChatInterface
            groupId={selectedGroupChat.groupId}
            groupName={selectedGroupChat.groupName}
            currentUser={{
              userId: currentUser.userId,
              name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
            }}
            onClose={() => setSelectedGroupChat(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
