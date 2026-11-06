import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

  const sidebar = useMemo(() => <EntrepreneurSidebar />, [])

  const sectionClass = "p-6 rounded-2xl bg-transparent border border-[#8d4624]/20 transition-all hover:border-[#8d4624]/40 flex flex-col justify-between";
  const inputClass = "h-11 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] text-stone-900 placeholder:text-stone-400";

  return (
    <DashboardLayout sidebar={sidebar}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pb-20"
      >
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <Input
              type="text"
              placeholder="Search by scheme name, focus sector, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-transparent border border-[#8d4624]/20">
            {filters.map(filter => {
              const isActive = selectedFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8d4624] text-white shadow-xs'
                      : 'text-stone-600 hover:text-[#8d4624] hover:bg-[#8d4624]/10'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={sectionClass}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-1.5 text-stone-500">
                    <BuildingOfficeIcon className="w-4 h-4 text-[#8d4624]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{opportunity.type}</span>
                  </div>
                  <Badge variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-[10px] font-semibold">
                    {opportunity.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-stone-900 mb-2 leading-snug">{opportunity.title}</h3>
                
                <div className="flex items-center space-x-4 text-xs font-medium text-stone-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <CurrencyRupeeIcon className="w-3.5 h-3.5 text-[#8d4624]" />
                    <span>{opportunity.amount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{opportunity.deadline}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 mb-3 line-clamp-3 leading-relaxed">{opportunity.description}</p>

                <div className="mb-3 pt-2 border-t border-[#8d4624]/10">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-0.5">Eligibility</span>
                  <p className="text-xs text-stone-700 leading-normal">{opportunity.eligibility}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {opportunity.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-0.5 bg-[#f5e9dd] text-[#8d4624] rounded-md text-[10px] font-medium"
                    >
                      <TagIcon className="w-2.5 h-2.5 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#8d4624]/10">
                {opportunity.link ? (
                  <Button asChild className="w-full bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl text-xs font-semibold h-10 gap-1.5 shadow-xs">
                    <a
                      href={opportunity.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>Visit Portal</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[#8d4624]/30 text-[#8d4624] hover:bg-[#8d4624]/10 text-xs font-semibold h-10"
                  >
                    Details Pending
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-16 p-8 rounded-3xl border border-[#8d4624]/20">
            <MagnifyingGlassIcon className="w-10 h-10 text-[#8d4624] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No opportunities match your filter</h3>
            <p className="text-xs text-stone-500 mt-1">Try searching with broader terms or clear your active category filters.</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Opportunities