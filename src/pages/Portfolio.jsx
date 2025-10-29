import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BriefcaseIcon,
  ChartBarIcon,
  TrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Portfolio = () => {
  const portfolioCompanies = [
    {
      id: 1,
      name: 'EcoFashion Marketplace',
      invested: '₹10,00,000',
      currentValue: '₹15,00,000',
      growth: '+50%',
      investedDate: 'Jan 2024',
      status: 'Active'
    },
    {
      id: 2,
      name: 'HealthTech AI',
      invested: '₹20,00,000',
      currentValue: '₹28,00,000',
      growth: '+40%',
      investedDate: 'Mar 2024',
      status: 'Active'
    },
    {
      id: 3,
      name: 'EdLearn Platform',
      invested: '₹15,00,000',
      currentValue: '₹18,00,000',
      growth: '+20%',
      investedDate: 'May 2024',
      status: 'Active'
    }
  ];

  const totalInvested = '₹45,00,000';
  const currentValue = '₹61,00,000';
  const totalGrowth = '+35.6%';

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
        <p className="text-gray-600">Track your investments and returns</p>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <BriefcaseIcon className="w-8 h-8 text-pink-400" />
            <span className="text-sm text-gray-500">Total Invested</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalInvested}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Current Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentValue}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <TrendingUpIcon className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total Growth</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{totalGrowth}</p>
        </div>
      </motion.div>

      {/* Portfolio Companies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Companies</h2>
        <div className="space-y-4">
          {portfolioCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {company.investedDate}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {company.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Invested: {company.invested}</p>
                <p className="text-sm font-semibold text-gray-900 mb-1">Current: {company.currentValue}</p>
                <p className="text-sm font-bold text-green-600">{company.growth}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Portfolio;
