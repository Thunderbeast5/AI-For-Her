import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Determine which sidebar to use based on role
  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />;
    if (userRole === 'investor') return <InvestorSidebar />;
    return <EntrepreneurSidebar />;
  };

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
        {/* Skeleton stat cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton chart cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton recent activity */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout sidebar={getSidebar()}>
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-8 h-8 text-pink-400" />
              <Badge variant="secondary" className="text-green-600 bg-green-50">+12%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.totalActivities}</p>
            <p className="text-sm text-gray-600">Total Activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-500" />
              <Badge variant="secondary" className="text-green-600 bg-green-50">+8%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.growthRate}%</p>
            <p className="text-sm text-gray-600">Growth Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <UsersIcon className="w-8 h-8 text-blue-500" />
              <Badge variant="secondary" className="text-green-600 bg-green-50">+5</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.connections}</p>
            <p className="text-sm text-gray-600">Connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-8 h-8 text-purple-500" />
              <Badge variant="outline" className="text-gray-500">This Month</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.timeInvested}h</p>
            <p className="text-sm text-gray-600">Time Invested</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
