import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersApi, startupsApi } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const { userRole, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    growthRate: 0,
    connections: 0,
    timeInvested: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (currentUser) {
        try {
          let activities = 0;
          let connections = 0;
          let activityList = [];

          if (userRole === 'entrepreneur') {
            // Fetch entrepreneur stats
            const connectionsQuery = query(
              collection(db, 'connections'),
              where('menteeId', '==', currentUser.uid)
            );
            const connectionsSnapshot = await getDocs(connectionsQuery);
            connections = connectionsSnapshot.size;

            const chatsQuery = query(
              collection(db, 'chats'),
              where('userId', '==', currentUser.uid)
            );
            const chatsSnapshot = await getDocs(chatsQuery);
            activities = connectionsSnapshot.size + chatsSnapshot.size;

            activityList = [
              { action: `Connected with ${connections} mentors`, time: 'This month' },
              { action: `${chatsSnapshot.size} AI conversations`, time: 'This month' }
            ];
          } else if (userRole === 'mentor') {
            // Fetch mentor stats
            const menteesQuery = query(
              collection(db, 'connections'),
              where('mentorId', '==', currentUser.uid)
            );
            const menteesSnapshot = await getDocs(menteesQuery);
            connections = menteesSnapshot.size;

            const sessionsQuery = query(
              collection(db, 'sessions'),
              where('mentorId', '==', currentUser.uid)
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            activities = menteesSnapshot.size + sessionsSnapshot.size;

            activityList = [
              { action: `Mentoring ${connections} entrepreneurs`, time: 'Active' },
              { action: `${sessionsSnapshot.size} sessions completed`, time: 'This month' }
            ];
          } else if (userRole === 'investor') {
            // Fetch investor stats
            const investmentsQuery = query(
              collection(db, 'investments'),
              where('investorId', '==', currentUser.uid)
            );
            const investmentsSnapshot = await getDocs(investmentsQuery);
            connections = investmentsSnapshot.size;
            activities = investmentsSnapshot.size;

            const startupsQuery = query(collection(db, 'startups'));
            const startupsSnapshot = await getDocs(startupsQuery);

            activityList = [
              { action: `${connections} active investments`, time: 'Portfolio' },
              { action: `Reviewed ${startupsSnapshot.size} startups`, time: 'This month' }
            ];
          }

          setStats({
            totalActivities: activities,
            growthRate: activities > 0 ? Math.min(89, activities * 10) : 0,
            connections: connections,
            timeInvested: activities * 2
          });

          setRecentActivity(activityList);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [currentUser, userRole]);

  if (loading) {
    return (
      <DashboardLayout sidebar={getSidebar()}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Determine which sidebar to use based on role
  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />;
    if (userRole === 'investor') return <InvestorSidebar />;
    return <EntrepreneurSidebar />;
  };

  return (
    <DashboardLayout sidebar={getSidebar()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your performance and growth</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-pink-400" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalActivities}</p>
          <p className="text-sm text-gray-600">Total Activities</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.growthRate}%</p>
          <p className="text-sm text-gray-600">Growth Rate</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <UsersIcon className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-green-600 font-medium">+5</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.connections}</p>
          <p className="text-sm text-gray-600">Connections</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ClockIcon className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stats.timeInvested}h</p>
          <p className="text-sm text-gray-600">Time Invested</p>
        </div>
      </motion.div>

      {/* Charts Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">{activity.action}</p>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          )))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
