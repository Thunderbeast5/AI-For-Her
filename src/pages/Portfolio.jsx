import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BriefcaseIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Portfolio = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolioCompanies, setPortfolioCompanies] = useState([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [totalGrowth, setTotalGrowth] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (currentUser) {
        try {
          // Fetch investments for this investor
          const investmentsQuery = query(
            collection(db, 'investments'),
            where('investorId', '==', currentUser.uid),
            where('status', '==', 'completed')
          );
          const investmentsSnapshot = await getDocs(investmentsQuery);
          
          let totalInv = 0;
          let totalCurr = 0;
          
          const portfolioData = await Promise.all(
            investmentsSnapshot.docs.map(async (investmentDoc) => {
              const investment = investmentDoc.data();
              
              // Fetch startup details
              let startupName = 'Unknown Startup';
              if (investment.startupId) {
                const startupDoc = await getDoc(doc(db, 'startups', investment.startupId));
                if (startupDoc.exists()) {
                  startupName = startupDoc.data().name;
                }
              }
              
              const invested = investment.amount || 0;
              const current = investment.currentValue || invested;
              const growth = invested > 0 ? (((current - invested) / invested) * 100).toFixed(1) : 0;
              
              totalInv += invested;
              totalCurr += current;
              
              return {
                id: investmentDoc.id,
                name: startupName,
                invested: `₹${invested.toLocaleString('en-IN')}`,
                currentValue: `₹${current.toLocaleString('en-IN')}`,
                growth: `${growth > 0 ? '+' : ''}${growth}%`,
                investedDate: investment.investedDate || 'Recently',
                status: 'Active'
              };
            })
          );
          
          setPortfolioCompanies(portfolioData);
          setTotalInvested(totalInv);
          setCurrentValue(totalCurr);
          
          const overallGrowth = totalInv > 0 ? (((totalCurr - totalInv) / totalInv) * 100).toFixed(1) : 0;
          setTotalGrowth(overallGrowth);
        } catch (error) {
          console.error('Error fetching portfolio:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPortfolio();
  }, [currentUser]);

  if (loading) {
    return (
      <DashboardLayout sidebar={<InvestorSidebar />}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <p className="text-3xl font-bold text-gray-900">₹{totalInvested.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Current Value</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{currentValue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Total Growth</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{totalGrowth > 0 ? '+' : ''}{totalGrowth}%</p>
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
        {portfolioCompanies.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No portfolio companies yet</p>
            <p className="text-sm text-gray-500 mt-2">Start investing in startups to build your portfolio</p>
          </div>
        ) : (
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
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Portfolio;
