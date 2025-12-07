import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { useAuth } from '../../context/AuthContext'
import { connectionsApi } from '../../api'
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const SelfHelpGroups = () => {
  const { currentUser } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [allGroups, setAllGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('browse') // browse, myGroups, pending
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    maxMembers: 10,
    goals: ''
  })

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Food & Beverage', 
    'Fashion', 'Finance', 'Manufacturing', 'Services', 'Other'
  ]

  // Fetch all groups
  useEffect(() => {
    const groupsQuery = query(collection(db, 'shg'))
    
    const unsubscribe = onSnapshot(groupsQuery, (snapshot) => {
      const groupsList = []
      snapshot.forEach((doc) => {
        groupsList.push({ id: doc.id, ...doc.data() })
      })
      setAllGroups(groupsList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch my groups
  useEffect(() => {
    if (!currentUser) return

    const myGroupsQuery = query(
      collection(db, 'shg'),
      where('members', 'array-contains', currentUser.uid)
    )

    const unsubscribe = onSnapshot(myGroupsQuery, (snapshot) => {
      const groupsList = []
      snapshot.forEach((doc) => {
        groupsList.push({ id: doc.id, ...doc.data() })
      })
      setMyGroups(groupsList)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Fetch pending requests
  useEffect(() => {
    if (!currentUser) return

    const requestsQuery = query(
      collection(db, 'shgRequests'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList = []
      snapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() })
      })
      setPendingRequests(requestsList)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      await addDoc(collection(db, 'shg'), {
        name: formData.name,
        description: formData.description,
        sector: formData.sector,
        maxMembers: parseInt(formData.maxMembers),
        goals: formData.goals,
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || 'Anonymous',
        members: [currentUser.uid],
        memberDetails: [{
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
          joinedAt: new Date().toISOString()
        }],
        createdAt: serverTimestamp()
      })

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        title: 'SHG Created',
        message: `You successfully created "${formData.name}" group!`,
        link: '/shg',
        read: false,
        createdAt: serverTimestamp()
      })

      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        sector: '',
        maxMembers: 10,
        goals: ''
      })
      alert('Self Help Group created successfully!')
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group. Please try again.')
    }
  }

  const handleJoinRequest = async (group) => {
    if (!currentUser) return

    // Check if already a member
    if (group.members?.includes(currentUser.uid)) {
      alert('You are already a member of this group!')
      return
    }

    // Check if group is full
    if (group.members?.length >= group.maxMembers) {
      alert('This group is full!')
      return
    }

    // Check if request already exists
    const existingRequest = pendingRequests.find(req => req.groupId === group.id)
    if (existingRequest) {
      alert('You already have a pending request for this group!')
      return
    }

    try {
      // Create join request
      await addDoc(collection(db, 'shgRequests'), {
        groupId: group.id,
        groupName: group.name,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      // Notify group creator
      await addDoc(collection(db, 'notifications'), {
        userId: group.createdBy,
        title: 'New SHG Join Request',
        message: `${currentUser.displayName || 'Someone'} wants to join "${group.name}"`,
        link: '/shg',
        read: false,
        createdAt: serverTimestamp()
      })

      alert('Join request sent successfully!')
    } catch (error) {
      console.error('Error sending join request:', error)
      alert('Failed to send request. Please try again.')
    }
  }

  const handleApproveRequest = async (request) => {
    try {
      const groupRef = doc(db, 'shg', request.groupId)
      
      // Add member to group
      await updateDoc(groupRef, {
        members: arrayUnion(request.userId),
        memberDetails: arrayUnion({
          uid: request.userId,
          name: request.userName,
          email: request.userEmail,
          joinedAt: new Date().toISOString()
        })
      })

      // Update request status
      await updateDoc(doc(db, 'shgRequests', request.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      })

      // Notify user
      await addDoc(collection(db, 'notifications'), {
        userId: request.userId,
        title: 'SHG Request Approved',
        message: `Your request to join "${request.groupName}" has been approved!`,
        link: '/shg',
        read: false,
        createdAt: serverTimestamp()
      })

      alert('Request approved!')
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request.')
    }
  }

  const handleRejectRequest = async (request) => {
    try {
      await updateDoc(doc(db, 'shgRequests', request.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      })

      // Notify user
      await addDoc(collection(db, 'notifications'), {
        userId: request.userId,
        title: 'SHG Request Declined',
        message: `Your request to join "${request.groupName}" was declined.`,
        link: '/shg',
        read: false,
        createdAt: serverTimestamp()
      })

      alert('Request rejected.')
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request.')
    }
  }

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get pending requests for groups I created
  const [groupRequests, setGroupRequests] = useState([])
  useEffect(() => {
    if (!currentUser) return

    const myGroupIds = myGroups.filter(g => g.createdBy === currentUser.uid).map(g => g.id)
    if (myGroupIds.length === 0) return

    const requestsQuery = query(
      collection(db, 'shgRequests'),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (myGroupIds.includes(data.groupId)) {
          requestsList.push({ id: doc.id, ...data })
        }
      })
      setGroupRequests(requestsList)
    })

    return () => unsubscribe()
  }, [currentUser, myGroups])

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
            <p className="text-gray-600">Connect with fellow entrepreneurs and grow together</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-pink-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-500 transition-colors"
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
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">My Groups</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{myGroups.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UsersIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">Total Groups</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{allGroups.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ClockIcon className="w-6 h-6 text-orange-500" />
            <span className="text-sm text-gray-600">Pending Requests</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-pink-400 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Browse Groups
        </button>
        <button
          onClick={() => setActiveTab('myGroups')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'myGroups'
              ? 'bg-pink-400 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Groups ({myGroups.length})
        </button>
        {groupRequests.length > 0 && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-pink-400 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Join Requests
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {groupRequests.length}
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
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups by name, sector, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Groups List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading groups...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No groups found</p>
              <p className="text-sm mt-2">Be the first to create a group!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGroups.map((group) => {
                const isMember = group.members?.includes(currentUser?.uid)
                const isFull = group.members?.length >= group.maxMembers
                const hasPendingRequest = pendingRequests.some(req => req.groupId === group.id)

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                          {group.sector}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {group.members?.length || 0}/{group.maxMembers}
                        </p>
                        <p className="text-xs text-gray-500">members</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

                    {group.goals && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-1">Goals:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{group.goals}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Created by {group.creatorName}
                      </p>
                      
                      {isMember ? (
                        <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                          Member
                        </span>
                      ) : isFull ? (
                        <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                          Full
                        </span>
                      ) : hasPendingRequest ? (
                        <span className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoinRequest(group)}
                          className="px-4 py-2 bg-pink-400 text-white text-sm font-medium rounded-lg hover:bg-pink-500 transition-colors"
                        >
                          Join Group
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
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          {myGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>You haven't joined any groups yet</p>
              <p className="text-sm mt-2">Browse groups and join one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                        {group.sector}
                      </span>
                    </div>
                    {group.createdBy === currentUser?.uid && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Creator
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{group.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {group.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Join Requests for Your Groups</h2>
          {groupRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.userName}</h3>
                    <p className="text-sm text-gray-600">wants to join "{request.groupName}"</p>
                    <p className="text-xs text-gray-500">{request.userEmail}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveRequest(request)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Self Help Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g., Women Tech Founders"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <select
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">Select sector</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Describe the purpose and focus of your group..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="What are the main goals of this group?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  required
                  min="2"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-pink-400 text-white rounded-lg font-medium hover:bg-pink-500 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default SelfHelpGroups
