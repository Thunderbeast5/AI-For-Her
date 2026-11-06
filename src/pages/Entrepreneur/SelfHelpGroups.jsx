import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import UnifiedChat from '../../components/UnifiedChat';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Clean notification animations
const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

const SelfHelpGroups = () => {
  const { currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // browse, myGroups, requests
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    maxMembers: 10,
    goals: ''
  });

  const getTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  const userId = currentUser?.uid;
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const userEmail = currentUser?.email;

  const sectors = [
    'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
    'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
    'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
    'Education & Training', 'Technology', 'Finance', 'Other'
  ];

  const sectionClass = "p-6 rounded-2xl bg-transparent border border-[#8d4624]/20 transition-all hover:border-[#8d4624]/35 space-y-4";
  const inputClass = "h-11 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] text-stone-900 placeholder:text-stone-400";
  const selectClass = "w-full h-11 rounded-xl border border-[#8d4624]/25 bg-transparent px-3 text-sm text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8d4624] transition-all";

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
      setMessage('Self Help Group created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage('Failed to create group. Please try again.');
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
      setMessage('Group updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating group:', error);
      setMessage('Failed to update group. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleJoinRequest = async (group) => {
    if (!userId) return;

    if (group.members?.includes(userId)) {
      setMessage('You are already a member of this group!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if ((group.members?.length || 0) >= group.maxMembers) {
      setMessage('This group is currently full.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const hasPendingRequest = group.joinRequests?.some(r => r.userId === userId && r.status === 'pending');
    if (hasPendingRequest) {
      setMessage('You already have a pending request for this group.');
      setTimeout(() => setMessage(''), 3000);
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
      setMessage('Join request sent successfully! Awaiting approval.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending join request:', error);
      setMessage('Failed to send request.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleApproveRequest = async (groupId, requestUserId) => {
    try {
      const groupRef = doc(db, 'self-help-groups', groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();
      
      if (!groupData) throw new Error("Group not found.");

      if ((groupData.members?.length || 0) >= groupData.maxMembers) {
        setMessage('Cannot approve: Group is now at maximum capacity.');
        setTimeout(() => setMessage(''), 3000);
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
      setMessage('Request approved! Member added.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error approving request:', error);
      setMessage(`Failed to approve: ${error.message}`);
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
      setMessage('Request rejected.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setMessage('Failed to reject request.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    const groupToLeave = myGroups.find(g => g.id === groupId);
    if (isAdmin(groupToLeave)) {
      alert("As the admin, please delete the group or reassign admin rights before leaving.");
      return;
    }

    try {
      const groupRef = doc(db, 'self-help-groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
      });
      await fetchMyGroups();
      setMessage('You have left the group.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error leaving group:', error);
      setMessage('Failed to leave group.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    try {
      await deleteDoc(doc(db, 'self-help-groups', groupId));
      await fetchAllGroups();
      await fetchMyGroups();
      setMessage('Group deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting group:', error);
      setMessage('Failed to delete group. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      sector: group.sector,
      maxMembers: group.maxMembers,
      goals: group.goals || ''
    });
    setShowEditModal(true);
  };

  const openGroupChat = (group) => {
    setSelectedGroup(group);
    setShowChat(true);
  };

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRequestStatus = (group) => {
    if (!userId) return null;
    const request = group.joinRequests?.find(r => r.userId === userId);
    return request?.status;
  };

  const isAdmin = (group) => group.adminId === userId;
  const isMember = (group) => group.members?.includes(userId);

  const tabs = [
    { id: 'browse', label: 'Browse Groups', icon: MagnifyingGlassIcon },
    { id: 'myGroups', label: `My Circles (${myGroups.length})`, icon: UserGroupIcon },
    ...(userId ? [{ id: 'requests', label: 'Join Requests', icon: ClockIcon, count: joinRequests.length }] : [])
  ];

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
    );
  }

  return (
    <>
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <div className="space-y-6 pb-20">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">My Circles</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{myGroups.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Circles</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{allGroups.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Pending Requests</span>
                <p className="text-2xl font-black text-stone-900 mt-1">{joinRequests.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Tab Navigation with Integrated Create Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-transparent border border-[#8d4624]/20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#8d4624] text-white shadow-xs'
                        : 'text-stone-600 hover:text-[#8d4624] hover:bg-[#8d4624]/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#f5e9dd] text-[#8d4624]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create Circle Button placed alongside navigation */}
            <Button
              onClick={() => {
                setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
                setShowCreateModal(true);
              }}
              className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl shadow-xs gap-1.5 px-4 font-semibold text-xs h-10 w-fit shrink-0 self-end sm:self-auto"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Circle</span>
            </Button>
          </div>

          {/* Tab 1: Browse Groups */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <Input
                  type="text"
                  placeholder="Filter groups by name, sector, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>

              {/* Grid / Loader */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="p-6 rounded-2xl border border-[#8d4624]/20 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-9 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
                  <UserGroupIcon className="w-12 h-12 text-[#8d4624] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-stone-900">No circles match your query</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Start a new peer group or broaden your search criteria.
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-5"
                  >
                    Form a Circle
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => {
                    const memberStatus = isMember(group);
                    const adminStatus = isAdmin(group);
                    const isFull = (group.members?.length || 0) >= group.maxMembers;
                    const requestStatus = getRequestStatus(group);

                    return (
                      <div key={group.id} className={sectionClass}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-stone-900 line-clamp-1">{group.name}</h3>
                            <Badge className="bg-[#f5e9dd] text-[#8d4624] border-none text-[10px] mt-1.5">
                              {group.sector}
                            </Badge>
                          </div>
                          {adminStatus && (
                            <ShieldCheckIcon className="w-5 h-5 text-[#8d4624] shrink-0" title="You are administrator" />
                          )}
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {group.description}
                        </p>

                        {group.goals && (
                          <div className="p-3 rounded-xl border border-[#8d4624]/15 bg-transparent">
                            <span className="text-[10px] font-semibold text-[#8d4624] block uppercase">Goals</span>
                            <p className="text-xs text-stone-700 line-clamp-1 mt-0.5">{group.goals}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-[#8d4624]/10">
                          <div className="flex items-center gap-1.5">
                            <UsersIcon className="w-3.5 h-3.5 text-stone-400" />
                            <span>{group.members?.length || 0}/{group.maxMembers} members</span>
                          </div>
                          <span className="text-[11px] text-stone-400 truncate max-w-[120px]">
                            by {group.adminName}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#8d4624]/10">
                          {memberStatus ? (
                            <Button
                              onClick={() => openGroupChat(group)}
                              className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
                            >
                              Open Chat
                            </Button>
                          ) : isFull ? (
                            <div className="w-full text-center py-2 text-xs font-medium text-stone-400 border border-stone-200 rounded-xl">
                              Group Full
                            </div>
                          ) : requestStatus === 'pending' ? (
                            <div className="w-full text-center py-2 text-xs font-semibold text-[#8d4624] bg-[#f5e9dd] rounded-xl border border-[#8d4624]/20">
                              Request Pending
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleJoinRequest(group)}
                              className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
                            >
                              Request to Join
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Groups */}
          {activeTab === 'myGroups' && (
            <div className="space-y-4">
              {myGroups.length === 0 ? (
                <div className="text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
                  <UserGroupIcon className="w-12 h-12 text-[#8d4624] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-stone-900">You haven't joined any circles yet</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Browse active sector communities to join discussions or initiate your own circle.
                  </p>
                  <Button
                    onClick={() => setActiveTab('browse')}
                    className="mt-4 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-5"
                  >
                    Explore Circles
                  </Button>
                </div>
              ) : (
                myGroups.map((group) => (
                  <div key={group.id} className={sectionClass}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-stone-900">{group.name}</h3>
                          {isAdmin(group) && (
                            <Badge className="bg-[#f5e9dd] text-[#8d4624] border-none text-[10px] gap-1">
                              <ShieldCheckIcon className="w-3 h-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-[10px] mt-1.5">
                          {group.sector}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openGroupChat(group)}
                          className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold px-4"
                        >
                          Open Chat
                        </Button>
                        
                        {isAdmin(group) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGroup(group)}
                              className="rounded-xl h-9 w-9 text-stone-600 hover:text-[#8d4624] hover:bg-[#8d4624]/10"
                              title="Edit Group"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="rounded-xl h-9 w-9 text-stone-600 hover:text-red-600 hover:bg-red-50"
                              title="Delete Group"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {!isAdmin(group) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLeaveGroup(group.id)}
                            className="rounded-xl h-9 w-9 text-stone-600 hover:text-red-600 hover:bg-red-50"
                            title="Leave Circle"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{group.description}</p>

                    {group.goals && (
                      <div className="p-3 rounded-xl border border-[#8d4624]/15 bg-transparent">
                        <span className="text-[10px] font-semibold text-[#8d4624] block uppercase">Goals</span>
                        <p className="text-xs text-stone-700 mt-0.5">{group.goals}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-[#8d4624]/10">
                      <div className="flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5" />
                        <span>{group.members?.length} / {group.maxMembers} members</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Join Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {joinRequests.length === 0 ? (
                <div className="text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
                  <ClockIcon className="w-12 h-12 text-[#8d4624] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-stone-900">No pending join requests</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    When entrepreneurs apply to enter circles where you are administrator, their profiles will appear here.
                  </p>
                </div>
              ) : (
                joinRequests.map((request) => (
                  <div 
                    key={`${request.groupId}-${request.userId}`} 
                    className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{request.userName}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Requests to join <span className="font-semibold text-[#8d4624]">"{request.groupName}"</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-400">
                        <span>{request.userEmail}</span>
                        <span>•</span>
                        <span>Requested {getTimestamp(request.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveRequest(request.groupId, request.userId)}
                        className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs gap-1.5 px-4 font-semibold"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.groupId, request.userId)}
                        className="rounded-xl border-[#8d4624]/25 text-stone-600 hover:text-red-600 hover:bg-red-50 text-xs px-4"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal: Create/Edit Group */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 backdrop-blur-sm bg-stone-900/30 flex items-center justify-center z-50 p-4">
            <div className="rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#8d4624]/20 shadow-xl space-y-5 bg-[#f5e9dd]/95 backdrop-blur-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#8d4624]/15 pb-3">
                <h2 className="text-xl font-bold text-stone-900">
                  {showCreateModal ? 'Form a Self-Help Circle' : 'Edit Circle Settings'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
                  }}
                  className="p-1.5 hover:bg-[#8d4624]/10 rounded-xl transition-colors text-stone-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={showCreateModal ? handleCreateGroup : handleUpdateGroup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-600">Circle Name *</Label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., Women Agritech Innovators"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-600">Industry Sector *</Label>
                  <select
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select industry domain</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-600">Description / Focus Area *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full text-xs rounded-xl border border-[#8d4624]/25 p-3 focus:outline-none focus:ring-1 focus:ring-[#8d4624] bg-transparent"
                    placeholder="Describe collaboration goals, mutual topics, and expectations..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-600">Cohort Milestones / Objectives</Label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    rows={2}
                    className="w-full text-xs rounded-xl border border-[#8d4624]/25 p-3 focus:outline-none focus:ring-1 focus:ring-[#8d4624] bg-transparent"
                    placeholder="e.g., Supply chain sharing, collective raw-material purchasing"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-stone-600">Max Member Capacity *</Label>
                  <Input
                    type="number"
                    required
                    min={editingGroup ? editingGroup.members?.length || 2 : 2}
                    max="50"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 2 })}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-stone-400">
                    {editingGroup 
                      ? `Minimum: ${editingGroup.members?.length || 2} (current members)`
                      : 'Recommended between 5 and 30 founders'
                    }
                  </p>
                </div>

                <div className="flex gap-3 pt-3 border-t border-[#8d4624]/15">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingGroup(null);
                      setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' });
                    }}
                    className="flex-1 rounded-xl text-xs border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
                  >
                    {showCreateModal ? 'Create Circle' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>

      {/* Floating Status Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="selfhelp-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="fixed top-6 right-6 z-50 w-full max-w-sm"
          >
            <div className={`p-4 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md border ${
              message.toLowerCase().includes('success') || message.toLowerCase().includes('approved')
                ? 'bg-[#f5e9dd]/95 text-[#8d4624] border-[#8d4624]/30' 
                : 'bg-red-50/95 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SelfHelpGroups;