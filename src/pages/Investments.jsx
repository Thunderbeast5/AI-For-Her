import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Investments = () => {
  const investments = [
    {
      id: 1,
      projectName: 'EcoFashion Marketplace',
      amount: '₹10,00,000',
      date: 'Jan 15, 2024',
      status: 'Completed',
      returns: '₹15,00,000',
      roi: '+50%'
    },
    {
      id: 2,
      projectName: 'HealthTech AI',
      amount: '₹20,00,000',
      date: 'Mar 20, 2024',
      status: 'Completed',
      returns: '₹28,00,000',
      roi: '+40%'
    },
    {
      id: 3,
      projectName: 'EdLearn Platform',
      amount: '₹15,00,000',
      date: 'May 10, 2024',
      status: 'Pending',
      returns: '-',
      roi: '-'
    }
  ];

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment History</h1>
        <p className="text-gray-600">Track all your investment transactions</p>
      </motion.div>

      {/* Investment Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <BanknotesIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹45,00,000</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ClockIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
      </motion.div>

      {/* Investment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Investments</h2>
        <div className="space-y-4">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{investment.projectName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {investment.date}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    investment.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {investment.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 mb-1">{investment.amount}</p>
                {investment.status === 'Completed' && (
                  <>
                    <p className="text-sm text-gray-600">Returns: {investment.returns}</p>
                    <p className="text-sm font-semibold text-green-600">{investment.roi}</p>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Investments;
