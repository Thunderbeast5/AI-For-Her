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

// Shared pink button styles
const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')

  const filters = ['All', 'Government', 'Private', 'Incubator', 'Grant', 'Competition']

  const opportunities = [
    {
      id: 1,
      title: "Stand-Up India Scheme",
      type: "Government",
      category: "Loan",
      amount: "₹10 Lakh - ₹1 Cr",
      deadline: "Ongoing",
      description: "Government initiative providing loans ₹10 lakh to ₹1 crore. Specifically for women and SC/ST entrepreneurs.",
      eligibility: "Women and SC/ST entrepreneurs, Greenfield projects, First-time business owners",
      tags: ["Government Loan", "Women-led", "Greenfield"],
      status: "Ongoing",
      link: "https://standupmitra.in"
    },
    {
      id: 2,
      title: "Mahila Udyam Nidhi Scheme (SIDBI)",
      type: "Government",
      category: "Grant",
      amount: "Up to ₹10 Lakh",
      deadline: "Ongoing",
      description: "Financial assistance up to ₹10 lakh for small-scale enterprises. Low interest rates + flexible repayment.",
      eligibility: "Women entrepreneurs, Small-scale enterprises, Manufacturing/Services",
      tags: ["SIDBI", "Low Interest", "Women-led"],
      status: "Ongoing",
      link: "https://sidbi.in"
    },
    {
      id: 3,
      title: "Mudra Loan – Women Entrepreneurship",
      type: "Government",
      category: "Loan",
      amount: "Up to ₹10 Lakh",
      deadline: "Ongoing",
      description: "Loans under Shishu (up to ₹50,000), Kishore (₹50,000–₹5 lakh), Tarun (₹5–10 lakh). Special interest concessions for women.",
      eligibility: "Women entrepreneurs, Non-corporate small businesses, All sectors",
      tags: ["Mudra", "Interest Concession", "Women-led"],
      status: "Ongoing",
      link: "https://www.mudra.org.in"
    },
    {
      id: 4,
      title: "NITI Aayog Women Entrepreneurship Platform",
      type: "Government",
      category: "Accelerator",
      amount: "Mentorship + Funding",
      deadline: "Ongoing",
      description: "Connects women founders with investors, mentors, corporate partners. Comprehensive ecosystem support.",
      eligibility: "Women entrepreneurs, All stages, Technology and innovation focus",
      tags: ["WEP", "Mentorship", "Networking"],
      status: "Ongoing",
      link: "https://wep.gov.in"
    },
    {
      id: 5,
      title: "Annapurna Scheme",
      type: "Government",
      category: "Loan",
      amount: "₹50,000 - ₹1 Lakh",
      deadline: "Ongoing",
      description: "Loans up to ₹50,000–₹1 lakh for women opening food-related businesses.",
      eligibility: "Women entrepreneurs, Food sector, Catering/Restaurant/Food processing",
      tags: ["Food Sector", "Small Loan", "Women-led"],
      status: "Ongoing",
      link: ""
    },
    {
      id: 6,
      title: "Bharatiya Mahila Bank Business Loan",
      type: "Government",
      category: "Loan",
      amount: "Up to ₹20 Crore",
      deadline: "Ongoing",
      description: "Loans up to ₹20 crore for manufacturing, service, or small business ventures.",
      eligibility: "Women entrepreneurs, Manufacturing/Service sectors, Established businesses",
      tags: ["Large Loan", "Manufacturing", "Services"],
      status: "Ongoing",
      link: ""
    },
    {
      id: 7,
      title: "Udyam Sakhi Portal",
      type: "Government",
      category: "Grant",
      amount: "Funding + Training",
      deadline: "Ongoing",
      description: "Government platform providing funding, training & market linkages for women entrepreneurs.",
      eligibility: "Women entrepreneurs, All sectors, MSMEs",
      tags: ["Training", "Market Linkage", "Women-led"],
      status: "Ongoing",
      link: "https://udyamsakhi.gov.in"
    },
    {
      id: 8,
      title: "WE Hub - Telangana Government",
      type: "Incubator",
      category: "Accelerator",
      amount: "Grants + Mentorship",
      deadline: "Ongoing",
      description: "Women-led incubator providing grants, mentorship, pre-seed funding and ecosystem support.",
      eligibility: "Women-led startups, Telangana based (preferred), Early stage",
      tags: ["Incubator", "Telangana", "Pre-seed"],
      status: "Ongoing",
      link: "https://wehub.telangana.gov.in"
    },
    {
      id: 9,
      title: "NSRCEL – IIM Bangalore Women Startup",
      type: "Incubator",
      category: "Accelerator",
      amount: "Mentorship + Funding",
      deadline: "Varies",
      description: "Women Startup Program providing mentorship, funding opportunities and networking.",
      eligibility: "Women entrepreneurs, Early to growth stage, All sectors",
      tags: ["IIM Bangalore", "Mentorship", "Women-led"],
      status: "Open",
      link: "https://nsrcel.org"
    },
    {
      id: 10,
      title: "Sheroes Women Entrepreneurs Platform",
      type: "Private",
      category: "Accelerator",
      amount: "Community + Resources",
      deadline: "Ongoing",
      description: "Platform connecting women entrepreneurs with resources, mentorship, and funding opportunities.",
      eligibility: "Women entrepreneurs, All stages, Community-driven support",
      tags: ["Community", "Networking", "Women-led"],
      status: "Ongoing",
      link: "https://sheroes.com"
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

                  {opportunity.link ? (
                    <a
                      href={opportunity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full py-3 text-center ${primaryButtonClass}`}
                    >
                      Visit Website
                    </a>
                  ) : (
                    <button className={`w-full py-3 ${primaryButtonClass}`}>
                      Learn More
                    </button>
                  )}
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
