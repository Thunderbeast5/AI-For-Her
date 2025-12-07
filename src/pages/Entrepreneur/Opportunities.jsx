import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  TagIcon
} from '@heroicons/react/24/outline'

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')

  const filters = ['All', 'Government', 'Private', 'Incubator', 'Grant', 'Competition']

  const opportunities = [
    {
      id: 1,
      title: "SIDBI Women Entrepreneur Grant",
      type: "Government",
      category: "Grant",
      amount: "₹10 Lakh",
      deadline: "Nov 30, 2024",
      description: "Financial assistance for women entrepreneurs in manufacturing and service sectors.",
      eligibility: "Women-led startups, Manufacturing/Services, Annual turnover < ₹5 Cr",
      tags: ["Manufacturing", "Services", "Women-led"],
      status: "Open"
    },
    {
      id: 2,
      title: "Nasscom Women Startup Challenge",
      type: "Private",
      category: "Competition",
      amount: "₹25 Lakh",
      deadline: "Dec 15, 2024",
      description: "Supporting women entrepreneurs in technology and innovation.",
      eligibility: "Tech startups, Women founder/co-founder, Early to growth stage",
      tags: ["Technology", "Innovation", "Women-led"],
      status: "Open"
    },
    {
      id: 3,
      title: "T-Hub Women Entrepreneur Program",
      type: "Incubator",
      category: "Accelerator",
      amount: "₹15 Lakh + Mentorship",
      deadline: "Jan 10, 2025",
      description: "6-month accelerator program with funding and mentorship for women entrepreneurs.",
      eligibility: "Early-stage startups, Women leadership, Tech/Innovation focus",
      tags: ["Accelerator", "Mentorship", "Technology"],
      status: "Open"
    },
    {
      id: 4,
      title: "Stand Up India Loan Scheme",
      type: "Government",
      category: "Loan",
      amount: "₹10 Lakh - ₹1 Cr",
      deadline: "Ongoing",
      description: "Bank loans for women entrepreneurs to start greenfield enterprises.",
      eligibility: "Women entrepreneurs, 18+ years, Greenfield projects",
      tags: ["Loan", "Greenfield", "Banking"],
      status: "Ongoing"
    },
    {
      id: 5,
      title: "Facebook Women in Tech Grant",
      type: "Private",
      category: "Grant",
      amount: "$50,000",
      deadline: "Feb 28, 2025",
      description: "Supporting women-led tech startups with funding and resources.",
      eligibility: "Tech startups, Women founder, Product in development",
      tags: ["Technology", "International", "Product"],
      status: "Open"
    },
    {
      id: 6,
      title: "BIRAC Women Scientist Scheme",
      type: "Government",
      category: "Grant",
      amount: "₹15 Lakh",
      deadline: "Mar 15, 2025",
      description: "Supporting women scientists and researchers in biotechnology ventures.",
      eligibility: "Women scientists, Biotech/Life sciences, Research background",
      tags: ["Biotechnology", "Research", "Life Sciences"],
      status: "Open"
    }
  ]

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = selectedFilter === 'All' || 
                         opp.type === selectedFilter || 
                         opp.category === selectedFilter

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800'
      case 'Ongoing': return 'bg-blue-100 text-blue-800'
      case 'Closing Soon': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Memoize sidebar to prevent re-rendering
  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  return (
    <DashboardLayout sidebar={sidebar}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth & Funding Opportunities</h1>
            <p className="text-gray-600 mb-8">Discover grants, competitions, and funding opportunities tailored for women entrepreneurs</p>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {filters.map(filter => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFilter === filter
                          ? 'bg-primary text-gray-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opportunities Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">{opportunity.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{opportunity.title}</h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <CurrencyRupeeIcon className="w-4 h-4" />
                      <span>{opportunity.amount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{opportunity.deadline}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{opportunity.description}</p>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Eligibility:</p>
                    <p className="text-xs text-gray-600">{opportunity.eligibility}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {opportunity.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 bg-primary/20 text-gray-700 rounded-full text-xs"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-primary to-accent text-gray-800 py-3 rounded-xl font-medium hover:shadow-md transition-all duration-200">
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No opportunities found matching your criteria.</p>
              </div>
            )}
          </motion.div>
    </DashboardLayout>
  )
}

export default Opportunities
