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
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/10 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI For Her
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your role to get started with the registration process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              className="cursor-pointer group"
            >
              <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 hover:shadow-lg h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-xl border-2 border-gray-200 group-hover:border-purple-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <role.icon className="w-8 h-8 text-gray-700 group-hover:text-purple-600" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {role.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm">
                    {role.description}
                  </p>
                </div>
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
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors underline"
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
