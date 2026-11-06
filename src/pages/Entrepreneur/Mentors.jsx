import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import ConnectionRequestModal from '../../components/ConnectionRequestModal';
import UnifiedChat from '../../components/UnifiedChat';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserIcon, 
  UserGroupIcon, 
  VideoCameraIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  MapPinIcon,
  LanguageIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

export default function Mentors() {
  const [activeTab, setActiveTab] = useState('find'); // find, freeGroups, groupSessions, myMentors
  const [mentors, setMentors] = useState([]);
  const [message, setMessage] = useState('');
  const [freeGroups, setFreeGroups] = useState([]); 
  const [myFreeGroups, setMyFreeGroups] = useState([]);
  const [groupSessions, setGroupSessions] = useState([]);
  const [myGroupSessions, setMyGroupSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorTypeFilter, setMentorTypeFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [viewDetailsMentor, setViewDetailsMentor] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingPaymentConnection, setPendingPaymentConnection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [openPaymentFromNotification, setOpenPaymentFromNotification] = useState(false);
  const [entrepreneurProfile, setEntrepreneurProfile] = useState(null);
  const [matchingMode, setMatchingMode] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['find', 'freeGroups', 'groupSessions', 'myMentors'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const sectionClass = "p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 transition-all hover:border-[#8d4624]/35 flex flex-col justify-between h-[390px]";
  const inputClass = "h-11 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] text-stone-900 placeholder:text-stone-400";
  const selectClass = "h-11 rounded-xl border border-[#8d4624]/25 bg-transparent px-3 text-sm text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8d4624]";

  const calculateMatchScore = (entrepreneur, mentor) => {
    if (!entrepreneur) return 0;
    let score = 0;
    const weights = {
      primaryIndustry: 30,
      secondaryIndustries: 20,
      businessStage: 15,
      skills: 15,
      language: 10,
      location: 5,
      rating: 5,
    };

    const primaryIndustry = entrepreneur.primaryIndustry;
    const secondaryIndustries = entrepreneur.secondaryIndustries || [];
    const businessStage = entrepreneur.businessStage;
    const skills = entrepreneur.skills || [];
    const languages = entrepreneur.language || entrepreneur.languages || [];
    const entCity = entrepreneur.address?.city;
    const mentorSector = mentor.sector;
    const mentorExpertiseAreas = mentor.expertiseAreas || [];
    const mentorExperience = mentor.experience || mentor.experienceLevel || '';
    const mentorSpecializations = mentor.specializations || mentor.expertiseAreas || [];
    const mentorLanguages = mentor.languages || [];
    const mentorCity = mentor.location?.city;
    const mentorRating = mentor.rating || 0;

    if (primaryIndustry && mentorSector && primaryIndustry.toLowerCase() === mentorSector.toLowerCase()) {
      score += weights.primaryIndustry;
    }

    if (secondaryIndustries.length > 0 && mentorExpertiseAreas.length > 0) {
      const commonIndustries = secondaryIndustries.filter(ind =>
        mentorExpertiseAreas.some(exp =>
          typeof exp === 'string' && exp.toLowerCase().includes(ind.toLowerCase())
        )
      );
      if (commonIndustries.length > 0) {
        score += commonIndustries.length * (weights.secondaryIndustries / mentorExpertiseAreas.length || 1);
      }
    }

    if (businessStage && mentorExperience && mentorExperience.toLowerCase().includes(businessStage.toLowerCase())) {
      score += weights.businessStage;
    }

    if (skills.length > 0 && mentorSpecializations.length > 0) {
      const commonSkills = skills.filter(skill =>
        mentorSpecializations.some(spec =>
          typeof spec === 'string' && spec.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (commonSkills.length > 0) {
        score += commonSkills.length * (weights.skills / mentorSpecializations.length || 1);
      }
    }

    if (languages.length > 0 && mentorLanguages.length > 0) {
      const commonLanguages = languages.filter(lang => mentorLanguages.includes(lang));
      if (commonLanguages.length > 0) {
        score += weights.language;
      }
    }

    if (entCity && mentorCity && typeof entCity === 'string' && typeof mentorCity === 'string') {
      if (entCity.toLowerCase() === mentorCity.toLowerCase()) {
        score += weights.location;
      }
    }

    if (mentorRating > 0) {
      score += (mentorRating / 5) * weights.rating;
    }

    return Math.min(100, Math.round(score));
  };

  const fetchMentors = async () => {
    try {
      const mentorsQuery = query(collection(db, 'users'), where('role', '==', 'mentor'));
      const mentorsSnapshot = await getDocs(mentorsQuery);
      const mentorsData = mentorsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMentors(mentorsData);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntrepreneurProfile = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      setEntrepreneurProfile(snap.exists() ? snap.data() : null);
    } catch (error) {
      console.error('Error fetching entrepreneur profile:', error);
      setEntrepreneurProfile(null);
    }
  }, [currentUser]);

  const handleOpenChat = (chatData) => {
    setActiveChat(chatData);
  };

  const fetchConnections = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const connectionsQuery = query(collection(db, 'connections'), where('entrepreneurId', '==', currentUser.uid));
      const connectionsSnapshot = await getDocs(connectionsQuery);
      setConnections(connectionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    }
  }, [currentUser]);

  const fetchFreeGroups = async () => {
    try {
      const groupsQuery = query(collection(db, 'mentorGroups'), where('price', '==', 0));
      const groupsSnapshot = await getDocs(groupsQuery);
      setFreeGroups(groupsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
      setMyFreeGroups(groupsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching my free groups:', error);
      setMyFreeGroups([]);
    }
  }, [currentUser]);

  const fetchGroupSessions = async () => {
    try {
      const sessionsQuery = query(collection(db, 'groupSessions'), where('price', '>', 0));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      setGroupSessions(sessionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
      setMyGroupSessions(sessionsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching my group sessions:', error);
      setMyGroupSessions([]);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMentors();
    fetchConnections();
    fetchFreeGroups();
    fetchGroupSessions();
    if (currentUser?.uid) {
      fetchEntrepreneurProfile();
      fetchMyFreeGroups();
      fetchMyGroupSessions();
    }
  }, [currentUser, fetchConnections, fetchMyFreeGroups, fetchMyGroupSessions, fetchEntrepreneurProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpen = params.get('openPayment') === '1' && params.get('connectionId');
    if (shouldOpen) {
      setOpenPaymentFromNotification(true);
      fetchConnections();
    }
  }, [location.search, fetchConnections]);

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
      const mentorForPayment = mentors.find(m => m.id === acceptedForPayment.mentorId);
      if (mentorForPayment) {
        setSelectedMentor(mentorForPayment);
      }
      setShowPaymentModal(true);
      setOpenPaymentFromNotification(false);
    }
  }, [connections, currentUser, pendingPaymentConnection, mentors, openPaymentFromNotification, location.search, showPaymentModal]);

  const handleJoinGroup = async (group) => {
    try {
      const groupRef = doc(db, 'mentorGroups', group.id);
      await updateDoc(groupRef, {
        participants: arrayUnion(currentUser.uid)
      });
      setMessage('Successfully joined group!');
      setTimeout(() => setMessage(''), 3000);
      fetchFreeGroups();
      fetchMyFreeGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      setMessage('Failed to join group.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleOpenGroupChat = (group) => {
    handleOpenChat({
      type: 'group',
      id: group.id,
      groupType: 'mentor',
      groupName: group.groupName,
    });
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      const groupRef = doc(db, 'mentorGroups', groupId);
      await updateDoc(groupRef, {
        participants: arrayRemove(currentUser.uid)
      });
      setMessage('Left group successfully.');
      setTimeout(() => setMessage(''), 3000);
      fetchFreeGroups();
      fetchMyFreeGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      setMessage('Failed to leave group.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleEnrollGroupSession = async (session) => {
    if (!confirm(`Enroll in "${session.groupName}" for ₹${session.price}?`)) return;
    try {
      const sessionRef = doc(db, 'groupSessions', session.id);
      await updateDoc(sessionRef, {
        participants: arrayUnion(currentUser.uid)
      });
      setMessage(`Enrolled in "${session.groupName}"! Details sent to email.`);
      setTimeout(() => setMessage(''), 3000);
      fetchGroupSessions();
      fetchMyGroupSessions();
    } catch (error) {
      console.error('Error enrolling in group session:', error);
      setMessage('Failed to enroll in session.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleConnect = async (mentor, mentorType) => {
    if (mentorType === 'personal') {
      setSelectedMentor({ ...mentor, selectedType: mentorType });
      setShowRequestModal(true);
    }
  };

  const handleSubmitRequest = async (requestMessage) => {
    try {
      const connectionData = {
        entrepreneurId: currentUser.uid,
        mentorId: selectedMentor.id,
        entrepreneurName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Entrepreneur',
        entrepreneurEmail: currentUser.email,
        mentorName: selectedMentor.name || `${selectedMentor.firstName || ''} ${selectedMentor.lastName || ''}`.trim() || 'Mentor',
        mentorEmail: selectedMentor.email,
        mentorType: 'personal',
        status: 'pending',
        paymentStatus: 'pending',
        paymentAmount: selectedMentor.personalSessionPrice || 0,
        requestMessage: requestMessage,
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'connections'), connectionData);
      setMessage('Connection request sent successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchConnections();
      setShowRequestModal(false);
      setSelectedMentor(null);
    } catch (error) {
      console.error('Error sending request:', error);
      setMessage('Failed to send connection request.');
      setTimeout(() => setMessage(''), 4000);
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
      setMessage('Payment successful! Session is now active.');
      setTimeout(() => setMessage(''), 3000);
      setPendingPaymentConnection(null);
      setShowPaymentModal(false);
      await fetchConnections();
    } catch (error) {
      console.error('Error completing payment:', error);
      setMessage('Payment processing failed.');
      setTimeout(() => setMessage(''), 4000);
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

  const openFeedbackModal = (connection, mentor) => {
    setFeedbackTarget({ connection, mentor });
    setFeedbackRating(0);
    setFeedbackComment('');
    setFeedbackModalOpen(true);
  };

  const submitFeedback = async () => {
    if (!feedbackTarget || !currentUser?.uid || !feedbackRating) return;
    setSubmittingFeedback(true);
    try {
      const { connection, mentor } = feedbackTarget;

      await addDoc(collection(db, 'mentorFeedback'), {
        connectionId: connection.id,
        mentorId: mentor.id,
        entrepreneurId: currentUser.uid,
        rating: feedbackRating,
        comment: feedbackComment || '',
        createdAt: new Date(),
      });

      const feedbackQuery = query(
        collection(db, 'mentorFeedback'),
        where('mentorId', '==', mentor.id)
      );
      const feedbackSnap = await getDocs(feedbackQuery);
      const ratings = feedbackSnap.docs.map(d => d.data().rating || 0);
      const totalReviews = ratings.length;
      const avgRating = totalReviews > 0
        ? ratings.reduce((sum, r) => sum + Number(r || 0), 0) / totalReviews
        : 0;

      const mentorRef = doc(db, 'users', mentor.id);
      await updateDoc(mentorRef, {
        rating: Number(avgRating.toFixed(1)),
        totalReviews,
      });

      setFeedbackModalOpen(false);
      setFeedbackTarget(null);
      setFeedbackRating(0);
      setFeedbackComment('');
      setMessage('Feedback recorded!');
      setTimeout(() => setMessage(''), 3000);

      await fetchMentors();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Failed to submit feedback.');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredMentors = useMemo(() => mentors.filter(mentor => {
    const matchesType = mentorTypeFilter === 'all' || mentor.mentorType === mentorTypeFilter;
    const nameMatch = (mentor.name || `${mentor.firstName || ''} ${mentor.lastName || ''}`).toLowerCase();
    const sectorMatch = (mentor.sector || '').toLowerCase();
    const expMatch = (mentor.expertise || mentor.expertiseAreas?.join(' ') || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || nameMatch.includes(q) || sectorMatch.includes(q) || expMatch.includes(q);
    const matchesSector = sectorFilter === 'all' || mentor.sector === sectorFilter;
    const matchesExperience = experienceFilter === 'all' || mentor.yearsOfExperience === experienceFilter;
    const matchesPrice = priceRangeFilter === 'all' || 
      (mentor.personalSessionPrice >= 0 && mentor.personalSessionPrice <= 2000 && priceRangeFilter === '0-2000') || 
      (mentor.personalSessionPrice >= 2001 && mentor.personalSessionPrice <= 3500 && priceRangeFilter === '2001-3500') || 
      (mentor.personalSessionPrice >= 3501 && priceRangeFilter === '3501+');
    const matchesLanguage = languageFilter === 'all' || (mentor.languages && mentor.languages.includes(languageFilter));

    return matchesType && matchesSearch && matchesSector && matchesExperience && matchesPrice && matchesLanguage;
  }), [mentors, mentorTypeFilter, searchQuery, sectorFilter, experienceFilter, priceRangeFilter, languageFilter]);

  const sortedMentors = matchingMode && entrepreneurProfile
    ? [...filteredMentors]
        .map(m => ({ ...m, _matchScore: calculateMatchScore(entrepreneurProfile, m) }))
        .sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0))
    : filteredMentors;

  const tabs = [
    { id: 'find', label: 'Personal Mentors', icon: UserIcon },
    { id: 'freeGroups', label: 'Free Groups', icon: UserGroupIcon, count: freeGroups.length },
    { id: 'groupSessions', label: 'Group Mentoring', icon: VideoCameraIcon, count: groupSessions.length },
    { id: 'myMentors', label: 'My Connections', icon: CheckCircleIcon, count: connections.length },
  ];

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

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <div className="space-y-6 pb-20">
        
        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-transparent border border-[#8d4624]/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/mentors?tab=${tab.id}`, { replace: true });
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#8d4624] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#8d4624] hover:bg-[#8d4624]/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
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

        {/* Tab 1: Personal Mentors */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <Input
                    type="text"
                    placeholder="Search by name, sector, expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <select
                  value={mentorTypeFilter}
                  onChange={(e) => setMentorTypeFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="all">All Delivery Modes</option>
                  <option value="personal">1-on-1 Mentors</option>
                  <option value="group">Cohort Advisors</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="rounded-xl border-[#8d4624]/25 text-[#8d4624] hover:bg-[#8d4624]/10 h-11 px-4 text-xs font-semibold gap-1.5"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  {showAdvancedFilters ? 'Fewer Filters' : 'More Filters'}
                </Button>

                {entrepreneurProfile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#8d4624]/20">
                    <span className="text-xs font-semibold text-stone-700">Smart Match</span>
                    <input 
                      type="checkbox" 
                      checked={matchingMode}
                      onChange={() => setMatchingMode(!matchingMode)}
                      className="accent-[#8d4624] w-4 h-4 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-[#8d4624]/15">
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">All Sectors</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Tailoring & Garments">Tailoring & Garments</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Agriculture & Farming">Agriculture & Farming</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                  </select>

                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Experience Scale</option>
                    <option value="0-2">Beginner (0-2 yrs)</option>
                    <option value="3-5">Intermediate (3-5 yrs)</option>
                    <option value="6-10">Expert (6-10 yrs)</option>
                    <option value="10+">Master (10+ yrs)</option>
                  </select>

                  <select
                    value={priceRangeFilter}
                    onChange={(e) => setPriceRangeFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Fee Brackets</option>
                    <option value="0-2000">₹0 - ₹2,000</option>
                    <option value="2001-3500">₹2,001 - ₹3,500</option>
                    <option value="3501+">₹3,501+</option>
                  </select>

                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className={selectClass}
                  >
                    <option value="all">Vernacular / Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              )}
            </div>

            {/* Mentor Cards Grid (Uniform Fixed Height Layout) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="p-5 rounded-2xl border border-[#8d4624]/20 space-y-4 h-[390px] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <div className="space-y-2 pt-2 border-t border-[#8d4624]/10">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#8d4624]/10 flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-28 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMentors.map((mentor) => {
                  const connection = connections.find(conn => conn.mentorId === mentor.id);
                  const isConnected = connection && connection.status === 'active';
                  const mentorDisplayName =
                    (mentor.name && typeof mentor.name === 'string' && mentor.name.trim()) ||
                    `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() ||
                    mentor.email ||
                    'Mentor';

                  return (
                    <div key={mentor.id} className={sectionClass}>
                      {/* Top Content */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-stone-900 truncate" title={mentorDisplayName}>
                              {mentorDisplayName}
                            </h3>
                            <p className="text-xs text-[#8d4624] font-medium truncate mt-0.5">
                              {mentor.sector || 'Industry Expert'}
                            </p>
                          </div>
                          {mentor._matchScore !== undefined ? (
                            <Badge className="bg-[#f5e9dd] text-[#8d4624] border border-[#8d4624]/25 text-[10px] font-semibold shrink-0">
                              {mentor._matchScore}% Match
                            </Badge>
                          ) : mentor.mentorType ? (
                            <Badge variant="outline" className="border-[#8d4624]/25 text-[#8d4624] text-[10px] font-medium shrink-0 capitalize">
                              {mentor.mentorType === 'both' ? '1:1 & Cohort' : mentor.mentorType}
                            </Badge>
                          ) : null}
                        </div>

                        {/* Clamped description with view more modal trigger */}
                        <div>
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed h-[36px]">
                            {mentor.bio || mentor.expertise || 'Experienced advisor ready to support entrepreneurial growth.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setViewDetailsMentor(mentor)}
                            className="text-[11px] font-semibold text-[#8d4624] hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            View Profile Details
                          </button>
                        </div>

                        {/* Metadata Rows (Consistent Fixed Spacing) */}
                        <div className="space-y-1.5 pt-2 border-t border-[#8d4624]/10 text-xs text-stone-500">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPinIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {[mentor.location?.city, mentor.location?.state].filter(Boolean).join(', ') || 'Remote Advisor'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 truncate">
                            <LanguageIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {mentor.languages?.length ? mentor.languages.slice(0, 3).join(', ') : 'English / Hindi'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <div className="flex items-center gap-1 text-[#8d4624] font-medium">
                              <StarIcon className="w-3.5 h-3.5 fill-[#8d4624]" />
                              <span>{mentor.rating ? Number(mentor.rating).toFixed(1) : 'New'} ({mentor.totalReviews || 0})</span>
                            </div>
                            <span className="text-stone-400 text-[11px]">
                              {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} yrs exp` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fixed Bottom Action Row */}
                      <div className="pt-3 border-t border-[#8d4624]/10 flex items-center justify-between gap-2 mt-auto">
                        <div className="min-w-0">
                          <span className="text-[10px] text-stone-400 font-medium block uppercase tracking-wider">Session Fee</span>
                          <span className="text-xs font-bold text-stone-900 truncate block">
                            {mentor.personalSessionPrice ? `₹${mentor.personalSessionPrice.toLocaleString('en-IN')}/hr` : 'Free Advisory'}
                          </span>
                        </div>
                        
                        <div className="shrink-0">
                          {isConnected ? (
                            <Button
                              size="sm"
                              onClick={() => openChat(connection)}
                              className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-4 h-9 shadow-xs"
                            >
                              Open Chat
                            </Button>
                          ) : connection?.status === 'pending' ? (
                            <Badge variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-[11px] h-9 px-3 flex items-center justify-center font-semibold">
                              Pending
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnect(mentor, 'personal')}
                              className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-4 h-9 font-semibold shadow-xs"
                            >
                              Request Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Free Groups */}
        {activeTab === 'freeGroups' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {freeGroups.map((group) => {
                const isJoined = myFreeGroups.some(g => g.id === group.id);
                const memberCount = group.participants?.length || 0;
                const maxMembers = group.maxParticipants || 0;
                const isFull = maxMembers > 0 && memberCount >= maxMembers;

                return (
                  <div key={group.id} className={sectionClass}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-stone-900 truncate">{group.groupName}</h3>
                          <p className="text-xs text-[#8d4624] font-medium truncate">Mentor: {group.mentorName}</p>
                        </div>
                        <Badge className="bg-[#f5e9dd] text-[#8d4624] border-none text-[10px] shrink-0">FREE</Badge>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed h-[54px]">{group.description}</p>

                      <div className="text-xs text-stone-500 pt-2 border-t border-[#8d4624]/10 space-y-1">
                        <p className="truncate">Sector: {group.sector || 'General'}</p>
                        <p className="truncate">Language: {group.language || 'English'}</p>
                        <p>Enrolled: {memberCount}{maxMembers ? `/${maxMembers}` : ''} members</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#8d4624]/10 mt-auto">
                      {isJoined ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenGroupChat(group)}
                            className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs flex-1 h-9"
                          >
                            Open Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLeaveGroup(group.id)}
                            className="text-stone-500 hover:text-red-600 rounded-xl text-xs h-9"
                          >
                            Leave
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleJoinGroup(group)}
                          className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs w-full font-semibold h-9"
                        >
                          {isFull ? 'Group Full' : 'Join Free Community'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Group Mentoring Sessions (Paid) */}
        {activeTab === 'groupSessions' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupSessions.map((session) => {
                const isEnrolled = myGroupSessions.some(s => s.id === session.id);
                const enrolledCount = session.currentParticipants?.length || 0;
                const maxParticipants = session.maxParticipants || 0;
                const isFull = maxParticipants > 0 && enrolledCount >= maxParticipants;

                return (
                  <div key={session.id} className={sectionClass}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-stone-900 truncate">{session.groupName}</h3>
                          <p className="text-xs text-[#8d4624] font-medium truncate">Lead: {session.mentorName}</p>
                        </div>
                        <span className="text-xs font-bold text-[#8d4624] shrink-0">₹{session.price}</span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed h-[54px]">{session.description}</p>

                      <div className="space-y-1 text-xs text-stone-500 pt-2 border-t border-[#8d4624]/10">
                        <p className="truncate">Schedule: {session.schedule?.day} at {session.schedule?.time}</p>
                        <p>Capacity: {enrolledCount}/{maxParticipants} seats filled</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#8d4624]/10 mt-auto">
                      {isEnrolled ? (
                        session.meetingLink ? (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs h-9 font-semibold"
                          >
                            Enter Session
                          </a>
                        ) : (
                          <Badge variant="outline" className="w-full text-center py-2 border-[#8d4624]/30 text-[#8d4624] block text-xs">
                            Enrolled
                          </Badge>
                        )
                      ) : (
                        <Button
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleEnrollGroupSession(session)}
                          className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold h-9"
                        >
                          {isFull ? 'Seats Filled' : `Enroll (₹${session.price})`}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: My Connections */}
        {activeTab === 'myMentors' && (
          <div className="space-y-6">
            {connections.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-[#8d4624] mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-stone-900">No active connections yet</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Initiate a request from the personal mentors directory to schedule your first advisory call.
                </p>
                <Button
                  onClick={() => setActiveTab('find')}
                  className="mt-4 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs px-5"
                >
                  Explore Mentors
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((connection) => (
                  <div key={connection.id} className="p-5 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-stone-900">{connection.mentorName}</h3>
                        <p className="text-xs text-[#8d4624] font-medium">{connection.mentorType} Session</p>
                      </div>
                      <Badge variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-[11px] capitalize">
                        {connection.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#8d4624]/10 space-y-2">
                      {connection.status === 'active' || connection.status === 'completed' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openChat(connection)}
                            className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs h-9"
                          >
                            Open Conversation
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openFeedbackModal(connection, { id: connection.mentorId, name: connection.mentorName })}
                            className="w-full text-stone-600 hover:text-stone-900 rounded-xl text-xs"
                          >
                            Leave Review
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-stone-400 text-center py-2">
                          {connection.paymentStatus === 'pending' ? 'Payment validation pending...' : 'Awaiting mentor acceptance'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

{/* Mentor Profile Details Modal */}
<Dialog open={!!viewDetailsMentor} onOpenChange={(open) => !open && setViewDetailsMentor(null)}>
  <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col rounded-3xl border border-[#8d4624]/20 bg-[#f5e9dd]/95 backdrop-blur-md shadow-2xl overflow-hidden">
    {viewDetailsMentor && (
      <>
        {/* Fixed Header */}
        <div className="bg-[#8d4624] text-white p-6 shrink-0 flex items-center justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-bold text-white">
              {viewDetailsMentor.name || `${viewDetailsMentor.firstName || ''} ${viewDetailsMentor.lastName || ''}`.trim() || 'Advisor Dossier'}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-[11px]">
                {viewDetailsMentor.sector || 'General Industry'}
              </Badge>
              {viewDetailsMentor.yearsOfExperience && (
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-[11px]">
                  {viewDetailsMentor.yearsOfExperience} Years Experience
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/70 uppercase block">Fee</span>
            <span className="text-lg font-bold text-white">
              {viewDetailsMentor.personalSessionPrice ? `₹${viewDetailsMentor.personalSessionPrice.toLocaleString('en-IN')}/hr` : 'Free'}
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-2 flex items-center gap-1.5">
              <BriefcaseIcon className="w-4 h-4" /> About Advisor
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white/60 p-4 rounded-2xl border border-[#8d4624]/15">
              {viewDetailsMentor.bio || viewDetailsMentor.description || 'No extended bio provided.'}
            </p>
          </div>

          {/* Areas of Expertise */}
          {(viewDetailsMentor.expertise || viewDetailsMentor.expertiseAreas) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-2 flex items-center gap-1.5">
                <AcademicCapIcon className="w-4 h-4" /> Focus & Specialization
              </h4>
              <div className="bg-white/60 p-4 rounded-2xl border border-[#8d4624]/15 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {Array.isArray(viewDetailsMentor.expertiseAreas)
                  ? viewDetailsMentor.expertiseAreas.join(', ')
                  : viewDetailsMentor.expertise || 'Not specified'}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/60 border border-[#8d4624]/15">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">Location</span>
              <p className="text-xs font-semibold text-stone-800 mt-0.5">
                {[viewDetailsMentor.location?.city, viewDetailsMentor.location?.state].filter(Boolean).join(', ') || 'Remote'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/60 border border-[#8d4624]/15">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">Languages</span>
              <p className="text-xs font-semibold text-stone-800 mt-0.5">
                {viewDetailsMentor.languages?.join(', ') || 'English, Hindi'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/60 border border-[#8d4624]/15">
              <span className="text-[10px] text-stone-400 font-semibold uppercase block">Response Time</span>
              <p className="text-xs font-semibold text-stone-800 mt-0.5">
                {viewDetailsMentor.responseTime || 'Within 24 hours'}
              </p>
            </div>
          </div>

          {/* Availability */}
          {viewDetailsMentor.availableDays?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-2 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" /> Available Days
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {viewDetailsMentor.availableDays.map((day) => (
                  <Badge key={day} variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-[11px] bg-white/50">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="p-4 bg-white/70 border-t border-[#8d4624]/15 shrink-0 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setViewDetailsMentor(null)}
            className="rounded-xl border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10 text-xs px-4"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              const mentorToConnect = viewDetailsMentor;
              setViewDetailsMentor(null);
              handleConnect(mentorToConnect, 'personal');
            }}
            className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold px-5"
          >
            Request Mentorship
          </Button>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>

      {/* Floating Status Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="mentors-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="fixed top-6 right-6 z-50 w-full max-w-sm"
          >
            <div className={`p-4 rounded-2xl shadow-xl text-xs font-semibold backdrop-blur-md border ${
              message.toLowerCase().includes('success') 
                ? 'bg-[#f5e9dd]/95 text-[#8d4624] border-[#8d4624]/30' 
                : 'bg-red-50/95 text-red-700 border-red-200'
            }`}>
              {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Gateway Modal (Simulated) */}
      {showPaymentModal && selectedMentor && (
        <div className="fixed inset-0 backdrop-blur-sm bg-stone-900/30 flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#8d4624]/20 shadow-xl space-y-5 bg-[#f5e9dd]/95 backdrop-blur-md">
            <h2 className="text-xl font-bold text-stone-900">Confirm Advisory Booking</h2>
            <div className="text-xs text-stone-600 space-y-2 border-y border-[#8d4624]/10 py-4">
              <p>Mentor: <span className="font-semibold text-stone-900">{selectedMentor.name}</span></p>
              <p>Format: <span className="font-semibold text-stone-900">Personal Advisory Session</span></p>
              <p className="text-sm font-bold text-[#8d4624] pt-1">
                Fee: ₹{selectedMentor.personalSessionPrice?.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMentor(null);
                }}
                className="flex-1 rounded-xl text-xs border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePaymentSuccess(`PAY_${Date.now()}`)}
                className="flex-1 bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
              >
                Pay & Start
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-stone-900/30 flex justify-center items-center z-50 p-4">
          <div className="rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#8d4624]/20 shadow-xl space-y-4 bg-[#f5e9dd]/95 backdrop-blur-md">
            <h3 className="text-base font-bold text-stone-900">
              Review Session with {feedbackTarget?.mentor.name}
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className={`text-2xl ${star <= feedbackRating ? 'text-[#8d4624]' : 'text-stone-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="What takeaways or next actions were established?"
              rows={3}
              className="w-full text-xs rounded-xl border border-[#8d4624]/25 p-3 focus:outline-none focus:ring-1 focus:ring-[#8d4624] bg-transparent"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setFeedbackModalOpen(false)}
                className="rounded-xl text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </Button>
              <Button
                disabled={submittingFeedback || feedbackRating === 0}
                onClick={submitFeedback}
                className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold"
              >
                {submittingFeedback ? 'Posting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
    </DashboardLayout>
  );
}