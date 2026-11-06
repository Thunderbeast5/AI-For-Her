import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  LockClosedIcon,
  LightBulbIcon,
  CogIcon,
  RocketLaunchIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const Journey = () => {
  const { currentUser } = useAuth()
  const [startupStage, setStartupStage] = useState('Ideation')
  const [loading, setLoading] = useState(true)

  // Stage to progress percentage mapping (matching CreateStartup)
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

  // Fetch user's startup to get the current stage
  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const userId = currentUser?.uid
        if (userId) {
          const q = query(collection(db, 'startups'), where('userId', '==', userId))
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            const startupData = querySnapshot.docs[0].data()
            setStartupStage(startupData.stage || 'Ideation')
          }
        }
      } catch (error) {
        console.error('Error fetching startup:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStartup()
    const pollInterval = setInterval(fetchStartup, 5000)
    return () => clearInterval(pollInterval)
  }, [currentUser?.uid])

  const overallProgress = stageToProgress[startupStage] || 12.5

  const getCurrentMilestoneStatus = (milestoneStage) => {
    const currentProgress = stageToProgress[startupStage] || 12.5
    const milestoneProgress = stageToProgress[milestoneStage] || 0
    
    if (currentProgress > milestoneProgress) {
      return 'completed'
    } else if (currentProgress === milestoneProgress) {
      return 'in_progress'
    } else if (currentProgress === milestoneProgress - 12.5) {
      return 'pending'
    }
    return 'locked'
  }

  const milestones = [
    {
      id: 1,
      title: "Ideation",
      stage: "Ideation",
      description: "Define your business idea and identify the core friction you are solving",
      status: getCurrentMilestoneStatus("Ideation"),
      icon: LightBulbIcon,
      progress: startupStage === 'Ideation' ? 50 : (stageToProgress[startupStage] >= 12.5 ? 100 : 0),
      tasks: [
        { name: "Identify problem to solve", completed: stageToProgress[startupStage] >= 12.5 },
        { name: "Define target audience", completed: stageToProgress[startupStage] >= 12.5 },
        { name: "Brainstorm solutions", completed: stageToProgress[startupStage] >= 12.5 },
        { name: "Create initial concept", completed: stageToProgress[startupStage] >= 12.5 }
      ],
      recommendations: [
        "Focus on defining a verifiable operational problem for your niche.",
        "Engage 10-15 early consumers directly before writing implementation plans.",
        "Document foundational concepts and defensible differentiators early."
      ]
    },
    {
      id: 2,
      title: "Concept Research",
      stage: "Concept Research",
      description: "Conduct thorough ecosystem research and validate your commercial opportunity",
      status: getCurrentMilestoneStatus("Concept Research"),
      icon: CogIcon,
      progress: startupStage === 'Concept Research' ? 50 : (stageToProgress[startupStage] >= 25 ? 100 : 0),
      tasks: [
        { name: "Market research", completed: stageToProgress[startupStage] >= 25 },
        { name: "Customer interviews", completed: stageToProgress[startupStage] >= 25 },
        { name: "Competitor analysis", completed: stageToProgress[startupStage] >= 25 },
        { name: "Problem-solution fit", completed: stageToProgress[startupStage] >= 25 }
      ],
      recommendations: [
        "Map direct and indirect alternative options in the market.",
        "Gather direct customer interview insights on willingness to pay.",
        "Establish quantitative baseline criteria for proof-of-concept validation."
      ]
    },
    {
      id: 3,
      title: "Prototype / MVP",
      stage: "Prototype / MVP",
      description: "Engineer a lean initial version to test mechanics with early users",
      status: getCurrentMilestoneStatus("Prototype / MVP"),
      icon: CogIcon,
      progress: startupStage === 'Prototype / MVP' ? 50 : (stageToProgress[startupStage] >= 37.5 ? 100 : 0),
      tasks: [
        { name: "Define core features", completed: stageToProgress[startupStage] >= 37.5 },
        { name: "Create wireframes/prototype", completed: stageToProgress[startupStage] >= 37.5 },
        { name: "Develop MVP", completed: stageToProgress[startupStage] >= 37.5 },
        { name: "Initial user testing", completed: stageToProgress[startupStage] >= 37.5 }
      ],
      recommendations: [
        "Narrow development strictly to primary value drivers.",
        "Leverage no-code or component kits to minimize turnaround time.",
        "Gather direct behavioral feedback on user interaction workflows."
      ]
    },
    {
      id: 4,
      title: "Validation",
      stage: "Validation",
      description: "Verify product-market metrics with real adopters and refine based on input",
      status: getCurrentMilestoneStatus("Validation"),
      icon: CheckCircleIcon,
      progress: startupStage === 'Validation' ? 50 : (stageToProgress[startupStage] >= 50 ? 100 : 0),
      tasks: [
        { name: "Beta testing", completed: stageToProgress[startupStage] >= 50 },
        { name: "Gather user feedback", completed: stageToProgress[startupStage] >= 50 },
        { name: "Iterate based on feedback", completed: stageToProgress[startupStage] >= 50 },
        { name: "Validate product-market fit", completed: stageToProgress[startupStage] >= 50 }
      ],
      recommendations: [
        "Onboard 20-30 active pilot users for structured trial periods.",
        "Track weekly retention and active usage milestones.",
        "Iterate the model swiftly based on adoption data."
      ]
    },
    {
      id: 5,
      title: "Launch",
      stage: "Launch",
      description: "Deploy product publicly and kick off target acquisition initiatives",
      status: getCurrentMilestoneStatus("Launch"),
      icon: RocketLaunchIcon,
      progress: startupStage === 'Launch' ? 50 : (stageToProgress[startupStage] >= 62.5 ? 100 : 0),
      tasks: [
        { name: "Plan launch strategy", completed: stageToProgress[startupStage] >= 62.5 },
        { name: "Execute marketing campaigns", completed: stageToProgress[startupStage] >= 62.5 },
        { name: "Build customer base", completed: stageToProgress[startupStage] >= 62.5 },
        { name: "Monitor launch metrics", completed: stageToProgress[startupStage] >= 62.5 }
      ],
      recommendations: [
        "Coordinate communications across local and community networks.",
        "Provide clear onboarding incentives for early adopters.",
        "Keep feedback and issue response loops immediate."
      ]
    },
    {
      id: 6,
      title: "Growth",
      stage: "Growth",
      description: "Drive sustained customer acquisition, retention, and channel optimization",
      status: getCurrentMilestoneStatus("Growth"),
      icon: ChartBarIcon,
      progress: startupStage === 'Growth' ? 50 : (stageToProgress[startupStage] >= 75 ? 100 : 0),
      tasks: [
        { name: "Scale marketing efforts", completed: stageToProgress[startupStage] >= 75 },
        { name: "Optimize conversion funnel", completed: stageToProgress[startupStage] >= 75 },
        { name: "Expand customer base", completed: stageToProgress[startupStage] >= 75 },
        { name: "Improve unit economics", completed: stageToProgress[startupStage] >= 75 }
      ],
      recommendations: [
        "Double down on marketing channels demonstrating repeatable conversion.",
        "Introduce referral and organic word-of-mouth incentives.",
        "Monitor lifetime value relative to customer acquisition cost."
      ]
    },
    {
      id: 7,
      title: "Expansion / Funding",
      stage: "Expansion / Funding",
      description: "Secure expansion funding, institutional backing, and scale infrastructure",
      status: getCurrentMilestoneStatus("Expansion / Funding"),
      icon: CurrencyRupeeIcon,
      progress: startupStage === 'Expansion / Funding' ? 50 : (stageToProgress[startupStage] >= 87.5 ? 100 : 0),
      tasks: [
        { name: "Prepare pitch deck", completed: stageToProgress[startupStage] >= 87.5 },
        { name: "Approach investors", completed: stageToProgress[startupStage] >= 87.5 },
        { name: "Secure funding", completed: stageToProgress[startupStage] >= 87.5 },
        { name: "Plan expansion strategy", completed: stageToProgress[startupStage] >= 87.5 }
      ],
      recommendations: [
        "Utilize government loan and grant programs for supplementary leverage.",
        "Engage verified mentors and angels through platform dossiers.",
        "Maintain clean bookkeeping and multi-year projection summaries."
      ]
    },
    {
      id: 8,
      title: "Scaling / Maturity",
      stage: "Scaling / Maturity",
      description: "Solidify market presence, organizational leadership, and financial health",
      status: getCurrentMilestoneStatus("Scaling / Maturity"),
      icon: ChartBarIcon,
      progress: startupStage === 'Scaling / Maturity' ? 100 : 0,
      tasks: [
        { name: "Scale team and operations", completed: stageToProgress[startupStage] >= 100 },
        { name: "Expand to new markets", completed: stageToProgress[startupStage] >= 100 },
        { name: "Build strategic partnerships", completed: stageToProgress[startupStage] >= 100 },
        { name: "Achieve sustainable profitability", completed: stageToProgress[startupStage] >= 100 }
      ],
      recommendations: [
        "Institute standardized procedures and strong internal culture.",
        "Automate administrative overhead where viable.",
        "Explore strategic partnerships to enter adjacent markets."
      ]
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircleIconSolid
      case 'in_progress':
        return ClockIcon
      case 'pending':
        return ClockIcon
      case 'locked':
        return LockClosedIcon
      default:
        return ClockIcon
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
      case 'in_progress':
        return 'text-[#8d4624] bg-[#f5e9dd] border border-[#8d4624]/30'
      case 'pending':
        return 'text-amber-700 bg-amber-50/70 border border-amber-200/60'
      case 'locked':
        return 'text-stone-400 bg-stone-100/60 border border-stone-200/60'
      default:
        return 'text-stone-400 bg-stone-100/60 border border-stone-200/60'
    }
  }

  const sectionClass = "p-6 rounded-2xl bg-transparent border border-[#8d4624]/20 transition-all hover:border-[#8d4624]/35 space-y-4"
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="space-y-8 pb-20">
        
        {/* Overall Progress Container */}
        <div className="p-6 sm:p-7 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#8d4624] uppercase tracking-wider block mb-1">
                Progression Tracker
              </span>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-stone-900">Venture Trajectory</h2>
                <Badge className="bg-[#f5e9dd] text-[#8d4624] border border-[#8d4624]/25 text-xs font-semibold px-2.5 py-0.5">
                  {startupStage}
                </Badge>
              </div>
            </div>
            <span className="text-3xl font-black text-stone-900">{Math.round(overallProgress)}%</span>
          </div>

          <div className="space-y-2">
            <Progress value={overallProgress} className="h-2.5 bg-stone-100" />
            <p className="text-xs text-stone-500 leading-relaxed">
              {overallProgress < 50 
                ? "You're off to a solid start. Continue testing your hypotheses and validating demand." 
                : overallProgress < 100 
                  ? "Steady execution. Focus on sustainable customer unit economics and core metrics."
                  : "Excellent milestone completion. Your venture has reached operational maturity."}
            </p>
          </div>
        </div>

        {/* Milestones Flow */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-[#8d4624]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {milestones.map((milestone, index) => {
              const StatusIcon = getStatusIcon(milestone.status)
              const MilestoneIcon = milestone.icon

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`${sectionClass} ${milestone.status === 'locked' ? 'opacity-55' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Status Badge Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getStatusColor(milestone.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Title & Stage Indicators */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-stone-900">{milestone.title}</h3>
                          <Badge variant="outline" className="border-[#8d4624]/25 text-[#8d4624] text-[10px] capitalize">
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                          <MilestoneIcon className="w-4 h-4 text-[#8d4624]" />
                          <span>{milestone.progress}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">{milestone.description}</p>

                      {/* Stage Progress Bar */}
                      <Progress value={milestone.progress} className="h-1.5 bg-stone-100" />

                      {/* Checklist Tasks */}
                      {milestone.status !== 'locked' && (
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                            Key Objectives:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {milestone.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} className="flex items-center gap-2">
                                {task.completed ? (
                                  <CheckCircleIconSolid className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 border border-stone-300 rounded-full shrink-0" />
                                )}
                                <span className={`text-xs ${
                                  task.completed ? 'text-stone-400 line-through' : 'text-stone-700 font-medium'
                                }`}>
                                  {task.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advisory Recommendations */}
                      {milestone.recommendations.length > 0 && milestone.status !== 'locked' && (
                        <div className="p-3.5 rounded-xl border border-[#8d4624]/20 space-y-2 mt-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8d4624]">
                            <LightBulbIcon className="w-4 h-4" />
                            <span>Recommended Steps:</span>
                          </div>
                          <ul className="space-y-1">
                            {milestone.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="text-xs text-stone-600 leading-relaxed flex items-start gap-1.5">
                                <span className="text-[#8d4624] font-bold">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action trigger */}
                      {(milestone.status === 'in_progress' || milestone.status === 'pending') && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-xs"
                          >
                            {milestone.status === 'in_progress' ? 'Continue Execution' : 'Initiate Stage'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Journey