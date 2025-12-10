import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar';
import { useAuth } from '../../hooks/useAuth';
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
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

// --- Custom Pink Styles ---
const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
// ----------------------------

const Journey = () => {
  const { currentUser } = useAuth();
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
        const userId = currentUser.uid;
        if (userId) {
          const q = query(collection(db, 'startups'), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const startupData = querySnapshot.docs[0].data();
            setStartupStage(startupData.stage || 'Ideation');
          }
        }
      } catch (error) {
        console.error('Error fetching startup:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStartup()

    // Poll for stage updates every 5 seconds
    const pollInterval = setInterval(fetchStartup, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }, [currentUser.uid])

  const overallProgress = stageToProgress[startupStage] || 12.5

  // Map milestones based on current stage
  const getCurrentMilestoneStatus = (milestoneStage) => {
    const currentProgress = stageToProgress[startupStage] || 12.5
    const milestoneProgress = stageToProgress[milestoneStage] || 0
    
    // Status is 'completed' if overall progress is past this milestone
    if (currentProgress > milestoneProgress) {
      return 'completed'
    } 
    // Status is 'in_progress' if overall progress matches this milestone
    else if (currentProgress === milestoneProgress) {
      return 'in_progress'
    } 
    // Status is 'pending' if it's the next immediate milestone
    else if (currentProgress === milestoneProgress - 12.5) {
      return 'pending'
    }
    // Otherwise, it's locked
    return 'locked'
  }

  const milestones = [
    {
      id: 1,
      title: "Ideation",
      stage: "Ideation",
      description: "Define your business idea and identify the problem you're solving",
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
        "Start by identifying a real problem faced by your target market.",
        "Talk to potential customers to validate your idea.",
        "Document your concept clearly before moving forward."
      ]
    },
    {
      id: 2,
      title: "Concept Research",
      stage: "Concept Research",
      description: "Conduct market research and validate your business concept",
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
        "Research your competitors and identify gaps in the market.",
        "Conduct at least 10-15 customer interviews.",
        "Validate that your solution addresses a real need."
      ]
    },
    {
      id: 3,
      title: "Prototype / MVP",
      stage: "Prototype / MVP",
      description: "Develop a minimum viable product to test with early customers",
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
        "Focus on building only the essential features first.",
        "Use no-code tools if possible to speed up development.",
        "Get feedback from real users as early as possible."
      ]
    },
    {
      id: 4,
      title: "Validation",
      stage: "Validation",
      description: "Test your product with real users and gather feedback",
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
        "Run a beta program with at least 20-30 early adopters.",
        "Track key metrics like user engagement and retention.",
        "Be ready to pivot based on feedback."
      ]
    },
    {
      id: 5,
      title: "Launch",
      stage: "Launch",
      description: "Launch your product and execute marketing strategies",
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
        "Create buzz before launch through social media and press.",
        "Offer early bird discounts to drive initial adoption.",
        "Have customer support ready from day one."
      ]
    },
    {
      id: 6,
      title: "Growth",
      stage: "Growth",
      description: "Focus on customer acquisition and revenue growth",
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
        "Focus on channels that show the best ROI.",
        "Implement referral programs to boost growth.",
        "Monitor your CAC and LTV metrics closely."
      ]
    },
    {
      id: 7,
      title: "Expansion / Funding",
      stage: "Expansion / Funding",
      description: "Secure funding and expand operations",
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
        "Apply for government grants and women entrepreneur schemes.",
        "Build relationships with angel investors and VCs.",
        "Have strong financial projections ready."
      ]
    },
    {
      id: 8,
      title: "Scaling / Maturity",
      stage: "Scaling / Maturity",
      description: "Scale operations and establish market leadership",
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
        "Focus on building a strong company culture.",
        "Invest in automation and processes.",
        "Consider strategic acquisitions or partnerships."
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
        return 'text-green-600 bg-green-100' // Keep clear contrast for completed/status
      case 'in_progress':
        return 'text-pink-600 bg-pink-100' // Use pink for in progress
      case 'pending':
        return 'text-yellow-600 bg-yellow-100' // Keep yellow for warning/pending
      case 'locked':
        return 'text-gray-400 bg-gray-100'
      default:
        return 'text-gray-400 bg-gray-100'
    }
  }

  // Memoize sidebar to prevent re-rendering
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  if (loading) {
    return (
      <DashboardLayout sidebar={sidebar}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your journey...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={sidebar}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Growth Journey</h1>
            <p className="text-gray-600 mb-8">Track your progress and get personalized recommendations for your entrepreneurial journey</p>

            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
                  <p className="text-sm text-gray-600 mt-1">Current Stage: {startupStage}</p>
                </div>
                <span className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  // Overall progress bar using the defined pink gradient
                  className={`${pinkGradient} h-4 rounded-full transition-all duration-500 shadow-md`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {overallProgress < 50 
                  ? "You're off to a great start! Keep building momentum." 
                  : overallProgress < 100 
                    ? "You're making excellent progress! Keep pushing forward."
                    : "Amazing! You've reached the scaling stage. Continue growing!"}
              </p>
            </motion.div>

            {/* Journey Timeline */}
            <div className="space-y-6">
              {milestones.map((milestone, index) => {
                const StatusIcon = getStatusIcon(milestone.status)
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`bg-white rounded-2xl p-6 shadow-sm ${
                      milestone.status === 'locked' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(milestone.status)}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                          <div className="flex items-center space-x-2">
                            <milestone.icon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{milestone.progress}%</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{milestone.description}</p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div 
                            // Milestone progress bar using the defined pink gradient
                            className={`${pinkGradient} h-3 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>

                        {/* Tasks */}
                        {milestone.status !== 'locked' && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks:</h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {milestone.tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-center space-x-2">
                                  {task.completed ? (
                                    <CheckCircleIconSolid className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                  )}
                                  <span className={`text-sm ${
                                    task.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                                  }`}>
                                    {task.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {milestone.recommendations.length > 0 && (
                          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-pink-700 mb-2 flex items-center">
                              <LightBulbIcon className="w-4 h-4 mr-1" />
                              AI Recommendations:
                            </h4>
                            <ul className="space-y-1">
                              {milestone.recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="text-sm text-gray-600">
                                  • {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {(milestone.status === 'in_progress' || milestone.status === 'pending') && (
                          <div className="mt-4">
                            <button className={`px-4 py-2 ${primaryButtonClass}`}>
                              {milestone.status === 'in_progress' ? 'Continue Working' : 'Start This Milestone'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
    </DashboardLayout>
  )
}

export default Journey