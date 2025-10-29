import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'entrepreneur',
      title: "I'm an Entrepreneur",
      description: 'Build your startup & connect with mentors and investors',
      icon: BriefcaseIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Guide entrepreneurs & share your expertise',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'investor',
      title: "I'm an Investor",
      description: 'Discover opportunities & invest in promising startups',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleRoleSelect = (roleId) => {
    navigate('/signup', { state: { role: roleId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            What brings you to
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI For Her?
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Choose your role to get started with the registration process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              className="cursor-pointer group"
            >
              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 h-full">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center">
                      <role.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {role.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {role.description}
                  </p>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
