import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
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

const Journey = () => {
  const milestones = [
    {
      id: 1,
      title: "Validate Product Idea",
      description: "Conduct market research and validate your business concept",
      status: "completed",
      icon: LightBulbIcon,
      progress: 100,
      tasks: [
        { name: "Market research", completed: true },
        { name: "Customer interviews", completed: true },
        { name: "Competitor analysis", completed: true },
        { name: "Problem-solution fit", completed: true }
      ],
      recommendations: [
        "Great job validating your idea! Your market research shows strong demand.",
        "Consider expanding your target market based on interview insights."
      ]
    },
    {
      id: 2,
      title: "Build MVP",
      description: "Develop a minimum viable product to test with early customers",
      status: "in_progress",
      icon: CogIcon,
      progress: 75,
      tasks: [
        { name: "Define core features", completed: true },
        { name: "Create wireframes", completed: true },
        { name: "Develop prototype", completed: true },
        { name: "User testing", completed: false },
        { name: "Iterate based on feedback", completed: false }
      ],
      recommendations: [
        "Focus on completing user testing to gather valuable feedback.",
        "Consider using no-code tools to speed up development.",
        "Plan for at least 2-3 iterations based on user feedback."
      ]
    },
    {
      id: 3,
      title: "Apply for Grants",
      description: "Secure initial funding through grants and competitions",
      status: "pending",
      icon: CurrencyRupeeIcon,
      progress: 0,
      tasks: [
        { name: "Research grant opportunities", completed: false },
        { name: "Prepare business plan", completed: false },
        { name: "Submit applications", completed: false },
        { name: "Follow up on applications", completed: false }
      ],
      recommendations: [
        "Start with SIDBI Women Entrepreneur Grant - good fit for your profile.",
        "Prepare a compelling pitch deck highlighting your unique value proposition.",
        "Consider applying to multiple grants to increase chances of success."
      ]
    },
    {
      id: 4,
      title: "Scale Operations",
      description: "Expand your team and operations to handle growth",
      status: "locked",
      icon: ChartBarIcon,
      progress: 0,
      tasks: [
        { name: "Hire key team members", completed: false },
        { name: "Set up operations processes", completed: false },
        { name: "Implement growth strategies", completed: false },
        { name: "Monitor key metrics", completed: false }
      ],
      recommendations: []
    },
    {
      id: 5,
      title: "Launch & Market",
      description: "Launch your product and execute marketing strategies",
      status: "locked",
      icon: RocketLaunchIcon,
      progress: 0,
      tasks: [
        { name: "Plan launch strategy", completed: false },
        { name: "Execute marketing campaigns", completed: false },
        { name: "Build customer base", completed: false },
        { name: "Gather customer feedback", completed: false }
      ],
      recommendations: []
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
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'locked':
        return 'text-gray-400 bg-gray-100'
      default:
        return 'text-gray-400 bg-gray-100'
    }
  }

  const overallProgress = Math.round(
    milestones.reduce((acc, milestone) => acc + milestone.progress, 0) / milestones.length
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6 overflow-auto">
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
                <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
                <span className="text-2xl font-bold text-gray-900">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You're making great progress! Keep up the momentum.
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
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
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
                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
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

                        {/* Action Button */}
                        {milestone.status === 'in_progress' && (
                          <div className="mt-4">
                            <button className="bg-gradient-to-r from-primary to-accent text-gray-800 px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-200">
                              Continue Working
                            </button>
                          </div>
                        )}

                        {milestone.status === 'pending' && (
                          <div className="mt-4">
                            <button className="bg-gradient-to-r from-primary to-accent text-gray-800 px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all duration-200">
                              Start This Milestone
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
        </main>
      </div>
    </div>
  )
}

export default Journey
