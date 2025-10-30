import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Investments = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    const fetchInvestments = async () => {
      if (currentUser) {
        try {
          // Fetch all investments for this investor
          const investmentsQuery = query(
            collection(db, 'investments'),
            where('investorId', '==', currentUser.uid)
          );
          const investmentsSnapshot = await getDocs(investmentsQuery);
          
          let totalInv = 0;
          let completedCount = 0;
          let pendingCount = 0;
          
          const investmentsData = await Promise.all(
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
              
              const amount = investment.amount || 0;
              const status = investment.status || 'pending';
              const returns = investment.currentValue || 0;
              const roi = amount > 0 && returns > 0 ? (((returns - amount) / amount) * 100).toFixed(1) : 0;
              
              totalInv += amount;
              if (status === 'completed') completedCount++;
              else pendingCount++;
              
              return {
                id: investmentDoc.id,
                projectName: startupName,
                amount: `₹${amount.toLocaleString('en-IN')}`,
                date: investment.investedDate || 'Recently',
                status: status === 'completed' ? 'Completed' : 'Pending',
                returns: status === 'completed' ? `₹${returns.toLocaleString('en-IN')}` : '-',
                roi: status === 'completed' ? `${roi > 0 ? '+' : ''}${roi}%` : '-'
              };
            })
          );
          
          setInvestments(investmentsData);
          setStats({
            totalInvested: totalInv,
            completed: completedCount,
            pending: pendingCount
          });
        } catch (error) {
          console.error('Error fetching investments:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInvestments();
  }, [currentUser]);

  if (loading) {
    return (
      <DashboardLayout sidebar={<InvestorSidebar />}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investments...</p>
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
          <p className="text-2xl font-bold text-gray-900">₹{stats.totalInvested.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ClockIcon className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
        {investments.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No investments yet</p>
            <p className="text-sm text-gray-500 mt-2">Browse startups and make your first investment</p>
          </div>
        ) : (
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
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Investments;
