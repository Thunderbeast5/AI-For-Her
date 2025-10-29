import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import EntrepreneurSidebar from '../components/EntrepreneurSidebar'
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { UserIcon } from '@heroicons/react/24/outline'

const Mentors = () => {
  const [formData, setFormData] = useState({
    sector: '',
    stage: '',
    goals: ''
  })
  const [showResults, setShowResults] = useState(false)

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Food & Beverage', 
    'Fashion', 'Finance', 'Manufacturing', 'Services', 'Other'
  ]

  const stages = [
    'Idea Stage', 'MVP Development', 'Early Stage', 'Growth Stage', 'Scaling'
  ]

  const mockMentors = [
    {
      name: "Sarah Kumar",
      experience: "15+ years in Tech",
      sector: "Technology",
      location: "Bangalore",
      matchScore: 95,
      image: "👩‍💼",
      expertise: ["Product Development", "Team Building", "Fundraising"],
      bio: "Former VP at Microsoft, now helping women entrepreneurs scale their tech startups."
    },
    {
      name: "Meera Patel",
      experience: "12+ years in E-commerce",
      sector: "E-commerce",
      location: "Mumbai",
      matchScore: 88,
      image: "👩‍🚀",
      expertise: ["Digital Marketing", "Operations", "Customer Acquisition"],
      bio: "Built and sold two successful e-commerce companies, passionate about mentoring."
    },
    {
      name: "Dr. Anjali Sharma",
      experience: "20+ years in Healthcare",
      sector: "Healthcare",
      location: "Delhi",
      matchScore: 82,
      image: "👩‍⚕️",
      expertise: ["Healthcare Innovation", "Regulatory Affairs", "Medical Devices"],
      bio: "Healthcare entrepreneur and investor, focused on women's health solutions."
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowResults(true)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout sidebar={<EntrepreneurSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Mentor</h1>
        <p className="text-gray-600 mb-8">Connect with experienced entrepreneurs who can guide your journey</p>

            {!showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What sector is your business in?
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                      required
                    >
                      <option value="">Select a sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What stage is your startup in?
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleInputChange('stage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                      required
                    >
                      <option value="">Select a stage</option>
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your main goals?
                    </label>
                    <textarea
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      placeholder="e.g., Scale my team, raise funding, improve product-market fit..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 h-24 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-pink-400 text-white py-4 rounded-xl font-semibold hover:bg-pink-500 transition-all duration-200"
                  >
                    Find My Match
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Your Mentor Matches</h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-4 py-2 text-pink-500 border border-pink-400 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    New Search
                  </button>
                </div>

                {mockMentors.map((mentor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                            <p className="text-gray-600">{mentor.experience}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 mb-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium">{mentor.matchScore}% match</span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                style={{ width: `${mentor.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {mentor.location}
                          </span>
                          <span>{mentor.sector}</span>
                        </div>

                        <p className="text-gray-600 mb-4">{mentor.bio}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {mentor.expertise.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <button className="bg-pink-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-500 transition-all duration-200">
                          Connect
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Mentors
