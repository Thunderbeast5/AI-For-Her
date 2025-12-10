import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout';
import InvestorSidebar from '../../components/InvestorSidebar';
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
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Mirror the logic from InvestorDashboard: read from investment-projects and
        // derive this investor's investments from the investors array on each project.
        const projectsQuery = query(collection(db, 'investment-projects'));
        const projectsSnapshot = await getDocs(projectsQuery);
        const allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let totalInv = 0;
        let pendingCount = 0;

        const investmentsData = allProjects.flatMap(project => {
          const projectInvestors = Array.isArray(project.investors)
            ? project.investors
            : [];

          const myInvestmentsInProject = projectInvestors.filter(
            inv => inv.investorId === currentUser.uid
          );

          if (myInvestmentsInProject.length === 0) return [];

          return myInvestmentsInProject.map((inv, index) => {
            const amount = Number(inv.amount) || 0;
            totalInv += amount;
            pendingCount += 1;

            const jsDate = inv.date?.toDate?.();
            const displayDate = jsDate
              ? jsDate.toLocaleDateString('en-IN')
              : 'Recently';

            return {
              id: `${project.id}-${inv.date?.toMillis?.() || index}`,
              projectName: project.projectName || project.startupId?.name || 'Untitled Project',
              amount: `₹${amount.toLocaleString('en-IN')}`,
              date: displayDate,
              status: 'Pending',
              returns: '-',
              roi: '-',
            };
          });
        });

        setInvestments(investmentsData);
        setStats({
          totalInvested: totalInv,
          completed: 0,
          pending: pendingCount,
        });
      } catch (error) {
        console.error('Error fetching investments:', error);
      } finally {
        setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment History</h1>
        <p className="text-gray-600">Track all your investment transactions</p>
      </div>

      {/* Investment Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Investment List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Investments</h2>
        {investments.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No investments yet</p>
            <p className="text-sm text-gray-500 mt-2">Browse startups and make your first investment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Investments;
