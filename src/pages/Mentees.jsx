import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import MentorSidebar from '../components/MentorSidebar';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Mentees = () => {
  const mentees = [
    {
      id: 1,
      name: 'Priya Sharma',
      business: 'Fashion Startup',
      lastContact: '2 days ago',
      status: 'active',
      sessionsCompleted: 5,
      nextSession: 'Tomorrow, 3:00 PM'
    },
    {
      id: 2,
      name: 'Anjali Verma',
      business: 'Food Tech',
      lastContact: '5 days ago',
      status: 'active',
      sessionsCompleted: 3,
      nextSession: 'Next Week'
    },
    {
      id: 3,
      name: 'Meera Patel',
      business: 'EdTech Platform',
      lastContact: '1 week ago',
      status: 'pending',
      sessionsCompleted: 1,
      nextSession: 'Not Scheduled'
    }
  ];

  return (
    <DashboardLayout sidebar={<MentorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentees</h1>
        <p className="text-gray-600">Manage and track your mentee relationships</p>
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
            <UserGroupIcon className="w-6 h-6 text-pink-400" />
            <span className="text-sm text-gray-600">Total Mentees</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mentees.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-500" />
            <span className="text-sm text-gray-600">Active Mentees</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {mentees.filter(m => m.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-600">Total Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {mentees.reduce((sum, m) => sum + m.sessionsCompleted, 0)}
          </p>
        </div>
      </motion.div>

      {/* Mentees List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Mentees</h2>
        <div className="space-y-4">
          {mentees.map((mentee, index) => (
            <motion.div
              key={mentee.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{mentee.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mentee.name}</h3>
                  <p className="text-sm text-gray-600">{mentee.business}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      Last contact: {mentee.lastContact}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      mentee.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {mentee.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Sessions: {mentee.sessionsCompleted}</p>
                <p className="text-sm font-medium text-gray-900 mb-3">Next: {mentee.nextSession}</p>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Mentees;
