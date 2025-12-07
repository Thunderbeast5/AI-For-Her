import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const Schedule = () => {
  const upcomingSessions = [
    {
      id: 1,
      menteeName: 'Priya Sharma',
      type: 'One-on-One',
      date: 'Tomorrow',
      time: '3:00 PM - 4:00 PM',
      topic: 'Business Strategy Discussion'
    },
    {
      id: 2,
      menteeName: 'Group Session',
      type: 'Group Mentoring',
      date: 'Tomorrow',
      time: '5:00 PM - 7:00 PM',
      topic: 'Funding & Pitch Preparation'
    },
    {
      id: 3,
      menteeName: 'Anjali Verma',
      type: 'One-on-One',
      date: 'Friday',
      time: '2:00 PM - 3:00 PM',
      topic: 'Marketing Strategy Review'
    },
    {
      id: 4,
      menteeName: 'Meera Patel',
      type: 'One-on-One',
      date: 'Next Monday',
      time: '11:00 AM - 12:00 PM',
      topic: 'Product Development Guidance'
    }
  ];

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
        <p className="text-gray-600">Manage your mentoring sessions</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">4</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">One-on-One</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <VideoCameraIcon className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-gray-600">Group</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
      </motion.div>

      {/* Upcoming Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
          <button className="px-4 py-2 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
            Schedule New
          </button>
        </div>

        <div className="space-y-4">
          {upcomingSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                  {session.type === 'Group Mentoring' ? (
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {session.menteeName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{session.menteeName}</h3>
                  <p className="text-sm text-gray-600">{session.topic}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {session.date}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {session.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      session.type === 'Group Mentoring'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-pink-400 text-white text-sm font-medium rounded-lg hover:bg-pink-500 transition-colors">
                  Join
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Reschedule
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Schedule;
