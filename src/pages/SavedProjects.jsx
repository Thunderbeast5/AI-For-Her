import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BookmarkIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const SavedProjects = () => {
  const savedProjects = [
    {
      id: 1,
      name: 'FarmFresh Connect',
      founder: 'Kavita Singh',
      category: 'AgriTech',
      description: 'Direct farm-to-consumer organic produce delivery platform',
      fundingGoal: '₹20,00,000',
      location: 'Pune',
      rating: 4.3,
      savedDate: '2 days ago'
    },
    {
      id: 2,
      name: 'BeautyTech Solutions',
      founder: 'Riya Kapoor',
      category: 'Beauty',
      description: 'AI-powered personalized skincare recommendations',
      fundingGoal: '₹30,00,000',
      location: 'Mumbai',
      rating: 4.7,
      savedDate: '1 week ago'
    }
  ];

  return (
    <DashboardLayout sidebar={<InvestorSidebar />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Projects</h1>
        <p className="text-gray-600">Projects you're interested in</p>
      </motion.div>

      {savedProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {savedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600">Founded by {project.founder}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <BookmarkIcon className="w-5 h-5 text-pink-400 fill-pink-400" />
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{project.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{project.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {project.category}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {project.location}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Saved {project.savedDate}</span>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-pink-400 text-white text-sm font-medium rounded-lg hover:bg-pink-500 transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 shadow-sm text-center"
        >
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Saved Projects</h3>
          <p className="text-gray-600 mb-6">Start saving projects you're interested in</p>
          <button 
            onClick={() => window.location.href = '/browse-projects'}
            className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors"
          >
            Browse Projects
          </button>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default SavedProjects;
