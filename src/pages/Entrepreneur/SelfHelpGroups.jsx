import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import UnifiedChat from '../../components/UnifiedChat';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, arrayUnion, arrayRemove, deleteDoc, getDoc } from 'firebase/firestore';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// --- Reusable Pink Styles ---
const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

// Toast animation variants (same as Profile)
const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

// ----------------------------

const SelfHelpGroups = () => {
  const { currentUser } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [allGroups, setAllGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('browse') // browse, myGroups, requests
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    maxMembers: 10,
    goals: ''
  })

  // Helper function to safely get date string from Firestore Timestamp
  const getTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    // Fallback for fields that might already be plain Date objects or strings
    return new Date(timestamp);
  }

  const userId = currentUser?.uid;
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'
  const userEmail = currentUser?.email

  const sectors = [
    'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
    'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
    'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
    'Education & Training', 'Technology', 'Finance', 'Other'
  ]

  // Fetch all groups
  const fetchAllGroups = async () => {
    try {
      const groupsQuery = query(collection(db, 'self-help-groups'));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch my groups
  const fetchMyGroups = useCallback(async () => {
    if (!userId) return;
    try {
      const groupsQuery = query(collection(db, 'self-help-groups'), where('members', 'array-contains', userId));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyGroups(groupsData);
    } catch (error) {
      console.error('Error fetching my groups:', error);
    }
  }, [userId]);

  // Fetch join requests for groups I admin
  const fetchJoinRequests = useCallback(async () => {
    if (!userId) return;
    try {
      const groupsQuery = query(collection(db, 'self-help-groups'), where('adminId', '==', userId));
      const groupsSnapshot = await getDocs(groupsQuery);
      const requests = [];
      groupsSnapshot.forEach(doc => {
        const group = { id: doc.id, ...doc.data() };
        if (group.joinRequests && Array.isArray(group.joinRequests)) {
          group.joinRequests.forEach(req => {
            if (req.status === 'pending') {
              requests.push({ 
                ...req, 
                groupId: group.id, 
                groupName: group.name,
                // Ensure name and email are used from the request object if available
                userName: req.userName,
                userEmail: req.userEmail,
                requestedAt: req.requestedAt
              });
            }
          });
        }
      });
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (userId) {
        await Promise.all([fetchAllGroups(), fetchMyGroups(), fetchJoinRequests()]);
      } else {
        await fetchAllGroups();
      }
      setLoading(false);
    };
    loadData();

    // Set up polling for real-time updates (every 10 seconds)
    const interval = setInterval(() => {
      fetchAllGroups();
      if (userId) {
        fetchMyGroups();
        fetchJoinRequests();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, fetchMyGroups, fetchJoinRequests]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!userId || !formData.sector) return;

    try {
      await addDoc(collection(db, 'self-help-groups'), {
        ...formData,
        adminId: userId,
        adminName: userName,
        adminEmail: userEmail,
        members: [userId],
        joinRequests: [],
        createdAt: new Date(),
      });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
      await fetchAllGroups();
      await fetchMyGroups();
      setMessage('Self Help Group created successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage('Failed to create group. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup || !userId || !formData.sector) return;

    try {
      const groupRef = doc(db, 'self-help-groups', editingGroup.id);
      await updateDoc(groupRef, {
        name: formData.name,
        description: formData.description,
        sector: formData.sector,
        maxMembers: formData.maxMembers,
        goals: formData.goals,
      });
      setShowEditModal(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
      await fetchAllGroups();
      await fetchMyGroups();
      setMessage('Group updated successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating group:', error);
      setMessage('Failed to update group. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleJoinRequest = async (group) => {
    if (!userId) return;

    if (group.members?.includes(userId)) {
      alert('You are already a member of this group!');
      return;
    }

    if ((group.members?.length || 0) >= group.maxMembers) {
      alert('This group is full!');
      return;
    }

    const hasPendingRequest = group.joinRequests?.some(r => r.userId === userId && r.status === 'pending');
    if (hasPendingRequest) {
      alert('You already have a pending request for this group!');
      return;
    }

    try {
      const groupRef = doc(db, 'self-help-groups', group.id);
      await updateDoc(groupRef, {
        joinRequests: arrayUnion({
          userId,
          userName,
          userEmail,
          status: 'pending',
          requestedAt: new Date(),
        }),
      });
      await fetchAllGroups();
      setMessage('Join request sent successfully! Awaiting admin approval.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending join request:', error);
      setMessage('Failed to send request');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleApproveRequest = async (groupId, requestUserId) => {
    try {
      const groupRef = doc(db, 'self-help-groups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();
      
      if (!groupData) throw new Error("Group not found.");

      // Check if group is full before approving
      if ((groupData.members?.length || 0) >= groupData.maxMembers) {
        alert('Cannot approve: This group is now full.');
        return;
      }
      
      const updatedJoinRequests = groupData.joinRequests?.map(req => 
        req.userId === requestUserId ? { ...req, status: 'approved' } : req
      ) || [];
      
      await updateDoc(groupRef, {
        joinRequests: updatedJoinRequests,
        members: arrayUnion(requestUserId),
      });
      await fetchAllGroups();
      await fetchMyGroups();
      await fetchJoinRequests();
      setMessage('Request approved! User added to the group.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error approving request:', error);
      setMessage(`Failed to approve request: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleRejectRequest = async (groupId, requestUserId) => {
    try {
      const groupRef = doc(db, 'self-help-groups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();

      const updatedJoinRequests = groupData.joinRequests?.map(req => 
        req.userId === requestUserId ? { ...req, status: 'rejected' } : req
      ) || [];
      
      await updateDoc(groupRef, {
        joinRequests: updatedJoinRequests,
      });
      await fetchJoinRequests();
      setMessage('Request rejected');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setMessage('Failed to reject request');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    const groupToLeave = myGroups.find(g => g.id === groupId);
    if (isAdmin(groupToLeave)) {
        alert("As the admin, you must delete the group or transfer admin rights before leaving.");
        return;
    }

    try {
      const groupRef = doc(db, 'self-help-groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      });
      await fetchMyGroups();
      setMessage('You have left the group');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error leaving group:', error);
      setMessage('Failed to leave group');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'self-help-groups', groupId));
      await fetchAllGroups();
      await fetchMyGroups();
      setMessage('Group deleted successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting group:', error);
      setMessage('Failed to delete group. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      sector: group.sector,
      maxMembers: group.maxMembers,
      goals: group.goals || ''
    })
    setShowEditModal(true)
  }

  const openGroupChat = (group) => {
    setSelectedGroup(group)
    setShowChat(true)
  }

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRequestStatus = (group) => {
    if (!userId) return null
    const request = group.joinRequests?.find(r => r.userId === userId)
    return request?.status
  }

  const isAdmin = (group) => group.adminId === userId;
  const isMember = (group) => group.members?.includes(userId);

  if (showChat && selectedGroup) {
    return (
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <UnifiedChat
          chatInfo={{
            type: 'group',
            id: selectedGroup.id,
            groupType: 'self-help',
            groupName: selectedGroup.name,
            membersCount: selectedGroup.members?.length || 0,
          }}
          currentUser={currentUser}
          onBack={() => setShowChat(false)}
        />
      </DashboardLayout>
    )
  }

  return (
    <>
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Self Help Groups</h1>
            <p className="text-gray-600">Connect, collaborate, and grow together</p>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
              setShowCreateModal(true);
            }}
            className={`flex items-center space-x-2 px-6 py-3 ${primaryButtonClass}`}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* My Groups Stat (Pink Gradient) */}
        <div className={`rounded-2xl p-6 shadow-lg text-white ${pinkGradient}`}>
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{myGroups.length}</p>
          </div>
          <p className="text-sm opacity-90">My Groups</p>
        </div>

        {/* Total Groups Stat (Pink Gradient) */}
        <div className={`rounded-2xl p-6 shadow-lg text-white ${pinkGradient}`}>
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{allGroups.length}</p>
          </div>
          <p className="text-sm opacity-90">Total Groups</p>
        </div>

        {/* Pending Requests Stat (Pink Gradient - adjusted for requests emphasis) */}
        <div className={`rounded-2xl p-6 shadow-lg text-white ${pinkGradient}`}>
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{joinRequests.length}</p>
          </div>
          <p className="text-sm opacity-90">Pending Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'browse'
              ? `${pinkGradient} text-white shadow-lg`
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
          }`}
        >
          <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
          Browse Groups
        </button>
        <button
          onClick={() => setActiveTab('myGroups')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'myGroups'
              ? `${pinkGradient} text-white shadow-lg`
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
          }`}
        >
          <UserGroupIcon className="w-5 h-5 inline mr-2" />
          My Groups ({myGroups.length})
        </button>
        {userId && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'requests'
                ? `${pinkGradient} text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
            }`}
          >
            <ClockIcon className="w-5 h-5 inline mr-2" />
            Join Requests
            {joinRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center animate-pulse">
                {joinRequests.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Browse Groups Tab */}
      {activeTab === 'browse' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups by name, sector, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4">Loading groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserGroupIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No groups found</p>
              <p className="text-sm mt-2">Be the first to create a group!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const memberStatus = isMember(group)
                const adminStatus = isAdmin(group)
                const isFull = (group.members?.length || 0) >= group.maxMembers
                const requestStatus = getRequestStatus(group)

                return (
                  <div key={group.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{group.name}</h3>
                        <span className="inline-block px-3 py-1 bg-linear-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-semibold rounded-full">
                          {group.sector}
                        </span>
                      </div>
                      {adminStatus && (
                        <ShieldCheckIcon className="w-6 h-6 text-pink-500" title="You are admin" />
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                    {group.goals && (
                      <div className="mb-4 bg-pink-50 p-3 rounded-lg border border-pink-200">
                        <p className="text-xs font-medium text-pink-700 mb-1">Goals:</p>
                        <p className="text-sm text-pink-900 line-clamp-2">{group.goals}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <UsersIcon className="w-4 h-4" />
                        <span>{group.members?.length || 0}/{group.maxMembers} members</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        by {group.adminName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {memberStatus ? (
                        <button
                          onClick={() => openGroupChat(group)}
                          className={`flex-1 px-4 py-2 ${primaryButtonClass} transition-all flex items-center justify-center space-x-2`}
                        >
                          {/* <ChatBubbleLeftRightIcon className="w-4 h-4" /> */}
                          <span>Open Chat</span>
                        </button>
                      ) : isFull ? (
                        <span className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg text-center">
                          Group Full
                        </span>
                      ) : requestStatus === 'pending' ? (
                        <span className="flex-1 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg text-center">
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoinRequest(group)}
                          className={`flex-1 px-4 py-2 text-sm ${primaryButtonClass}`}
                        >
                          Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* My Groups Tab */}
      {activeTab === 'myGroups' && (
        <div className="space-y-4">
          {myGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <UserGroupIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">You haven't joined any groups yet</p>
              <p className="text-sm text-gray-500 mt-2">Browse groups and join one to get started!</p>
              <button
                onClick={() => setActiveTab('browse')}
                className={`mt-4 px-6 py-2 ${primaryButtonClass}`}
              >
                Browse Groups
              </button>
            </div>
          ) : (
            myGroups.map((group) => (
              <div key={group.id} className="bg-white border-2 border-pink-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      {isAdmin(group) && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full flex items-center space-x-1">
                          <ShieldCheckIcon className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1 bg-linear-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-semibold rounded-full">
                      {group.sector}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{group.description}</p>

                {group.goals && (
                  <div className="mb-4 bg-pink-50 p-3 rounded-lg border border-pink-200">
                    <p className="text-xs font-medium text-pink-700 mb-1">Goals:</p>
                    <p className="text-sm text-pink-900">{group.goals}</p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-4 h-4" />
                      <span>{group.members?.length} / {group.maxMembers} members</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openGroupChat(group)}
                      className={`px-4 py-2 ${primaryButtonClass} transition-all flex items-center space-x-2`}
                    >
                      {/* <ChatBubbleLeftRightIcon className="w-4 h-4" /> */}
                      <span>Chat</span>
                    </button>
                    
                    {isAdmin(group) && (
                      <>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                          title="Edit Group"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Group"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {!isAdmin(group) && (
                      <button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Leave Group"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Join Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <ClockIcon className="w-7 h-7 text-orange-500" />
            <span>Join Requests for Your Groups</span>
          </h2>
          {joinRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No pending requests</p>
              <p className="text-sm mt-2">When entrepreneurs request to join your groups, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={`${request.groupId}-${request.userId}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-linear-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-all">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <h3 className="font-bold text-gray-900 text-lg">{request.userName}</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      wants to join <span className="font-semibold text-pink-600">"{request.groupName}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{request.userEmail}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested {getTimestamp(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveRequest(request.groupId, request.userId)}
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center space-x-2 shadow-md text-sm"
                      title="Approve"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span className="font-medium hidden sm:inline">Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.groupId, request.userId)}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center space-x-2 shadow-md text-sm"
                      title="Reject"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span className="font-medium hidden sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Group Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showCreateModal ? 'Create Self Help Group' : 'Edit Group'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setEditingGroup(null)
                  setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={showCreateModal ? handleCreateGroup : handleUpdateGroup} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  placeholder="e.g., Women Tech Founders Circle"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sector *
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select sector</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  placeholder="Describe the purpose and focus of your group..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                  placeholder="What are the main goals and objectives of this group?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  required
                  min={editingGroup ? editingGroup.members?.length || 2 : 2}
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingGroup 
                    ? `Minimum: ${editingGroup.members?.length || 2} (current members)`
                    : 'Between 2 and 50 members'
                  }
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingGroup(null)
                    setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 ${primaryButtonClass}`}
                >
                  {showCreateModal ? 'Create Group' : 'Update Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>

    {/* Toast Notification */}
    <AnimatePresence>
      {message && (
        <motion.div
          key="selfhelp-toast"
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-9999 w-full max-w-sm"
        >
          <div className={`p-4 rounded-lg shadow-xl text-sm font-medium border ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

export default SelfHelpGroups