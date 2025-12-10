import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, arrayUnion, arrayRemove, orderBy, onSnapshot } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import ConnectionRequestModal from '../../components/ConnectionRequestModal';
import UnifiedChat from '../../components/UnifiedChat';

export default function Mentors() {
  const [activeTab, setActiveTab] = useState('find'); // find, freeGroups, groupSessions, myMentors, chat
  const [mentors, setMentors] = useState([]);
  const [freeGroups, setFreeGroups] = useState([]); // Telegram-style free groups (price = 0)
  const [myFreeGroups, setMyFreeGroups] = useState([]); // Joined free groups
  const [groupSessions, setGroupSessions] = useState([]); // Paid group mentoring (price > 0)
  const [myGroupSessions, setMyGroupSessions] = useState([]); // Enrolled paid group sessions
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorTypeFilter, setMentorTypeFilter] = useState('all'); // all, personal, group
  const [sectorFilter, setSectorFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [pendingPaymentConnection, setPendingPaymentConnection] = useState(null);
  const [showPersonalChat, setShowPersonalChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null); // unified chat view for personal + group
  const [message, setMessage] = useState('');
  const [openPaymentFromNotification, setOpenPaymentFromNotification] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  // Unified pink button styles
  const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
  const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
  const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  const toastVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  };

  // Fetch functions
  const fetchMentors = async () => {
    try {
      // Load mentors from users collection where role is 'mentor'
      const mentorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'mentor')
      );
      const mentorsSnapshot = await getDocs(mentorsQuery);
      const mentorsData = mentorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMentors(mentorsData);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unified chat opener
  const handleOpenChat = (chatData) => {
    setActiveChat(chatData);
  };

  const fetchConnections = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const connectionsQuery = query(collection(db, 'connections'), where('entrepreneurId', '==', currentUser.uid));
      const connectionsSnapshot = await getDocs(connectionsQuery);
      const connectionsData = connectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    }
  }, [currentUser]);

  const fetchFreeGroups = async () => {
    try {
      const groupsQuery = query(collection(db, 'mentorGroups'), where('price', '==', 0));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFreeGroups(groupsData);
    } catch (error) {
      console.error('Error fetching free groups:', error);
      setFreeGroups([]);
    }
  };

  const fetchMyFreeGroups = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const groupsQuery = query(collection(db, 'mentorGroups'), where('participants', 'array-contains', currentUser.uid));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyFreeGroups(groupsData);
    } catch (error) {
      console.error('Error fetching my free groups:', error);
      setMyFreeGroups([]);
    }
  }, [currentUser]);

  const fetchGroupSessions = async () => {
    try {
      const sessionsQuery = query(collection(db, 'groupSessions'), where('price', '>', 0));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroupSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching group sessions:', error);
      setGroupSessions([]);
    }
  };

  const fetchMyGroupSessions = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const sessionsQuery = query(collection(db, 'groupSessions'), where('participants', 'array-contains', currentUser.uid));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyGroupSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching my group sessions:', error);
      setMyGroupSessions([]);
    }
  }, [currentUser]);

  const fetchMessages = useCallback((connectionId) => {
    const messagesQuery = query(collection(db, 'chats', connectionId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchMentors();
    fetchConnections();
    fetchFreeGroups();
    fetchGroupSessions();
    if (currentUser?.uid) {
      fetchMyFreeGroups();
      fetchMyGroupSessions();
    }
  }, [currentUser, fetchConnections, fetchMyFreeGroups, fetchMyGroupSessions]);

  // Detect if this page was opened from a mentor-connection notification with payment intent
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpen = params.get('openPayment') === '1' && params.get('connectionId');
    if (shouldOpen) {
      setOpenPaymentFromNotification(true);
      // Ensure we have the latest connection status (accepted/pending payment)
      fetchConnections();
    }
  }, [location.search, fetchConnections]);

  // Check for connections that have been accepted by mentor and are ready for payment
  // When found, automatically open the payment modal (no toast required).
  useEffect(() => {
    if (!openPaymentFromNotification || showPaymentModal) return;

    const params = new URLSearchParams(location.search);
    const targetConnectionId = params.get('connectionId');

    const acceptedForPayment = connections.find(
      conn => (!targetConnectionId || conn.id === targetConnectionId) &&
              conn.status === 'accepted' &&
              conn.mentorType === 'personal' &&
              conn.paymentStatus === 'pending' &&
              conn.entrepreneurId === currentUser?.uid
    );

    if (acceptedForPayment && !pendingPaymentConnection && !showPaymentModal) {
      setPendingPaymentConnection(acceptedForPayment);

      // Find the mentor so the payment modal can show correct details
      const mentorForPayment = mentors.find(m => m.id === acceptedForPayment.mentorId);
      if (mentorForPayment) {
        setSelectedMentor(mentorForPayment);
      }

      setShowPaymentModal(true);
      // Prevent this effect from re-opening the modal repeatedly
      setOpenPaymentFromNotification(false);
    }
  }, [connections, currentUser, pendingPaymentConnection, mentors, openPaymentFromNotification, location.search, showPaymentModal]);

  useEffect(() => {
    if (selectedConnection) {
      const unsubscribe = fetchMessages(selectedConnection.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [selectedConnection, fetchMessages]);

  const handleJoinGroup = async (group) => {
    try {
      const groupRef = doc(db, 'mentorGroups', group.id);
      await updateDoc(groupRef, {
        participants: arrayUnion(currentUser.uid)
      });
      alert('Successfully joined the free group! Click "Open Chat" to start communicating.');
      fetchFreeGroups();
      fetchMyFreeGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group');
    }
  };

  const handleOpenGroupChat = (group) => {
    // Free mentor groups should still use mentor group chat collection (group-chats),
    // not self-help group chats. So we always mark them as 'mentor' here.
    handleOpenChat({
      type: 'group',
      id: group.id,
      groupType: 'mentor',
      groupName: group.groupName,
    });
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }
    try {
      const groupRef = doc(db, 'mentorGroups', groupId);
      await updateDoc(groupRef, {
        participants: arrayRemove(currentUser.uid)
      });
      alert('You have left the group');
      fetchFreeGroups();
      fetchMyFreeGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group');
    }
  };

  const handleEnrollGroupSession = async (session) => {
    if (!confirm(`Enroll in "${session.groupName}" for ₹${session.price}?\n\nSchedule: ${session.schedule.day}s at ${session.schedule.time}\nDuration: ${session.schedule.duration} minutes`)) {
      return;
    }
    try {
      // TODO: Integrate payment gateway here
      const sessionRef = doc(db, 'groupSessions', session.id);
      await updateDoc(sessionRef, {
        participants: arrayUnion(currentUser.uid)
      });
      alert(`✅ Successfully enrolled in "${session.groupName}"!\n\nYou will receive meeting links and session details via email.`);
      fetchGroupSessions();
      fetchMyGroupSessions();
    } catch (error) {
      console.error('Error enrolling in group session:', error);
      alert('Failed to enroll in session');
    }
  };

  const handleConnect = async (mentor, mentorType) => {
    // For personal mentors: show request modal
    if (mentorType === 'personal') {
      setSelectedMentor({ ...mentor, selectedType: mentorType });
      setShowRequestModal(true);
    } else {
      // Group mentor - should not be used anymore (use handleJoinGroup instead)
      alert('Please use the "Join Group" button for group mentoring.');
    }
  };

  const handleSubmitRequest = async (requestMessage) => {
    try {
      const connectionData = {
        entrepreneurId: currentUser.uid,
        mentorId: selectedMentor.id,
        entrepreneurName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Entrepreneur',
        entrepreneurEmail: currentUser.email,
        mentorName: selectedMentor.name || `${selectedMentor.firstName} ${selectedMentor.lastName}`,
        mentorEmail: selectedMentor.email,
        mentorType: 'personal',
        status: 'pending',
        paymentStatus: 'pending',
        paymentAmount: selectedMentor.personalSessionPrice || 0,
        requestMessage: requestMessage,
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'connections'), connectionData);
      setMessage('Connection request sent successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
      fetchConnections();
      setShowRequestModal(false);
      setSelectedMentor(null);
    } catch (error) {
      console.error('Error sending request:', error);
      setMessage('Failed to send connection request. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
      throw error;
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const connectionRef = doc(db, 'connections', pendingPaymentConnection.id);
      await updateDoc(connectionRef, {
        paymentStatus: 'completed',
        status: 'active',
        paymentId: paymentId,
      });
      alert('Payment successful! You can now chat with your mentor.');
      setPendingPaymentConnection(null);
      setShowPaymentModal(false);
      await fetchConnections();
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    // This old payment handler is kept for backward compatibility
    // but should not be used anymore
    const confirmed = window.confirm(
      `Pay ₹${selectedMentor.personalSessionPrice.toLocaleString('en-IN')} for personal mentorship with ${selectedMentor.name}?`
    );
    
    if (confirmed) {
      try {
        const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await addDoc(collection(db, 'connections'), {
          entrepreneurId: currentUser.uid,
          mentorId: selectedMentor.id,
          mentorType: 'personal',
          status: 'active',
          paymentStatus: 'completed',
          paymentAmount: selectedMentor.personalSessionPrice,
          paymentId: paymentId
        });
        
        setShowPaymentModal(false);
        setSelectedMentor(null);
        fetchConnections();
        alert('Payment successful! You are now connected with your mentor.');
        setActiveTab('myMentors');
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Payment failed. Please try again.');
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConnection) return;

    try {
      await addDoc(collection(db, 'chats', selectedConnection.id, 'messages'), {
        senderId: currentUser.uid,
        senderRole: 'entrepreneur',
        message: newMessage,
        messageType: 'text',
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const openChat = (connection) => {
    handleOpenChat({
      type: 'personal',
      id: connection.id,
      otherPersonName:
        connection.mentorId === currentUser?.uid
          ? connection.entrepreneurName
          : connection.mentorName,
    });
  };

  const filteredMentors = mentors.filter(mentor => {
    // Mentor Type Filter
    const matchesType = mentorTypeFilter === 'all' || 
                       mentor.mentorType === mentorTypeFilter || 
                       mentor.mentorType === 'both';
    
    // Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (mentor.name && typeof mentor.name === 'string' && mentor.name.toLowerCase().includes(searchLower)) ||
      (mentor.sector && typeof mentor.sector === 'string' && mentor.sector.toLowerCase().includes(searchLower)) ||
      (mentor.expertise && typeof mentor.expertise === 'string' && mentor.expertise.toLowerCase().includes(searchLower)) ||
      (mentor.location?.city && mentor.location.city.toLowerCase().includes(searchLower)) ||
      (mentor.location?.state && mentor.location.state.toLowerCase().includes(searchLower));
    
    // Sector Filter
    const matchesSector = sectorFilter === 'all' || mentor.sector === sectorFilter;
    
    // Experience Filter
    let matchesExperience = true;
    if (experienceFilter !== 'all') {
      const years = mentor.yearsOfExperience || 0;
      if (experienceFilter === '0-2') matchesExperience = years <= 2;
      else if (experienceFilter === '3-5') matchesExperience = years >= 3 && years <= 5;
      else if (experienceFilter === '6-10') matchesExperience = years >= 6 && years <= 10;
      else if (experienceFilter === '10+') matchesExperience = years > 10;
    }
    
    // Price Range Filter (for personal mentors)
    let matchesPrice = true;
    if (priceRangeFilter !== 'all' && (mentor.mentorType === 'personal' || mentor.mentorType === 'both')) {
      const price = mentor.personalSessionPrice || 0;
      if (priceRangeFilter === '0-2000') matchesPrice = price <= 2000;
      else if (priceRangeFilter === '2001-3500') matchesPrice = price > 2000 && price <= 3500;
      else if (priceRangeFilter === '3501+') matchesPrice = price > 3500;
    }
    
    // Language Filter
    const matchesLanguage = languageFilter === 'all' || 
      (mentor.languages && Array.isArray(mentor.languages) && mentor.languages.includes(languageFilter));
    
    return matchesType && matchesSearch && matchesSector && matchesExperience && matchesPrice && matchesLanguage;
  });

  const getConnectionStatus = (mentorId) => {
    if (!Array.isArray(connections)) return null;
    return connections.find(conn => conn.mentorId === mentorId);
  };

  if (activeChat) {
    return (
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <UnifiedChat
          chatInfo={activeChat}
          currentUser={currentUser}
          onBack={() => setActiveChat(null)}
          userRole="entrepreneur"
        />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Connect with Mentors</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('find')}
            className={`pb-3 px-4 font-semibold flex items-center space-x-2 ${
              activeTab === 'find'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Personal Mentors</span>
          </button>
          <button
            onClick={() => setActiveTab('freeGroups')}
            className={`pb-3 px-4 font-semibold flex items-center space-x-2 ${
              activeTab === 'freeGroups'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Free Groups</span>
            <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {freeGroups.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('groupSessions')}
            className={`pb-3 px-4 font-semibold flex items-center space-x-2 ${
              activeTab === 'groupSessions'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Group Mentoring</span>
            <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {groupSessions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('myMentors')}
            className={`pb-3 px-4 font-semibold flex items-center space-x-2 ${
              activeTab === 'myMentors'
                ? 'border-b-2 border-pink-500 text-pink-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>My Connections</span>
            <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {connections.length}
            </span>
          </button>
        </div>

        {/* Personal Mentors Tab */}
        {activeTab === 'find' && (
          <div>
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💼 1-on-1 Personal Mentoring</p>
                  <p>Send a request → Mentor approves → Complete payment → Start chatting</p>
                </div>
              </div>
            </div> */}
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="space-y-4">
                {/* Basic Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by name, sector, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <select
                    value={mentorTypeFilter}
                    onChange={(e) => setMentorTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Mentors</option>
                    <option value="personal">Personal Mentors</option>
                    <option value="group">Group Mentors</option>
                  </select>
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition font-semibold whitespace-nowrap"
                  >
                    {showAdvancedFilters ? '− Less Filters' : '+ More Filters'}
                  </button>
                </div>
                
                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                    <select
                      value={sectorFilter}
                      onChange={(e) => setSectorFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Sectors</option>
                      <option value="Food Processing">Food Processing</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Tailoring & Garments">Tailoring & Garments</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Agriculture & Farming">Agriculture & Farming</option>
                      <option value="Catering & Food Services">Catering & Food Services</option>
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Education & Training">Education & Training</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Other">Other</option>
                    </select>
                    
                    <select
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Experience Levels</option>
                      <option value="0-2">Beginner (0-2 years)</option>
                      <option value="3-5">Intermediate (3-5 years)</option>
                      <option value="6-10">Expert (6-10 years)</option>
                      <option value="10+">Master (10+ years)</option>
                    </select>
                    
                    <select
                      value={priceRangeFilter}
                      onChange={(e) => setPriceRangeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Price Ranges</option>
                      <option value="0-2000">₹0 - ₹2,000</option>
                      <option value="2001-3500">₹2,001 - ₹3,500</option>
                      <option value="3501+">₹3,501+</option>
                    </select>
                    
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Languages</option>
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Punjabi">Punjabi</option>
                    </select>
                  </div>
                )}
                
                {/* Active Filters Summary */}
                {(mentorTypeFilter !== 'all' || sectorFilter !== 'all' || experienceFilter !== 'all' || priceRangeFilter !== 'all' || languageFilter !== 'all' || searchQuery) && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {mentorTypeFilter !== 'all' && (
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                        {mentorTypeFilter === 'personal' ? 'Personal' : 'Group'}
                      </span>
                    )}
                    {sectorFilter !== 'all' && (
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                        {sectorFilter}
                      </span>
                    )}
                    {experienceFilter !== 'all' && (
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                        {experienceFilter === '10+' ? '10+ years' : `${experienceFilter} years`}
                      </span>
                    )}
                    {priceRangeFilter !== 'all' && (
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                        {priceRangeFilter === '3501+' ? '₹3,501+' : `₹${priceRangeFilter}`}
                      </span>
                    )}
                    {languageFilter !== 'all' && (
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                        {languageFilter}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        "{searchQuery}"
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setMentorTypeFilter('all');
                        setSectorFilter('all');
                        setExperienceFilter('all');
                        setPriceRangeFilter('all');
                        setLanguageFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-sm text-pink-600 hover:text-pink-700 font-semibold ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mentor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => {
                const connection = getConnectionStatus(mentor.id);
                const isConnected = connection && connection.status === 'active';
                const mentorDisplayName =
                  (mentor.name && typeof mentor.name === 'string' && mentor.name.trim()) ||
                  `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() ||
                  mentor.email ||
                  'Mentor';
                
                return (
                  <div key={mentor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{mentorDisplayName}</h2>
                        <p className="text-sm text-gray-500">{mentor.sector}</p>
                      </div>
                      {mentor.mentorType && (
                        <span className={`px-2 py-1 text-xs rounded-full bg-pink-50 text-pink-700`}>
                          {mentor.mentorType === 'both' ? 'Personal & Group' : 
                           mentor.mentorType.charAt(0).toUpperCase() + mentor.mentorType.slice(1)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{mentor.expertise}</p>
                    
                    <div className="space-y-2 mb-4">
                      {mentor.yearsOfExperience && (
                        <p className="text-gray-500 text-sm">
                          <span className="font-semibold">Experience:</span> {mentor.yearsOfExperience} years
                        </p>
                      )}
                      
                      {mentor.location && (mentor.location.city || mentor.location.state) && (
                        <p className="text-gray-500 text-sm">
                          <span className="font-semibold">Location:</span> {mentor.location.city}{mentor.location.city && mentor.location.state ? ', ' : ''}{mentor.location.state}
                        </p>
                      )}
                      
                      {mentor.languages && mentor.languages.length > 0 && (
                        <p className="text-gray-500 text-sm">
                          <span className="font-semibold">Languages:</span> {mentor.languages.slice(0, 3).join(', ')}{mentor.languages.length > 3 ? '...' : ''}
                        </p>
                      )}
                      
                      {mentor.rating > 0 && (
                        <p className="text-gray-500 text-sm flex items-center">
                          <span className="font-semibold mr-2">Rating:</span>
                          <span className="text-pink-500">{'★'.repeat(Math.round(mentor.rating))}{'☆'.repeat(5 - Math.round(mentor.rating))}</span>
                          <span className="ml-1 text-xs">({mentor.totalReviews || 0})</span>
                        </p>
                      )}
                      
                      {mentor.totalConnections > 0 && (
                        <p className="text-gray-500 text-sm">
                          <span className="font-semibold">Mentees:</span> {mentor.totalConnections}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{mentor.bio}</p>
                    
                    {/* Pricing */}
                    <div className="border-t pt-4 mb-4">
                      {(mentor.mentorType === 'personal' || mentor.mentorType === 'both') && mentor.personalSessionPrice && (
                        <p className="text-sm mb-2">
                          <span className="font-semibold">Personal:</span> ₹{mentor.personalSessionPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                      {(mentor.mentorType === 'group' || mentor.mentorType === 'both') && (
                        <p className="text-sm text-pink-600">
                          <span className="font-semibold">Group:</span> Free
                        </p>
                      )}
                    </div>
                    
                    {isConnected ? (
                      <button
                        onClick={() => openChat(connection)}
                        className={`w-full py-2 px-4 ${primaryButtonClass}`}
                      >
                        Chat Now
                      </button>
                    ) : connection && connection.status === 'pending' ? (
                      <div className="w-full bg-pink-50 border border-pink-200 text-pink-700 py-2 px-4 rounded-lg font-semibold text-center">
                        Request Pending
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(mentor.mentorType === 'personal' || mentor.mentorType === 'both') && (
                          <button
                            onClick={() => handleConnect(mentor, 'personal')}
                            className={`w-full py-2 px-4 ${primaryButtonClass} flex items-center justify-center space-x-2`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Request Connection</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No mentors found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Free Groups Tab */}
        {activeTab === 'freeGroups' && (
          <div>
            {/* Info Banner */}
            {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">💬 Free Telegram-Style Groups</p>
                  <p>Join instantly → Start chatting → Learn together with other entrepreneurs</p>
                  <p className="text-xs mt-1">✨ No payment required • Instant access • Community support</p>
                </div>
              </div>
            </div> */}

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Free Groups</h2>
              <p className="text-gray-600">Join Telegram-style groups created by mentors - completely free!</p>
            </div>

            {freeGroups.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No free groups available at the moment</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for new free mentoring groups!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {freeGroups.map((group) => {
                  const isJoined = myFreeGroups.some(g => g.id === group.id);
                  const memberCount = (group.participants?.length || 0);
                  const maxMembers = group.maxParticipants || 0;
                  const isFull = maxMembers > 0 && memberCount >= maxMembers;
                  
                  return (
                    <div key={group.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{group.groupName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            group.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {group.status}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>

                        <div className="space-y-2 text-sm mb-4">
                          <p className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-semibold">Mentor:</span> <span className="ml-1">{group.mentorName}</span>
                          </p>
                          <p className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-semibold">Sector:</span> <span className="ml-1">{group.sector}</span>
                          </p>
                          <p className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span className="font-semibold">Language:</span> <span className="ml-1">{group.language}</span>
                          </p>
                          <p className="text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-semibold">Members:</span> <span className="ml-1">{memberCount}/{maxMembers}</span>
                            {isFull && <span className="text-red-500 ml-2 text-xs">(Full)</span>}
                          </p>
                        </div>

                        {group.topics && group.topics.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Topics covered:</p>
                            <div className="flex flex-wrap gap-1">
                              {group.topics.map((topic, i) => (
                                <span key={i} className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {group.rating > 0 && (
                          <p className="text-gray-700 text-sm mb-4">
                            <span className="text-pink-500">{'★'.repeat(Math.round(group.rating))}{'☆'.repeat(5 - Math.round(group.rating))}</span>
                            <span className="ml-1 text-xs text-gray-500">({group.reviews?.length || 0} reviews)</span>
                          </p>
                        )}

                        {isJoined ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => handleOpenGroupChat(group)}
                              className={`w-full py-2 ${primaryButtonClass} flex items-center justify-center space-x-2`}
                            >
                              {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg> */}
                              <span>Open Chat</span>
                            </button>
                            <button
                              onClick={() => handleLeaveGroup(group.id)}
                              className="w-full border border-red-300 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                            >
                              Leave Group
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group)}
                            disabled={isFull}
                            className={`w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                              isFull
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : primaryButtonClass
                            }`}
                          >
                            {isFull ? (
                              <span>Group full</span>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                                <span>Join Free</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* My Free Groups Section */}
            {myFreeGroups.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">My Joined Free Groups</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myFreeGroups.map((group) => (
                    <div key={group.id} className="bg-white rounded-lg shadow-lg p-6 ">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{group.groupName}</h3>
                          <p className="text-sm text-gray-600">by {group.mentorName}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          FREE
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{group.sector} • {group.language}</p>
                      <p className="text-xs text-gray-600 mb-4">
                        {group.currentParticipants?.length || 0} members
                      </p>
                      <button
                        onClick={() => handleOpenGroupChat(group)}
className={`w-full py-2 ${primaryButtonClass} flex items-center justify-center space-x-2`}                      >
                       
                        <span>Open Chat</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Group Mentoring Sessions Tab (PAID) */}
        {activeTab === 'groupSessions' && (
          <div>
            {/* Info Banner */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">📚 Scheduled Group Mentoring Sessions</p>
                  <p>Professional group mentoring with scheduled sessions, structured curriculum, and mentor guidance</p>
                  <p className="text-xs mt-1">💎 Paid sessions • Scheduled meetings • Limited seats • Certificate of completion</p>
                </div>
              </div>
            </div> */}

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available Group Mentoring Sessions</h2>
              <p className="text-gray-600">Join structured group mentoring programs with professional mentors</p>
            </div>

            {groupSessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No group mentoring sessions available at the moment</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for new scheduled group programs!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupSessions.map((session) => {
                  const isEnrolled = myGroupSessions.some(s => s.id === session.id);
                  const enrolledCount = session.currentParticipants?.length || 0;
                  const maxParticipants = session.maxParticipants || 0;
                  const isFull = maxParticipants > 0 && enrolledCount >= maxParticipants;
                  
                  return (
                    <div key={session.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-blue-100">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{session.groupName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {session.status}
                          </span>
                        </div>

                        <p className="text-sm text-pink-600 font-semibold mb-2">by {session.mentorName}</p>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span><strong>{enrolledCount}/{maxParticipants}</strong> Enrolled</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span><strong>{session.schedule.day}</strong> at {session.schedule.time} ({session.schedule.frequency})</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{session.schedule.duration} minutes/session</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="font-semibold text-pink-700">₹{session.price}</span>
                          </div>
                        </div>

                        {session.topics && session.topics.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {session.topics.slice(0, 3).map((topic, idx) => (
                                <span key={idx} className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs">
                                  {topic}
                                </span>
                              ))}
                              {session.topics.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                  +{session.topics.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {isEnrolled ? (
                          <button
                            disabled
                            className="w-full bg-pink-100 text-pink-700 py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 cursor-not-allowed"
                          >
                            {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg> */}
                            <span>Enrolled</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnrollGroupSession(session)}
                            disabled={isFull}
                            className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition ${
                              isFull
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-linear-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700'
                            }`}
                          >
                            {isFull ? (
                              <span>Session Full</span>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Enroll Now (₹{session.price})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* My Enrolled Group Sessions */}
            {myGroupSessions.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">My Enrolled Group Sessions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myGroupSessions.map((session) => (
                    <div key={session.id} className="bg-whiterounded-lg shadow-lg p-6 ">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{session.groupName}</h3>
                      <p className="text-sm text-pink-600 font-semibold mb-3">by {session.mentorName}</p>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Next Session:</span> {session.schedule.day} at {session.schedule.time}
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Duration:</span> {session.schedule.duration} minutes
                      </p>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-2 ${primaryButtonClass} flex items-center justify-center space-x-2`}                        >
                          Join Session
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Mentors Tab */}
        {activeTab === 'myMentors' && (() => {
          if (connections.length === 0) {
            return (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg mb-4">You haven't connected with any mentors yet</p>
                <button
                  onClick={() => setActiveTab('find')}
                  className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-lg font-semibold"
                >
                  Find Mentors
                </button>
              </div>
            );
          }

          // Deduplicate connections per mentor + mentorType, preferring paid + active and latest
          const rankedStatus = (conn) => {
            if (conn.status === 'active' && conn.paymentStatus === 'completed') return 3;
            if (conn.status === 'active') return 2;
            if (conn.status === 'accepted') return 1;
            return 0; // pending / others
          };

          const getTime = (createdAt) => {
            if (!createdAt) return 0;
            if (createdAt.toDate) {
              // Firestore Timestamp
              return createdAt.toDate().getTime();
            }
            const t = new Date(createdAt).getTime();
            return Number.isNaN(t) ? 0 : t;
          };

          const deduped = [];
          const indexByKey = new Map();

          connections.forEach((conn) => {
            const key = `${conn.mentorId || ''}-${conn.mentorType || ''}`;
            const existingIndex = indexByKey.get(key);
            if (existingIndex === undefined) {
              indexByKey.set(key, deduped.length);
              deduped.push(conn);
            } else {
              const existing = deduped[existingIndex];
              const existingRank = rankedStatus(existing);
              const newRank = rankedStatus(conn);
              const existingTime = getTime(existing.createdAt);
              const newTime = getTime(conn.createdAt);

              if (
                newRank > existingRank ||
                (newRank === existingRank && newTime > existingTime)
              ) {
                deduped[existingIndex] = conn;
              }
            }
          });

          return (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deduped.map((connection) => {
                  const createdAtMs = getTime(connection.createdAt);
                  const createdAtLabel = createdAtMs
                    ? new Date(createdAtMs).toLocaleDateString()
                    : '-';

                  return (
                    <div key={connection.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {connection.mentorName || 'Mentor'}
                          </h3>
                          <p className="text-sm text-gray-500">{connection.mentorSector || connection.sector || ''}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          connection.mentorType === 'personal' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {connection.mentorType}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{connection.mentorExpertise || connection.expertise || ''}</p>
                      
                      <div className="border-t pt-4 mb-4 space-y-2 text-sm">
                        <p>
                          <span className="font-semibold">Status:</span>{' '}
                          <span className={connection.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                            {connection.status}
                          </span>
                        </p>
                        {connection.sessionCount > 0 && (
                          <p>
                            <span className="font-semibold">Sessions:</span> {connection.sessionCount}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold">Connected:</span>{' '}
                          {createdAtLabel}
                        </p>
                      </div>
                      
                      {connection.status === 'active' ? (
                        <button
                          onClick={() => {
                            console.log('💬 Chat button clicked for connection:', connection.id);
                            openChat(connection);
                          }}
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold transition"
                        >
                           Open Chat
                        </button>
                      ) : (
                        <div className="text-center text-sm text-gray-500 py-2">
                          {connection.paymentStatus === 'pending' ? 'Payment pending...' : 'Connection pending...'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Chat Tab */}
        {activeTab === 'chat' && selectedConnection && (
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-pink-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedConnection.mentorName || 'Mentor'}</h2>
                <p className="text-sm opacity-90">{selectedConnection.mentorType} Mentor</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('myMentors');
                  setSelectedConnection(null);
                }}
                className="text-white hover:bg-pink-600 p-2 rounded"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUser.userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === currentUser.userId
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm mb-1">{msg.message}</p>
                      <p className={`text-xs ${
                        msg.senderId === currentUser.userId ? 'text-pink-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedMentor && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Complete Payment</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Mentor: <span className="font-semibold">{selectedMentor.name}</span></p>
              <p className="text-gray-600 mb-2">Type: <span className="font-semibold">Personal Mentorship</span></p>
              <p className="text-gray-600 mb-4">Amount: <span className="text-2xl font-bold text-pink-600">₹{selectedMentor.personalSessionPrice.toLocaleString('en-IN')}</span></p>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a simulated payment gateway for demonstration purposes.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                  await handlePaymentSuccess(paymentId);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition"
              >
                Pay Now
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMentor(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="mentors-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-9999 w-full max-w-sm"
          >
            <div
              className={`p-4 rounded-lg shadow-xl text-sm font-medium border ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Request Modal */}
      {showRequestModal && selectedMentor && (
        <ConnectionRequestModal
          mentor={selectedMentor}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedMentor(null);
          }}
          onSubmit={handleSubmitRequest}
        />
      )}

      </div>
    </DashboardLayout>
  );
}
