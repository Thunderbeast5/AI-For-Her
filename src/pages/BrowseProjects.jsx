import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const BrowseProjects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Fashion', 'HealthTech', 'EdTech', 'AgriTech', 'FoodTech', 'FinTech'];

  const projects = [
    {
      id: 1,
      name: 'EcoFashion Marketplace',
      founder: 'Priya Sharma',
      category: 'Fashion',
      description: 'Sustainable fashion marketplace connecting eco-conscious designers with consumers',
      fundingGoal: '₹25,00,000',
      raised: '₹8,00,000',
      stage: 'Seed',
      location: 'Mumbai',
      rating: 4.5
    },
    {
      id: 2,
      name: 'HealthTech AI',
      founder: 'Anjali Verma',
      category: 'HealthTech',
      description: 'AI-powered health diagnostics platform for rural areas',
      fundingGoal: '₹50,00,000',
      raised: '₹15,00,000',
      stage: 'Series A',
      location: 'Bangalore',
      rating: 4.8
    },
    {
      id: 3,
      name: 'EdLearn Platform',
      founder: 'Meera Patel',
      category: 'EdTech',
      description: 'Interactive learning platform for K-12 students in regional languages',
      fundingGoal: '₹35,00,000',
      raised: '₹12,00,000',
      stage: 'Seed',
      location: 'Delhi',
      rating: 4.6
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
        <p className="text-gray-600">Discover innovative women-led startups</p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-8"
      >
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for projects, founders, or ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-pink-400 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {filteredProjects.length} Projects Found
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                  <p className="text-sm text-gray-600">Founded by {project.founder}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{project.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Funding Goal</span>
                  <span className="font-semibold text-gray-900">{project.fundingGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(parseInt(project.raised.replace(/[^0-9]/g, '')) / parseInt(project.fundingGoal.replace(/[^0-9]/g, ''))) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-semibold text-pink-500">{project.raised}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {project.stage}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {project.category}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {project.location}
                  </span>
                </div>
                <button className="px-4 py-2 bg-pink-400 text-white text-sm font-medium rounded-lg hover:bg-pink-500 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default BrowseProjects;
