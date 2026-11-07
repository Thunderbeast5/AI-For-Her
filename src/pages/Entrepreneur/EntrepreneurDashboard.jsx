import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GroupChatInterface from '../../components/GroupChatInterface';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EntrepreneurDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mentorConnections: 0,
    aiConversations: 0,
    opportunitiesApplied: 0,
    journeyProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [myFreeGroups, setMyFreeGroups] = useState([]);
  const [myGroupSessions, setMyGroupSessions] = useState([]);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [investmentProjects, setInvestmentProjects] = useState([]);
  const [selectedInvestmentProject, setSelectedInvestmentProject] = useState(null);
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(null);
  const [showAllStartups, setShowAllStartups] = useState(false);
  const [showAllInvestmentProjects, setShowAllInvestmentProjects] = useState(false);

  const quickActions = [
    {
      title: t('actions.findMentor'),
      description: t('actions.findMentorDesc'),
      icon: AcademicCapIcon,
      action: () => navigate('/mentors')
    },
    {
      title: t('actions.askAI'),
      description: t('actions.askAIDesc'),
      icon: ChatBubbleLeftRightIcon,
      action: () => navigate('/chat')
    },
    {
      title: t('actions.viewOpportunities'),
      description: t('actions.viewOpportunitiesDesc'),
      icon: EyeIcon,
      action: () => navigate('/opportunities')
    }
  ];

  const handleDownloadStartupPDF = (startup) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 20;
    const lineHeight = 10;

    doc.setFillColor(141, 70, 36);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Startup Proposal', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    yPosition = 50;

    const addText = (label, value, isBold = false) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(50, 45, 40);
      if (isBold) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      doc.text(label, 20, yPosition);
      if (value) {
        doc.setFont(undefined, 'normal');
        const textLines = doc.splitTextToSize(String(value), 170);
        doc.text(textLines, 20, yPosition + 6);
        yPosition += 6 + (textLines.length * 5);
      }
      yPosition += lineHeight;
    };

    const addSectionHeader = (title) => {
      if (yPosition > pageHeight - margin - 15) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(141, 70, 36);
      doc.text(title, 20, yPosition);
      yPosition += lineHeight;
    };

    addSectionHeader('Basic Information');
    addText('Startup Name:', startup.name || 'Not provided');
    addText('Industry:', startup.industry || 'Not provided');
    addText('Stage:', startup.stage || 'Not provided');
    addText('Description:', startup.description || 'Not provided');
    addText('Tagline:', startup.tagline || 'Not provided');
    addText('Location:', startup.location || 'Not provided');

    addSectionHeader('Business Details');
    addText('Problem Statement:', startup.problemStatement || 'Not provided');
    addText('Solution:', startup.solution || 'Not provided');
    addText('Target Market:', startup.targetMarket || 'Not provided');
    addText('Unique Selling Point:', startup.uniqueSellingPoint || 'Not provided');
    addText('Value Proposition:', startup.valueProposition || 'Not provided');

    addSectionHeader('Financial Information');
    addText('Funding Goal:', startup.fundingGoal ? `₹${startup.fundingGoal.toLocaleString()}` : 'Not provided');
    addText('Current Revenue:', startup.currentRevenue ? `₹${startup.currentRevenue.toLocaleString()}` : 'Not provided');
    addText('Revenue Model:', startup.revenueModel || 'Not provided');
    addText('Projected Revenue:', startup.projectedRevenue || 'Not provided');
    addText('Investment Use:', startup.investmentUse || 'Not provided');

    addSectionHeader('Team Information');
    addText('Founder Name:', startup.founderName || 'Not provided');
    addText('Email:', startup.email || 'Not provided');
    addText('Phone:', startup.phone || 'Not provided');
    addText('Team Size:', startup.teamSize || 'Not provided');

    const fileName = `${startup.name?.replace(/\s+/g, '_') || 'startup'}_proposal.pdf`;
    doc.save(fileName);
  };

  const handleDeleteStartup = async (startupId) => {
    try {
      await deleteDoc(doc(db, 'startups', startupId));
      setMyStartups(prev => prev.filter(s => (s._id || s.id) !== startupId));
      setShowDeleteConfirm(null);
      toast.success('Startup deleted successfully');
    } catch (error) {
      console.error('Error deleting startup:', error);
      toast.error('Failed to delete startup. Please try again.');
    }
  };

  const handleEditStartup = (startup) => {
    navigate('/create-startup', { state: { startup } });
  };

  const handleDeleteInvestmentProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, 'investment-projects', projectId));
      setInvestmentProjects(prev => prev.filter(p => p._id !== projectId));
      setShowDeleteProjectConfirm(null);
      toast.success('Investment project deleted successfully');
    } catch (error) {
      console.error('Error deleting investment project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setUserData(currentUser);

        const startupsQuery = query(
          collection(db, 'startups'),
          where('userId', '==', currentUser.uid)
        );
        const connectionsQuery = query(
          collection(db, 'connections'),
          where('menteeId', '==', currentUser.uid),
          where('status', 'in', ['active', 'completed'])
        );
        const groupsQuery = query(
          collection(db, 'mentorGroups'),
          where('participants', 'array-contains', currentUser.uid)
        );
        const sessionsQuery = query(
          collection(db, 'groupSessions'),
          where('participants', 'array-contains', currentUser.uid)
        );
        const investmentProjectsQuery = query(
          collection(db, 'investment-projects'),
          where('userId', '==', currentUser.uid)
        );

        const [
          startupsSnapshot,
          connectionsSnapshot,
          groupsSnapshot,
          sessionsSnapshot,
          investmentProjectsSnapshot,
        ] = await Promise.all([
          getDocs(startupsQuery),
          getDocs(connectionsQuery),
          getDocs(groupsQuery),
          getDocs(sessionsQuery),
          getDocs(investmentProjectsQuery),
        ]);

        const startups = startupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyStartups(startups);

        const mentorConnectionsCount = connectionsSnapshot.size;
        const freeGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyFreeGroups(freeGroups);

        const groupSessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyGroupSessions(groupSessions);

        const projects = investmentProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvestmentProjects(projects);

        const opportunitiesApplied = startups.length + freeGroups.length + groupSessions.length;

        setStats({
          mentorConnections: mentorConnectionsCount,
          aiConversations: 0,
          opportunitiesApplied: opportunitiesApplied,
          journeyProgress: calculateJourneyProgress(startups),
        });

        const activities = [];
        if (startups.length > 0) {
          const recentStartup = startups.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.())[0];
          activities.push({
            title: `Created venture: ${recentStartup.name}`,
            time: recentStartup.createdAt?.toDate ? new Date(recentStartup.createdAt.toDate()).toLocaleDateString() : 'Recent',
            icon: SparklesIcon,
          });
        }
        if (activities.length === 0) {
          activities.push({
            title: 'Welcome to your workspace',
            time: 'Just now',
            icon: SparklesIcon,
          });
        }
        setRecentActivity(activities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const calculateJourneyProgress = (startups) => {
    if (!startups || startups.length === 0) return 0;
    const stageToProgress = {
      'Ideation': 12.5,
      'Concept Research': 25,
      'Prototype / MVP': 37.5,
      'Validation': 50,
      'Launch': 62.5,
      'Growth': 75,
      'Expansion / Funding': 87.5,
      'Scaling / Maturity': 100
    };
    let maxProgress = 0;
    startups.forEach(startup => {
      const progress = stageToProgress[startup.stage] || 0;
      if (progress > maxProgress) {
        maxProgress = progress;
      }
    });
    return maxProgress;
  };

  const sidebar = useMemo(() => <EntrepreneurSidebar />, []);

  const getDisplayName = () => {
    if (userData?.firstName) return userData.firstName;
    if (currentUser?.displayName) return currentUser.displayName.split(' ')[0];
    return currentUser?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="space-y-10 pb-16">
          {/* Welcome Header Skeleton */}
          <div className="pt-2 space-y-2">
            <Skeleton className="h-10 w-64 sm:w-96 rounded-xl bg-stone-200/60" />
            <Skeleton className="h-4 w-72 sm:w-80 rounded-lg bg-stone-200/60" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/70 border border-stone-200/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="w-12 h-12 rounded-xl bg-stone-200/70" />
                  <Skeleton className="w-8 h-8 rounded-full bg-stone-200/60" />
                </div>
                <Skeleton className="h-5 w-32 rounded-md bg-stone-200/70" />
                <Skeleton className="h-3 w-48 rounded-md bg-stone-200/60" />
              </div>
            ))}
          </div>

          {/* Metrics Strip Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/60 border border-stone-200/60 space-y-2"
              >
                <Skeleton className="h-3 w-28 rounded-md bg-stone-200/60" />
                <Skeleton className="h-8 w-14 rounded-lg bg-stone-200/70" />
              </div>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="p-4 px-6 rounded-2xl bg-white/40 border border-stone-200/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-stone-200/70" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded-md bg-stone-200/60" />
                <Skeleton className="h-4 w-48 rounded-md bg-stone-200/70" />
              </div>
            </div>
            <Skeleton className="h-3 w-16 rounded-md bg-stone-200/60" />
          </div>

          {/* Startups Section Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-36 rounded-lg bg-stone-200/70" />
                <Skeleton className="h-3 w-56 rounded-md bg-stone-200/60" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl bg-stone-200/70" />
            </div>

            <div className="p-6 rounded-2xl bg-white/70 border border-stone-200/80 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44 rounded-lg bg-stone-200/70" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-5 w-24 rounded-md bg-stone-200/60" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-xl bg-stone-200/60" />
                  <Skeleton className="h-9 w-9 rounded-xl bg-stone-200/60" />
                  <Skeleton className="h-9 w-16 rounded-xl bg-stone-200/70" />
                </div>
              </div>

              <Skeleton className="h-10 w-full rounded-md bg-stone-200/60" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Skeleton className="h-16 rounded-xl bg-stone-200/50" />
                <Skeleton className="h-16 rounded-xl bg-stone-200/50" />
                <Skeleton className="h-16 rounded-xl bg-stone-200/50" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-10 pb-16">
        {/* Simple Clean Welcome Header without Background Box */}
        <div className="pt-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Welcome, <span className="text-[#8d4624]">{getDisplayName()}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Actions (Floating Frosted Glass Tiles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="group relative p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/70 dark:border-stone-800/80 hover:border-[#8d4624]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 text-stone-400 group-hover:bg-[#8d4624] group-hover:text-white transition-colors duration-200">
                  <ArrowUpRightIcon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">{action.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{action.description}</p>
            </div>
          ))}
        </div>

        {/* Floating Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-stone-900/40 backdrop-blur-lg border border-stone-200/60 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('dashboard.stats.mentorConnections')}</span>
            <div className="text-3xl font-black text-stone-900 mt-2">{stats.mentorConnections}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-stone-900/40 backdrop-blur-lg border border-stone-200/60 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('dashboard.stats.aiConversations')}</span>
            <div className="text-3xl font-black text-stone-900 mt-2">{stats.aiConversations}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-stone-900/40 backdrop-blur-lg border border-stone-200/60 shadow-xs">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('dashboard.stats.opportunitiesApplied')}</span>
            <div className="text-3xl font-black text-stone-900 mt-2">{stats.opportunitiesApplied}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-stone-900/40 backdrop-blur-lg border border-stone-200/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{t('dashboard.stats.journeyProgress')}</span>
              <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624] font-semibold text-[11px] px-2">
                {stats.journeyProgress}%
              </Badge>
            </div>
            <div className="mt-3">
              <Progress value={stats.journeyProgress} className="h-1.5 bg-stone-100" />
            </div>
          </div>
        </div>

        {/* Recent Activity Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 px-6 rounded-2xl bg-white/40 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f5e9dd] flex items-center justify-center shrink-0 text-[#8d4624]">
              <ClockIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Latest Update</span>
              <p className="text-sm font-semibold text-stone-800">{recentActivity[0]?.title}</p>
            </div>
          </div>
          <span className="text-xs text-stone-400 shrink-0 font-medium">{recentActivity[0]?.time}</span>
        </div>

        {/* My Startups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">My Startups</h2>
              <p className="text-xs text-stone-500 mt-0.5">Active venture profiles and generated proposals</p>
            </div>
            <Button
              onClick={() => navigate('/create-startup')}
              size="sm"
              className="bg-[#8d4624] hover:bg-[#72371c] text-white shadow-sm rounded-xl px-4 font-medium"
            >
              Create New +
            </Button>
          </div>

          {myStartups.length > 0 ? (
            <div className="space-y-4">
              {(showAllStartups ? myStartups : myStartups.slice(0, 1)).map((startup) => (
                <div
                  key={startup._id || startup.id}
                  onClick={() => setSelectedStartup(startup)}
                  className="group relative p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 hover:border-[#8d4624]/40 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#8d4624] transition-colors">
                        {startup.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                          <TagIcon className="w-3.5 h-3.5 mr-1" />
                          {startup.industry || startup.category || 'General'}
                        </Badge>
                        <Badge className="bg-[#8d4624] text-white text-xs font-semibold px-2.5 py-0.5 rounded-md hover:bg-[#72371c]">
                          <TrophyIcon className="w-3.5 h-3.5 mr-1" />
                          {startup.stage || 'Not specified'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditStartup(startup)}
                        className="rounded-xl h-9 w-9 text-stone-600 hover:text-[#8d4624] hover:bg-[#f5e9dd]/50"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteConfirm(startup._id || startup.id)}
                        className="rounded-xl h-9 w-9 text-stone-600 hover:text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadStartupPDF(startup)}
                        className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl gap-1.5 px-3"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-5">
                    {startup.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {startup.targetMarket && (
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/50">
                        <span className="text-[11px] font-medium text-stone-500 block uppercase">Target Market</span>
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-0.5 truncate">{startup.targetMarket}</p>
                      </div>
                    )}
                    {startup.fundingGoal && (
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/50">
                        <span className="text-[11px] font-medium text-stone-500 block uppercase">Funding Goal</span>
                        <p className="text-xs sm:text-sm font-semibold text-[#8d4624] mt-0.5">₹{startup.fundingGoal.toLocaleString()}</p>
                      </div>
                    )}
                    {startup.teamSize && (
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/50 col-span-2 sm:col-span-1">
                        <span className="text-[11px] font-medium text-stone-500 block uppercase">Team</span>
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 mt-0.5">{startup.teamSize} members</p>
                      </div>
                    )}
                  </div>

                  {(startup.hasWebsite || startup.hasPrototype || startup.hasMinimumViableProduct || startup.hasRevenue || startup.hasFunding) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100">
                      <span className="text-xs font-semibold text-stone-500 mr-2">Milestones:</span>
                      {startup.hasWebsite && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">✓ Website</span>}
                      {startup.hasPrototype && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">✓ Prototype</span>}
                      {startup.hasMinimumViableProduct && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">✓ MVP</span>}
                      {startup.hasRevenue && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">✓ Revenue</span>}
                      {startup.hasFunding && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">✓ Funding</span>}
                    </div>
                  )}
                </div>
              ))}

              {myStartups.length > 1 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllStartups(!showAllStartups)}
                    className="text-[#8d4624] hover:bg-[#f5e9dd] text-xs font-semibold rounded-full px-5"
                  >
                    {showAllStartups ? 'Show Less' : `View All Startups (${myStartups.length})`}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-dashed border-stone-300 text-center bg-white/40 backdrop-blur-sm">
              <SparklesIcon className="w-8 h-8 text-[#8d4624] mx-auto mb-2 opacity-60" />
              <h4 className="text-base font-semibold text-stone-900">No Startups Registered</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">Create your first startup profile to unlock pitching tools and smart insights.</p>
              <Button
                onClick={() => navigate('/create-startup')}
                className="mt-4 bg-[#8d4624] hover:bg-[#72371c] text-white text-xs rounded-xl"
              >
                Register Startup
              </Button>
            </div>
          )}
        </div>

        {/* Investment Portfolios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">Investment Portfolios</h2>
              <p className="text-xs text-stone-500 mt-0.5">Campaigns listed for funding and investor engagement</p>
            </div>
            <Button
              onClick={() => navigate('/list-project')}
              size="sm"
              className="bg-[#8d4624] hover:bg-[#72371c] text-white shadow-sm rounded-xl px-4 font-medium"
            >
              List New Project +
            </Button>
          </div>

          {investmentProjects.length > 0 ? (
            <div className="space-y-4">
              {(showAllInvestmentProjects ? investmentProjects : investmentProjects.slice(0, 1)).map((project, index) => {
                const fundingPercentage = project.fundingPercentage || 0;
                const remainingAmount = project.fundingGoal - (project.currentFunding || 0);
                const daysLeft = project.fundingDeadline 
                  ? Math.max(0, Math.ceil((new Date(project.fundingDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
                  : 0;

                return (
                  <div
                    key={project._id || project.id || index}
                    className="p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 hover:border-[#8d4624]/40 shadow-xs hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">{project.projectName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className="bg-[#f5e9dd] text-[#8d4624] border-none text-xs font-semibold px-2.5 py-0.5">
                            <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1" />
                            {project.status?.toUpperCase() || 'ACTIVE'}
                          </Badge>
                          {daysLeft > 0 && project.status === 'active' && (
                            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50/60 text-xs">
                              <ClockIcon className="w-3.5 h-3.5 mr-1" />
                              {daysLeft} days remaining
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvestmentProject(project)}
                          className="rounded-xl text-[#8d4624] hover:bg-[#f5e9dd]/50"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/list-project', { state: { editProject: project } })}
                          className="rounded-xl text-stone-600 hover:text-[#8d4624] hover:bg-stone-100"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteProjectConfirm(project._id)}
                          className="rounded-xl text-stone-600 hover:text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-5">
                      {project.projectDescription}
                    </p>

                    <div className="space-y-1.5 mb-5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-600">Fundraising Trajectory</span>
                        <span className="font-bold text-[#8d4624]">{fundingPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(fundingPercentage, 100)} className="h-2 bg-stone-100" />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 block uppercase">Raised</span>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">₹{(project.currentFunding || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 block uppercase">Target Goal</span>
                        <p className="text-sm font-bold text-stone-900 mt-0.5">₹{project.fundingGoal?.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-stone-400 block uppercase">Remaining</span>
                        <p className="text-sm font-bold text-[#8d4624] mt-0.5">₹{remainingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {investmentProjects.length > 1 && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllInvestmentProjects(!showAllInvestmentProjects)}
                    className="text-[#8d4624] hover:bg-[#f5e9dd] text-xs font-semibold rounded-full px-5"
                  >
                    {showAllInvestmentProjects ? 'Show Less' : `View All Portfolios (${investmentProjects.length})`}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-dashed border-stone-300 text-center bg-white/40 backdrop-blur-sm">
              <CurrencyDollarIcon className="w-8 h-8 text-[#8d4624] mx-auto mb-2 opacity-60" />
              <h4 className="text-base font-semibold text-stone-900">No Projects Listed</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">Open your business to investors and track contributions cleanly.</p>
              <Button
                onClick={() => navigate('/list-project')}
                className="mt-4 bg-[#8d4624] hover:bg-[#72371c] text-white text-xs rounded-xl"
              >
                List Project
              </Button>
            </div>
          )}
        </div>

        {/* Communities & Cohorts */}
        {(myFreeGroups.length > 0 || myGroupSessions.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {myFreeGroups.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-stone-900">Joined Communities</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/mentors')} className="text-xs text-[#8d4624] font-medium">
                    Explore +
                  </Button>
                </div>
                <div className="space-y-3">
                  {myFreeGroups.map((group, index) => (
                    <div
                      key={group._id || group.id || index}
                      className="p-4 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/70 hover:border-[#8d4624]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-stone-900">{group.groupName}</h4>
                        <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624] text-[10px] px-2 py-0">FREE</Badge>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1">{group.description}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-3">
                        <UsersIcon className="w-3.5 h-3.5" />
                        <span>{group.currentParticipants?.length || 0}/{group.maxParticipants} Members</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myGroupSessions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-stone-900">Mentoring Sessions</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/mentors')} className="text-xs text-[#8d4624] font-medium">
                    Browse +
                  </Button>
                </div>
                <div className="space-y-3">
                  {myGroupSessions.map((session, index) => (
                    <div
                      key={session._id || session.id || index}
                      className="p-4 rounded-2xl bg-white/70 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/70 hover:border-[#8d4624]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-stone-900">{session.groupName}</h4>
                        <span className="text-xs font-bold text-[#8d4624]">₹{session.price}</span>
                      </div>
                      <p className="text-xs text-[#8d4624] font-medium mb-2">Mentor: {session.mentorName}</p>
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" /> {session.schedule?.day} at {session.schedule?.time}
                        </span>
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#8d4624] hover:underline"
                          >
                            <VideoCameraIcon className="w-3.5 h-3.5" /> Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Startup Details Modal */}
      <Dialog open={!!selectedStartup} onOpenChange={(open) => !open && setSelectedStartup(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col rounded-3xl border border-stone-200 shadow-2xl bg-white">
          {selectedStartup && (
            <>
              <div className="bg-[#8d4624] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white tracking-tight">{selectedStartup.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-xs">
                      {selectedStartup.industry || selectedStartup.category}
                    </Badge>
                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-xs">
                      {selectedStartup.stage}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      handleEditStartup(selectedStartup);
                      setSelectedStartup(null);
                    }}
                    className="gap-1.5 text-stone-800 bg-white hover:bg-stone-100 rounded-xl font-medium"
                  >
                    <PencilIcon className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadStartupPDF(selectedStartup)}
                    className="gap-1.5 text-[#8d4624] bg-white hover:bg-stone-100 rounded-xl font-medium"
                  >
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" /> PDF
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-3">Overview</h4>
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-stone-500 block">Description</span>
                        <p className="text-sm text-stone-800 mt-0.5 leading-relaxed">{selectedStartup.description || 'Not provided'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200/40">
                        <div>
                          <span className="text-xs font-semibold text-stone-500 block">Founder</span>
                          <p className="text-sm font-medium text-stone-800">{selectedStartup.founderName || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-stone-500 block">Location</span>
                          <p className="text-sm font-medium text-stone-800">{selectedStartup.location || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-3">Strategy & Proposition</h4>
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-stone-500 block">Problem Statement</span>
                        <p className="text-sm text-stone-800 mt-0.5 leading-relaxed">{selectedStartup.problemStatement || 'Not provided'}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-200/40">
                        <span className="text-xs font-semibold text-stone-500 block">Solution</span>
                        <p className="text-sm text-stone-800 mt-0.5 leading-relaxed">{selectedStartup.solution || 'Not provided'}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-200/40">
                        <span className="text-xs font-semibold text-stone-500 block">Value Proposition</span>
                        <p className="text-sm text-stone-800 mt-0.5 leading-relaxed">{selectedStartup.valueProposition || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8d4624] mb-3">Funding & Financials</h4>
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                      <div>
                        <span className="text-xs font-semibold text-stone-500 block">Funding Goal</span>
                        <p className="text-lg font-bold text-[#8d4624]">
                          {selectedStartup.fundingGoal ? `₹${selectedStartup.fundingGoal.toLocaleString()}` : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-stone-500 block">Current Revenue</span>
                        <p className="text-lg font-bold text-stone-800">
                          {selectedStartup.currentRevenue ? `₹${selectedStartup.currentRevenue.toLocaleString()}` : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Startup Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">Delete Startup?</DialogTitle>
            <DialogDescription className="text-xs text-stone-500 mt-1">
              Are you sure you want to delete this startup profile? This action is permanent and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl text-xs" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl text-xs"
              onClick={() => handleDeleteStartup(showDeleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <Dialog open={!!showDeleteProjectConfirm} onOpenChange={(open) => !open && setShowDeleteProjectConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">Delete Investment Portfolio?</DialogTitle>
            <DialogDescription className="text-xs text-stone-500 mt-1">
              Are you sure you want to remove this project? All associated investor history will be unlinked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl text-xs" onClick={() => setShowDeleteProjectConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl text-xs"
              onClick={() => handleDeleteInvestmentProject(showDeleteProjectConfirm)}
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EntrepreneurDashboard;