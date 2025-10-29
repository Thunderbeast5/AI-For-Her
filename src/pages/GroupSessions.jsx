import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import MentorSidebar from '../components/MentorSidebar';
import { 
  VideoCameraIcon,
  CalendarIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const GroupSessions = () => {
  const sessions = [
    {
      id: 1,
      title: 'Business Strategy Workshop',
      description: 'Learn essential business strategies for scaling your startup',
      date: 'Tomorrow, 3:00 PM',
      participants: 12,
      status: 'upcoming',
      duration: '2 hours'
    },
    {
      id: 2,
      title: 'Funding & Pitch Preparation',
      description: 'Master the art of pitching to investors',
      date: 'Today, 5:00 PM',
      participants: 8,
      status: 'live',
      duration: '1.5 hours'
    },
    {
      id: 3,
      title: 'Marketing Fundamentals',
      description: 'Digital marketing strategies for startups',
      date: 'Next Week, Mon 2:00 PM',
      participants: 15,
      status: 'scheduled',
      duration: '2 hours'
    }
  ];

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Mentoring</h1>
            <p className="text-gray-600">Host and manage group sessions</p>
          </div>
          <button className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors flex items-center space-x-2">
            <PlusIcon className="w-5 h-5" />
            <span>Schedule New Session</span>
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <VideoCameraIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Total Participants</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {sessions.reduce((sum, s) => sum + s.participants, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {sessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled').length}
          </p>
        </div>
      </motion.div>

      {/* Sessions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'live' 
                      ? 'bg-green-100 text-green-700' 
                      : session.status === 'upcoming'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {session.status === 'live' ? 'Live Now' : session.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{session.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {session.date}
                  </span>
                  <span className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    {session.participants} participants
                  </span>
                  <span className="flex items-center">
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    {session.duration}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {session.status === 'live' ? (
                  <button className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
                    Join Now
                  </button>
                ) : (
                  <>
                    <button className="px-6 py-2 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
                      View Details
                    </button>
                    <button className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  );
};

export default GroupSessions;
