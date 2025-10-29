import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HandRaisedIcon, ChatBubbleLeftRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: HandRaisedIcon,
      title: "Smart Mentor Matching",
      description: "Connect with experienced entrepreneurs who understand your journey and can guide your growth."
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "AI Business Coach",
      description: "Get personalized business advice and insights powered by AI to make smarter decisions."
    },
    {
      icon: RocketLaunchIcon,
      title: "Growth & Funding Opportunities",
      description: "Discover grants, incubators, and funding opportunities tailored to women entrepreneurs."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/20">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            AI for Her
          </motion.h1>
          <div className="flex space-x-4">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
            >
              Sign Up
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-gray-700 rounded-lg hover:bg-primary/80 transition-colors"
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Empowering Women Entrepreneurs with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Find mentors, access funding, and grow smarter with personalized AI guidance designed specifically for women in business.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-gray-800 rounded-2xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Get Started
          </motion.button>
        </div>
      </section>

      {/* Illustration placeholder */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl p-12 text-center"
          >
            <div className="text-6xl mb-4">👩‍💼</div>
            <p className="text-gray-600">Illustration of women entrepreneurs collaborating and growing their businesses</p>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Everything you need to succeed
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2024 AI for Her. Empowering women entrepreneurs worldwide.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
