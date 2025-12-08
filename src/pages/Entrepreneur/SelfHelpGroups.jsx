import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import GroupChatInterface from '../../components/GroupChatInterface'
import { useAuth } from '../../context/AuthContext'
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
} from '@heroicons/react/24/outline'

const SelfHelpGroups = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    maxMembers: 10,
    goals: ''
  })

  const userId = localStorage.getItem('userId')
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
      const response = await fetch('http://localhost:5000/api/self-help-groups')
      const data = await response.json()
      setAllGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  // Fetch my groups
  const fetchMyGroups = async () => {
    if (!userId) return
    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/user/${userId}`)
      const data = await response.json()
      setMyGroups(data)
    } catch (error) {
      console.error('Error fetching my groups:', error)
    }
  }

  // Fetch join requests for groups I admin
  const fetchJoinRequests = async () => {
    if (!userId) return
    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/admin/${userId}/requests`)
      const data = await response.json()
      setJoinRequests(data)
    } catch (error) {
      console.error('Error fetching join requests:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAllGroups(), fetchMyGroups(), fetchJoinRequests()])
      setLoading(false)
    }
    loadData()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchAllGroups()
      fetchMyGroups()
      fetchJoinRequests()
    }, 10000)

    return () => clearInterval(interval)
  }, [userId])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!userId) return

    try {
      const response = await fetch('http://localhost:5000/api/self-help-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          userName,
          userEmail
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' })
        await fetchAllGroups()
        await fetchMyGroups()
        alert('Self Help Group created successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group. Please try again.')
    }
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    if (!editingGroup || !userId) return

    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/${editingGroup._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId: userId
        })
      })

      if (response.ok) {
        setShowEditModal(false)
        setEditingGroup(null)
        setFormData({ name: '', description: '', sector: '', maxMembers: 10, goals: '' })
        await fetchAllGroups()
        await fetchMyGroups()
        alert('Group updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update group')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      alert('Failed to update group')
    }
  }

  const handleJoinRequest = async (group) => {
    if (!userId) return

    // Check if already a member
    if (group.members?.some(m => m.userId === userId)) {
      alert('You are already a member of this group!')
      return
    }

    // Check if group is full
    if (group.members?.length >= group.maxMembers) {
      alert('This group is full!')
      return
    }

    // Check if request already exists
    const hasPendingRequest = group.joinRequests?.some(
      r => r.userId === userId && r.status === 'pending'
    )
    if (hasPendingRequest) {
      alert('You already have a pending request for this group!')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/${group._id}/join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userEmail })
      })

      if (response.ok) {
        await fetchAllGroups()
        alert('Join request sent successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error sending join request:', error)
      alert('Failed to send request')
    }
  }

  const handleApproveRequest = async (groupId, requestUserId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/self-help-groups/${groupId}/join-request/${requestUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved', adminId: userId })
        }
      )

      if (response.ok) {
        await fetchAllGroups()
        await fetchMyGroups()
        await fetchJoinRequests()
        alert('Request approved!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    }
  }

  const handleRejectRequest = async (groupId, requestUserId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/self-help-groups/${groupId}/join-request/${requestUserId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected', adminId: userId })
        }
      )

      if (response.ok) {
        await fetchJoinRequests()
        alert('Request rejected')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request')
    }
  }

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        await fetchMyGroups()
        alert('You have left the group')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to leave group')
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      alert('Failed to leave group')
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return

    try {
      const response = await fetch(`http://localhost:5000/api/self-help-groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: userId })
      })

      if (response.ok) {
        await fetchAllGroups()
        await fetchMyGroups()
        alert('Group deleted successfully')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('Failed to delete group')
    }
  }

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

  const isAdmin = (group) => group.adminId === userId
  const isMember = (group) => group.members?.some(m => m.userId === userId)

  if (showChat && selectedGroup) {
    return (
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowChat(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="w-6 h-6" />
              <span>Back to Groups</span>
            </button>
            <div className="text-center flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h2>
              <p className="text-sm text-gray-600">{selectedGroup.members?.length} members</p>
            </div>
            <div className="w-24"></div>
          </div>
          <GroupChatInterface 
            groupId={selectedGroup._id}
            groupType="self-help"
            currentUser={{ userId, name: userName }}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Self Help Groups</h1>
            <p className="text-gray-600">Connect, collaborate, and grow together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Group</span>
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <UserGroupIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{myGroups.length}</p>
          </div>
          <p className="text-sm opacity-90">My Groups</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <UsersIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{allGroups.length}</p>
          </div>
          <p className="text-sm opacity-90">Total Groups</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-10 h-10 opacity-80" />
            <p className="text-3xl font-bold">{joinRequests.length}</p>
          </div>
          <p className="text-sm opacity-90">Pending Requests</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'browse'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
          Browse Groups
        </button>
        <button
          onClick={() => setActiveTab('myGroups')}
          className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'myGroups'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserGroupIcon className="w-5 h-5 inline mr-2" />
          My Groups ({myGroups.length})
        </button>
        {joinRequests.length > 0 && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClockIcon className="w-5 h-5 inline mr-2" />
            Join Requests
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center animate-pulse">
              {joinRequests.length}
            </span>
          </button>
        )}
      </div>

      {/* Browse Groups Tab */}
      {activeTab === 'browse' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
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
                const isFull = group.members?.length >= group.maxMembers
                const requestStatus = getRequestStatus(group)

                return (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{group.name}</h3>
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-semibold rounded-full">
                          {group.sector}
                        </span>
                      </div>
                      {adminStatus && (
                        <ShieldCheckIcon className="w-6 h-6 text-blue-500" title="You are admin" />
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                    {group.goals && (
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-700 mb-1">Goals:</p>
                        <p className="text-sm text-blue-900 line-clamp-2">{group.goals}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <UsersIcon className="w-4 h-4" />
                        <span>{group.members?.length || 0}/{group.maxMembers}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        by {group.adminName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {memberStatus ? (
                        <button
                          onClick={() => openGroupChat(group)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
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
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                        >
                          Request to Join
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* My Groups Tab */}
      {activeTab === 'myGroups' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {myGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <UserGroupIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">You haven't joined any groups yet</p>
              <p className="text-sm text-gray-500 mt-2">Browse groups and join one to get started!</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Browse Groups
              </button>
            </div>
          ) : (
            myGroups.map((group) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                      {isAdmin(group) && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center space-x-1">
                          <ShieldCheckIcon className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-semibold rounded-full">
                      {group.sector}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{group.description}</p>

                {group.goals && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Goals:</p>
                    <p className="text-sm text-blue-900">{group.goals}</p>
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
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                    
                    {isAdmin(group) && (
                      <>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit Group"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Group"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {!isAdmin(group) && (
                      <button
                        onClick={() => handleLeaveGroup(group._id)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                        title="Leave Group"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Join Requests Tab */}
      {activeTab === 'requests' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
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
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{request.name}</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      wants to join <span className="font-semibold text-pink-600">"{request.groupName}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{request.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Requested {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveRequest(request.groupId, request.userId)}
                      className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center space-x-2 shadow-md"
                      title="Approve"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span className="font-medium">Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.groupId, request.userId)}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all flex items-center space-x-2 shadow-md"
                      title="Reject"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span className="font-medium">Reject</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Create/Edit Group Modals */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showCreateModal ? 'Create Self Help Group' : 'Edit Group'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingGroup(null)
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
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
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
                  >
                    {showCreateModal ? 'Create Group' : 'Update Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default SelfHelpGroups
