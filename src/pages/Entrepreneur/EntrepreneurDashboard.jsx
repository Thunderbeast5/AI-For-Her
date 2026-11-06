import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GroupChatInterface from '../../components/GroupChatInterface'
import { useAuth } from '../../hooks/useAuth'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import WarliLoader from '../../components/WarliLoader'
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
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

const EntrepreneurDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    mentorConnections: 0,
    aiConversations: 0,
    opportunitiesApplied: 0,
    journeyProgress: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [myStartups, setMyStartups] = useState([])
  const [myFreeGroups, setMyFreeGroups] = useState([])
  const [myGroupSessions, setMyGroupSessions] = useState([])
  const [selectedGroupChat, setSelectedGroupChat] = useState(null)
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [investmentProjects, setInvestmentProjects] = useState([])
  const [selectedInvestmentProject, setSelectedInvestmentProject] = useState(null)
  const [showDeleteProjectConfirm, setShowDeleteProjectConfirm] = useState(null)
  const [showAllStartups, setShowAllStartups] = useState(false)
  const [showAllInvestmentProjects, setShowAllInvestmentProjects] = useState(false)

  const quickActions = [
    {
      title: t('actions.findMentor'),
      description: t('actions.findMentorDesc'),
      icon: AcademicCapIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/mentors')
    },
    {
      title: t('actions.askAI'),
      description: t('actions.askAIDesc'),
      icon: ChatBubbleLeftRightIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/chat')
    },
    {
      title: t('actions.viewOpportunities'),
      description: t('actions.viewOpportunitiesDesc'),
      icon: EyeIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/opportunities')
    },
    {
      title: 'Manage Products',
      description: 'Add and manage products for your enterprise store',
      icon: CurrencyDollarIcon,
      color: "from-pink-200 to-pink-300",
      action: () => navigate('/enterprise/products')
    }
  ]

  const handleDownloadStartupPDF = (startup) => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = 20
    const lineHeight = 10

    // Header
    doc.setFillColor(236, 72, 153)
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('Startup Proposal', doc.internal.pageSize.width / 2, 25, { align: 'center' })
    
    yPosition = 50

    const addText = (label, value, isBold = false) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      if (isBold) {
        doc.setFont(undefined, 'bold')
      } else {
        doc.setFont(undefined, 'normal')
      }
      doc.text(label, 20, yPosition)
      
      if (value) {
        doc.setFont(undefined, 'normal')
        const textLines = doc.splitTextToSize(String(value), 170)
        doc.text(textLines, 20, yPosition + 7)
        yPosition += 7 + (textLines.length * 5)
      }
      yPosition += lineHeight
    }

    // Basic Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Basic Information', 20, yPosition)
    yPosition += lineHeight

    addText('Startup Name:', startup.name || 'Not provided')
    addText('Industry:', startup.industry || 'Not provided')
    addText('Stage:', startup.stage || 'Not provided')
    addText('Description:', startup.description || 'Not provided')
    addText('Tagline:', startup.tagline || 'Not provided')
    addText('Location:', startup.location || 'Not provided')

    // Business Details
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Business Details', 20, yPosition)
    yPosition += lineHeight

    addText('Problem Statement:', startup.problemStatement || 'Not provided')
    addText('Solution:', startup.solution || 'Not provided')
    addText('Target Market:', startup.targetMarket || 'Not provided')
    addText('Unique Selling Point:', startup.uniqueSellingPoint || 'Not provided')
    addText('Value Proposition:', startup.valueProposition || 'Not provided')

    // Financial Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Financial Information', 20, yPosition)
    yPosition += lineHeight

    addText('Funding Goal:', startup.fundingGoal || 'Not provided')
    addText('Current Revenue:', startup.currentRevenue || 'Not provided')
    addText('Revenue Model:', startup.revenueModel || 'Not provided')
    addText('Projected Revenue:', startup.projectedRevenue || 'Not provided')
    addText('Investment Use:', startup.investmentUse || 'Not provided')

    // Team Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Team Information', 20, yPosition)
    yPosition += lineHeight

    addText('Founder Name:', startup.founderName || 'Not provided')
    addText('Email:', startup.email || 'Not provided')
    addText('Phone:', startup.phone || 'Not provided')
    addText('Team Size:', startup.teamSize || 'Not provided')
    addText('Team Members:', startup.teamMembers || 'Not provided')

    // Additional Information
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(236, 72, 153)
    doc.text('Additional Information', 20, yPosition)
    yPosition += lineHeight

    addText('Features:', startup.features || 'Not provided')
    addText('Technology:', startup.technology || 'Not provided')
    addText('Customer Base:', startup.customerBase || 'Not provided')
    addText('Market Size:', startup.marketSize || 'Not provided')
    addText('Competitive Advantage:', startup.competitiveAdvantage || 'Not provided')
    addText('Founded Date:', startup.foundedDate || 'Not provided')

    // Footer
    const fileName = `${startup.name?.replace(/\s+/g, '_') || 'startup'}_proposal.pdf`
    doc.save(fileName)
  }

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
    // Navigate to create-startup page with startup data
    navigate('/create-startup', { state: { startup } })
  }

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

        // Prepare queries
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

        // Run Firestore reads in parallel
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
          aiConversations: 0, // Placeholder
          opportunitiesApplied: opportunitiesApplied,
          journeyProgress: calculateJourneyProgress(startups),
        });

        // Build recent activity
        const activities = [];
        if (startups.length > 0) {
          const recentStartup = startups.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())[0];
          activities.push({
            title: `Created startup: ${recentStartup.name}`,
            time: new Date(recentStartup.createdAt.toDate()).toLocaleDateString(),
            icon: SparklesIcon,
          });
        }
        if (activities.length === 0) {
          activities.push({
            title: 'Welcome to AI For Her!',
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

  // Calculate journey progress based on startup stages
  const calculateJourneyProgress = (startups) => {
    if (!startups || startups.length === 0) return 0
    
    // Stage to progress mapping (matching the 8 stages from CreateStartup)
    const stageToProgress = {
      'Ideation': 12.5,
      'Concept Research': 25,
      'Prototype / MVP': 37.5,
      'Validation': 50,
      'Launch': 62.5,
      'Growth': 75,
      'Expansion / Funding': 87.5,
      'Scaling / Maturity': 100
    }
    
    // Get the highest stage progress from all startups
    let maxProgress = 0
    startups.forEach(startup => {
      const progress = stageToProgress[startup.stage] || 0
      if (progress > maxProgress) {
        maxProgress = progress
      }
    })
    
    return maxProgress
  }

  
  // Memoize sidebar to prevent re-rendering on state changes
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  // Get display name
  const getDisplayName = () => {
    if (userData?.firstName) {
      return userData.firstName
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]
    }
    return currentUser?.email?.split('@')[0] || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <WarliLoader size={88} />
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.welcome')}, {getDisplayName()} 
        </h1>
        <p className="text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      {/* Your AI Mentor Hub */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.mentorHub')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              onClick={action.action}
              className="p-6 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border-border/60"
            >
              <div className={`w-12 h-12 bg-linear-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-gray-900">{stats.mentorConnections}</div>
            <div className="text-sm text-gray-600 mt-1">{t('dashboard.stats.mentorConnections')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-gray-900">{stats.aiConversations}</div>
            <div className="text-sm text-gray-600 mt-1">{t('dashboard.stats.aiConversations')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="text-2xl font-bold text-gray-900">{stats.opportunitiesApplied}</div>
            <div className="text-sm text-gray-600 mt-1">{t('dashboard.stats.opportunitiesApplied')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">{stats.journeyProgress}%</div>
              <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624]">Journey</Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">{t('dashboard.stats.journeyProgress')}</div>
            <Progress value={stats.journeyProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mb-8 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <activity.icon className="w-4 h-4 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Startups */}
      <Card className="mb-8 border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl">My Startups ({myStartups.length})</CardTitle>
            <CardDescription>Manage your venture profiles and generate investment proposals</CardDescription>
          </div>
          <Button
            onClick={() => navigate('/create-startup')}
            size="sm"
            className="bg-[#8d4624] hover:bg-[#72371c] text-white"
          >
            Create New +
          </Button>
        </CardHeader>

        <CardContent>
          {myStartups.length > 0 ? (
            <div className="space-y-4">
              {(showAllStartups ? myStartups : myStartups.slice(0, 1)).map((startup) => (
                <div
                  key={startup._id || startup.id}
                  className="border border-border/70 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer bg-card"
                  onClick={() => setSelectedStartup(startup)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{startup.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1 bg-[#f5e9dd] text-[#8d4624]">
                          <TagIcon className="w-3.5 h-3.5" />
                          {startup.industry || startup.category || 'General'}
                        </Badge>
                        <Badge className="bg-[#8d4624] text-white flex items-center gap-1 hover:bg-[#72371c]">
                          <TrophyIcon className="w-3.5 h-3.5" />
                          {startup.stage || 'Not specified'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditStartup(startup)
                        }}
                        title="Edit Startup"
                      >
                        <PencilIcon className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(startup._id || startup.id)
                        }}
                        title="Delete Startup"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadStartupPDF(startup)
                        }}
                        className="bg-[#8d4624] hover:bg-[#72371c] text-white gap-1"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{startup.description}</p>

                  {/* All Startup Fields */}
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    {startup.targetMarket && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/40">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <UsersIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Target Market</span>
                        </div>
                        <p className="text-sm text-foreground font-medium">{startup.targetMarket}</p>
                      </div>
                    )}

                    {startup.fundingGoal && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/40">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Funding Goal</span>
                        </div>
                        <p className="text-sm text-foreground font-medium">₹{startup.fundingGoal.toLocaleString()}</p>
                      </div>
                    )}

                    {startup.teamSize && (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border/40">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <UsersIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Team Size</span>
                        </div>
                        <p className="text-sm text-foreground font-medium">{startup.teamSize} members</p>
                      </div>
                    )}
                  </div>

                  {/* Checkboxes / Milestones */}
                  {(startup.hasWebsite || startup.hasPrototype || startup.hasMinimumViableProduct || startup.hasRevenue || startup.hasFunding) && (
                    <div className="bg-green-50/70 border border-green-200/60 rounded-lg p-3 mb-4">
                      <span className="text-xs font-semibold text-green-900 block mb-2">Milestones Achieved</span>
                      <div className="flex flex-wrap gap-2">
                        {startup.hasWebsite && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✓ Website</Badge>
                        )}
                        {startup.hasPrototype && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✓ Prototype</Badge>
                        )}
                        {startup.hasMinimumViableProduct && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✓ MVP</Badge>
                        )}
                        {startup.hasRevenue && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✓ Revenue</Badge>
                        )}
                        {startup.hasFunding && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">✓ Funding</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedStartup(startup)
                      }}
                      className="text-[#8d4624] hover:text-[#72371c] hover:bg-[#f5e9dd]"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              ))}

              {myStartups.length > 1 && (
                <div className="pt-2 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllStartups(!showAllStartups)}
                    className="text-[#8d4624] hover:bg-[#f5e9dd]"
                  >
                    {showAllStartups ? 'Show Less' : 'Show More'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">No Startups Yet</h4>
              <p className="text-muted-foreground text-sm mb-6">Create your first startup profile to get started!</p>
              <Button
                onClick={() => navigate('/create-startup')}
                className="bg-[#8d4624] hover:bg-[#72371c] text-white"
              >
                Create Your First Startup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Projects Listed for Funding */}
      <Card className="mb-8 border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Projects Listed for Investment ({investmentProjects.length})</CardTitle>
            <CardDescription>Track your public fundraising progress and investor contributions</CardDescription>
          </div>
          <Button
            onClick={() => navigate('/list-project')}
            size="sm"
            className="bg-[#8d4624] hover:bg-[#72371c] text-white"
          >
            List New Project +
          </Button>
        </CardHeader>
        
        <CardContent>
          {investmentProjects.length > 0 ? (
            <div className="space-y-4">
              {(showAllInvestmentProjects ? investmentProjects : investmentProjects.slice(0, 1)).map((project, index) => {
                const fundingPercentage = project.fundingPercentage || 0
                const remainingAmount = project.fundingGoal - (project.currentFunding || 0)
                const daysLeft = project.fundingDeadline 
                  ? Math.max(0, Math.ceil((new Date(project.fundingDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
                  : 0
                
                return (
                  <div 
                    key={project._id || project.id || index}
                    className="border border-border/70 rounded-xl p-5 hover:shadow-md transition-all bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.projectName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant={project.status === 'funded' ? 'default' : 'secondary'} className={
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'funded' ? 'bg-[#8d4624] text-white' :
                            'bg-gray-100 text-gray-700'
                          }>
                            <CurrencyDollarIcon className="w-3.5 h-3.5 mr-1" />
                            {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                          </Badge>
                          {daysLeft > 0 && project.status === 'active' && (
                            <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                              <ClockIcon className="w-3.5 h-3.5 mr-1" />
                              {daysLeft} days left
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvestmentProject(project)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/list-project', { state: { editProject: project } })}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteProjectConfirm(project._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                      {project.projectDescription}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-4 space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">Funding Progress</span>
                        <span className="font-bold text-[#8d4624]">{fundingPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(fundingPercentage, 100)} className="h-2.5" />
                    </div>

                    {/* Funding Stats */}
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-green-50/70 border border-green-200/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-green-700 mb-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Raised</span>
                        </div>
                        <p className="text-base font-bold text-green-900">₹{(project.currentFunding || 0).toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-blue-50/70 border border-blue-200/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                          <UsersIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Investors</span>
                        </div>
                        <p className="text-base font-bold text-blue-900">{project.investors?.length || 0}</p>
                      </div>
                      
                      <div className="bg-[#f7efe5] border border-[#e8dcc4] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-[#8d4624] mb-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Remaining</span>
                        </div>
                        <p className="text-base font-bold text-[#4a3228]">₹{remainingAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Goal Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50 text-sm text-muted-foreground">
                      <div>
                        Goal: <span className="font-semibold text-foreground">₹{project.fundingGoal?.toLocaleString()}</span>
                        {' • '}
                        Equity: <span className="font-semibold text-foreground">{project.equityOffered}%</span>
                      </div>
                      {project.status === 'funded' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          ✓ Fully Funded
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">No Projects Listed Yet</h4>
              <p className="text-muted-foreground text-sm mb-6">List your startup for investment to attract investors!</p>
              <Button
                onClick={() => navigate('/list-project')}
                className="bg-[#8d4624] hover:bg-[#72371c] text-white"
              >
                List Your First Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Groups Section */}
      {(myFreeGroups.length > 0 || myGroupSessions.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* My Free Groups */}
          {myFreeGroups.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">My Free Groups</CardTitle>
                  <CardDescription>Community groups you have joined</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/mentors')}
                >
                  Browse +
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-3">
                    {myFreeGroups.map((group, index) => (
                      <div 
                        key={group._id || group.id || index}
                        className="border border-border/70 rounded-xl p-4 hover:shadow-xs transition-all bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900">{group.groupName}</h4>
                            <p className="text-xs text-muted-foreground">by {group.mentorName}</p>
                          </div>
                          <Badge variant="secondary" className="bg-[#f5e9dd] text-[#8d4624]">
                            FREE
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description}</p>

                        <div className="flex items-center text-xs text-muted-foreground">
                          <UsersIcon className="w-4 h-4 mr-1" />
                          <span>{group.currentParticipants?.length || 0}/{group.maxParticipants} Members</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* My Group Mentoring Sessions (Paid) */}
          {myGroupSessions.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">Group Mentoring Sessions</CardTitle>
                  <CardDescription>Paid sessions you are enrolled in</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/mentors')}
                >
                  Browse +
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-3">
                    {myGroupSessions.map((session, index) => (
                      <div 
                        key={session._id || session.id || index}
                        className="border border-border/70 rounded-xl p-4 hover:shadow-xs transition-all bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900">{session.groupName}</h4>
                            <p className="text-xs font-medium text-[#8d4624]">by {session.mentorName}</p>
                          </div>
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                            PAID
                          </Badge>
                        </div>

                        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span><strong>{session.schedule?.day}</strong> at {session.schedule?.time}</span>
                          </div>
                          <div className="flex items-center">
                            <UsersIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{session.currentParticipants?.length || 0}/{session.maxParticipants} Enrolled</span>
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="font-semibold text-[#8d4624]">₹{session.price}</span>
                          </div>
                        </div>

                        {session.meetingLink && (
                          <Button asChild size="sm" className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white">
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <VideoCameraIcon className="w-4 h-4" />
                              Join Session
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Group Chat Modal */}
      <Dialog open={!!selectedGroupChat} onOpenChange={(open) => !open && setSelectedGroupChat(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Group Chat</DialogTitle>
          {selectedGroupChat && (
            <GroupChatInterface
              groupId={selectedGroupChat.groupId}
              groupName={selectedGroupChat.groupName}
              currentUser={{
                userId: currentUser.userId,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
              }}
              onClose={() => setSelectedGroupChat(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Startup Details Modal */}
      <Dialog open={!!selectedStartup} onOpenChange={(open) => !open && setSelectedStartup(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedStartup && (
            <>
              <div className="bg-[#8d4624] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1.5">{selectedStartup.name}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                      {selectedStartup.industry || selectedStartup.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                      {selectedStartup.stage}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      handleEditStartup(selectedStartup)
                      setSelectedStartup(null)
                    }}
                    className="gap-1.5 text-blue-700 bg-white hover:bg-white/90"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Startup
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownloadStartupPDF(selectedStartup)}
                    className="gap-1.5 text-[#8d4624] bg-white hover:bg-white/90"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Basic Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.founderName && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Founder Name</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.founderName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tagline</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.tagline || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.description || 'Not provided'}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Location</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Founded Date</label>
                      <p className="text-gray-900 font-medium">
                        {selectedStartup.foundedDate 
                          ? new Date(selectedStartup.foundedDate).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Current Stage</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.stage || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Problem & Solution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Problem & Solution
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Problem Statement</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.problemStatement || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Solution</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.solution || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Target Market</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.targetMarket || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Unique Selling Point</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.uniqueSellingPoint || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Value Proposition</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.valueProposition || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Product Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Features</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.features) 
                        ? selectedStartup.features.join(', ') 
                        : selectedStartup.features || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Technology Stack</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.technology) 
                        ? selectedStartup.technology.join(', ') 
                        : selectedStartup.technology || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funding Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Funding Goal</label>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedStartup.fundingGoal ? `₹${selectedStartup.fundingGoal.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Current Revenue</label>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedStartup.currentRevenue ? `₹${selectedStartup.currentRevenue.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Revenue Model</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.revenueModel || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Projected Revenue</label>
                    <p className="text-gray-900 font-medium">
                      {selectedStartup.projectedRevenue ? `₹${selectedStartup.projectedRevenue.toLocaleString()}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Investment Use</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.investmentUse || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Team Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Team Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Team Size</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.teamSize || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Key Hires Needed</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.keyHires) 
                        ? selectedStartup.keyHires.join(', ') 
                        : selectedStartup.keyHires || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market & Traction */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Market & Traction
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Customer Base</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.customerBase || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Monthly Active Users</label>
                      <p className="text-gray-900 font-medium">{selectedStartup.monthlyActiveUsers || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Market Size</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.marketSize || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Competitors</label>
                    <p className="text-gray-900 font-medium">
                      {Array.isArray(selectedStartup.competitors) 
                        ? selectedStartup.competitors.join(', ') 
                        : selectedStartup.competitors || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Competitive Advantage</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.competitiveAdvantage || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Key Achievements</label>
                    <p className="text-gray-900">
                      {Array.isArray(selectedStartup.achievements) 
                        ? selectedStartup.achievements.join(', ') 
                        : selectedStartup.achievements || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Model */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Business Model
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Model</label>
                    <p className="text-gray-900">{selectedStartup.businessModel || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pricing Strategy</label>
                    <p className="text-gray-900">{selectedStartup.pricingStrategy || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Links & Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Links & Documents
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <a href={selectedStartup.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.website}
                      </a>
                    </div>
                  )}
                  {selectedStartup.pitchDeck && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Pitch Deck</label>
                      <a href={selectedStartup.pitchDeck} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        View Pitch Deck
                      </a>
                    </div>
                  )}
                  {selectedStartup.socialMedia?.linkedIn && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                      <a href={selectedStartup.socialMedia.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.socialMedia.linkedIn}
                      </a>
                    </div>
                  )}
                  {selectedStartup.socialMedia?.twitter && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Twitter</label>
                      <a href={selectedStartup.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        {selectedStartup.socialMedia.twitter}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedStartup.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <a href={`mailto:${selectedStartup.email}`} className="text-blue-600 hover:underline block">
                        {selectedStartup.email}
                      </a>
                    </div>
                  )}
                  {selectedStartup.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <a href={`tel:${selectedStartup.phone}`} className="text-blue-600 hover:underline block">
                        {selectedStartup.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Looking For */}
              {selectedStartup.lookingFor && selectedStartup.lookingFor.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    What We're Looking For
                  </h3>
                  <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedStartup.lookingFor.map((item, index) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-white text-purple-700 rounded-full text-sm font-medium shadow-sm border border-purple-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </DialogContent>
  </Dialog>

      {/* Delete Investment Project Confirmation Modal */}
      <Dialog open={!!showDeleteProjectConfirm} onOpenChange={(open) => !open && setShowDeleteProjectConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Investment Project?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this investment project? All associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteProjectConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteInvestmentProject(showDeleteProjectConfirm)}
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investment Project Detail Modal */}
      <Dialog open={!!selectedInvestmentProject} onOpenChange={(open) => !open && setSelectedInvestmentProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedInvestmentProject && (
            <>
              <div className="bg-[#8d4624] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1.5">{selectedInvestmentProject.projectName}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none capitalize">
                      {selectedInvestmentProject.status || 'Active'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigate('/list-project', { state: { editProject: selectedInvestmentProject } })
                      setSelectedInvestmentProject(null)
                    }}
                    className="gap-1.5 text-blue-700 bg-white hover:bg-white/90"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Project
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteProjectConfirm(selectedInvestmentProject._id)
                      setSelectedInvestmentProject(null)
                    }}
                    className="gap-1.5 text-red-600 bg-white hover:bg-white/90"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Project
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">

              {/* Funding Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Overview
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Funding Goal</label>
                      <p className="text-xl font-bold text-gray-900">₹{selectedInvestmentProject.fundingGoal?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Funding</label>
                      <p className="text-xl font-bold text-green-600">₹{selectedInvestmentProject.currentFunding?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Remaining</label>
                      <p className="text-xl font-bold text-gray-900">₹{(selectedInvestmentProject.fundingGoal - selectedInvestmentProject.currentFunding)?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-linear-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(selectedInvestmentProject.fundingPercentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Min. Investment</label>
                      <p className="font-semibold text-gray-900">₹{selectedInvestmentProject.minimumInvestment?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Equity Offered</label>
                      <p className="font-semibold text-gray-900">{selectedInvestmentProject.equityOffered}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Valuation</label>
                      <p className="font-semibold text-gray-900">₹{(selectedInvestmentProject.valuationAmount / 10000000).toFixed(1)}Cr</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Total Investors</label>
                      <p className="font-semibold text-gray-900">{selectedInvestmentProject.totalInvestors || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Project Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{selectedInvestmentProject.projectDescription}</p>
                </div>
              </div>

              {/* Funding Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-pink-500 rounded"></div>
                  Funding Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedInvestmentProject.fundingDeadline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Deadline</label>
                        <p className="text-gray-900">
                          {new Date(selectedInvestmentProject.fundingDeadline).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedInvestmentProject.maximumInvestment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Max Investment</label>
                        <p className="text-gray-900">₹{selectedInvestmentProject.maximumInvestment?.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {selectedInvestmentProject.fundingPurpose && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Funding Purpose</label>
                      <p className="text-gray-900">{selectedInvestmentProject.fundingPurpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              {(selectedInvestmentProject.revenueModel || selectedInvestmentProject.currentRevenue !== undefined) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Financial Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedInvestmentProject.currentRevenue !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Current Revenue</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.currentRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.projectedRevenue && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Projected Revenue</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.projectedRevenue?.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.revenueModel && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Revenue Model</label>
                          <p className="text-gray-900">{selectedInvestmentProject.revenueModel}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.monthlyBurnRate && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Monthly Burn Rate</label>
                          <p className="text-gray-900">₹{selectedInvestmentProject.monthlyBurnRate?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Milestones & Timeline */}
              {(selectedInvestmentProject.milestones?.length > 0 || selectedInvestmentProject.timeline) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Milestones & Timeline
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedInvestmentProject.milestones?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Milestones</label>
                        <ul className="mt-2 space-y-1">
                          {selectedInvestmentProject.milestones.map((milestone, idx) => (
                            <li key={idx} className="text-gray-900 flex items-start gap-2">
                              <span className="text-pink-500">•</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedInvestmentProject.timeline && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Timeline</label>
                        <p className="text-gray-900">{selectedInvestmentProject.timeline}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Market & Traction */}
              {(selectedInvestmentProject.marketSize || selectedInvestmentProject.customerBase) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Market & Traction
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedInvestmentProject.marketSize && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Market Size</label>
                          <p className="text-gray-900">{selectedInvestmentProject.marketSize}</p>
                        </div>
                      )}
                      {selectedInvestmentProject.customerBase !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Customer Base</label>
                          <p className="text-gray-900">{selectedInvestmentProject.customerBase?.toLocaleString()} customers</p>
                        </div>
                      )}
                    </div>
                    {selectedInvestmentProject.competitiveAdvantage && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Competitive Advantage</label>
                        <p className="text-gray-900">{selectedInvestmentProject.competitiveAdvantage}</p>
                      </div>
                    )}
                    {selectedInvestmentProject.growthRate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Growth Rate</label>
                        <p className="text-gray-900">{selectedInvestmentProject.growthRate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team */}
              {(selectedInvestmentProject.teamSize || selectedInvestmentProject.keyTeamMembers?.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Team Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {selectedInvestmentProject.teamSize && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Team Size</label>
                        <p className="text-gray-900">{selectedInvestmentProject.teamSize} members</p>
                      </div>
                    )}
                    {selectedInvestmentProject.keyTeamMembers?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Key Team Members</label>
                        <ul className="mt-2 space-y-1">
                          {selectedInvestmentProject.keyTeamMembers.map((member, idx) => (
                            <li key={idx} className="text-gray-900">{member}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Investors List */}
              {selectedInvestmentProject.investors?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-pink-500 rounded"></div>
                    Current Investors ({selectedInvestmentProject.investors.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedInvestmentProject.investors.map((investor, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{investor.investorName}</p>
                            <p className="text-sm text-gray-600">{investor.investorEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{investor.amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{investor.equityPercentage?.toFixed(2)}% equity</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Startup?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this startup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteStartup(showDeleteConfirm)}
            >
              Delete Startup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default EntrepreneurDashboard
