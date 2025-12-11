import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  SparklesIcon, 
  LightBulbIcon, 
  RocketLaunchIcon, 
  GlobeAltIcon,
  HeartIcon,
  UserGroupIcon,
  HandRaisedIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import GoogleTranslate from '../components/GoogleTranslate'
import { useAuth } from '../context/authContext'
import logo from '../../logo1.png'
import aboutUsImage from './aboutus.jpeg'

const AboutUs = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const impactSteps = [
    {
      icon: SparklesIcon,
      title: "Spark of Access → Rise of Clarity",
      description: "Women gain access to resources, mentorship, and guidance that transforms confusion into clear direction."
    },
    {
      icon: LightBulbIcon,
      title: "Clarity Turns into Action",
      description: "With clear goals and support, women take confident steps to start and build their businesses."
    },
    {
      icon: RocketLaunchIcon,
      title: "Action Blossoms into Growth",
      description: "Businesses scale through continued support, funding opportunities, and market access."
    },
    {
      icon: GlobeAltIcon,
      title: "Growth Creates Waves of Impact",
      description: "Successful women entrepreneurs inspire others, creating a ripple effect of empowerment and change."
    }
  ]

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full bg-pink-300/95 backdrop-blur-sm py-3">
          <div className="flex justify-between items-center px-6 max-w-7xl mx-auto h-14">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img 
                src={logo} 
                alt="AI For Her Logo" 
                className="h-24 w-auto object-contain"
              />
            </motion.div>
            <div className="flex items-center space-x-4">
              <GoogleTranslate />
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate('/about')}
                className="text-gray-900 font-semibold hover:text-pink-600 transition-colors"
              >
                About Us
              </motion.button>
              {currentUser ? (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-900 font-semibold hover:text-pink-600 transition-colors"
                >
                  Dashboard
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => navigate('/signup')}
                  className="text-gray-900 font-semibold hover:text-pink-600 transition-colors"
                >
                  Sign Up
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-pink-400 mb-6">
              About Pratibhara
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              An AI-powered digital ecosystem designed to help women turn their ideas into sustainable and growth-oriented enterprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-pink-400 mb-6">
                Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To build a world where every woman—regardless of background, location, or resources—has the confidence, support, and opportunities to turn her ideas into a thriving enterprise.
              </p>
            </motion.div>

            {/* Right side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={aboutUsImage} 
                  alt="Women Entrepreneur" 
                  className="w-full h-auto object-cover"
                />
                {/* Pink overlay circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400 rounded-full opacity-20 -mr-32 -mt-32"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-pink-400 mb-6">
              Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
              To empower women by providing a unified digital ecosystem that offers personalized guidance, mentorship, financial access, market opportunities, and a strong community—enabling them to grow sustainable and impactful businesses.
            </p>
          </motion.div>

          {/* 4 Cs Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {/* Collaborate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Collaborate</h3>
            </motion.div>

            {/* Consolidate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Square3Stack3DIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Consolidate</h3>
            </motion.div>

            {/* Catalyze */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Catalyze</h3>
            </motion.div>

            {/* Converge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-pink-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowTrendingUpIcon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Converge</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Roadmap Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-pink-400">
              Impact Roadmap
            </h2>
            <p className="text-xl text-gray-600">
              Our journey to empowering women entrepreneurs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {impactSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border-2 border-pink-200 hover:border-pink-300">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-pink-300 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-pink-400">
              Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Meet the minds behind Pratibhara
            </p>
          </motion.div>

          {/* First row: 3 cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Dr. Snehal Kamalapur */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dr. Snehal Kamalapur</h3>
              <p className="text-sm text-pink-600 font-semibold mb-2">PhD in Computer Engineering</p>
              <p className="text-sm text-gray-700 mb-1">Professor and Head of Computer Engineering</p>
              <p className="text-sm text-gray-600">KKWIEER, Nashik</p>
            </motion.div>

            {/* Prof. Shweta Jadhav */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Prof. Shweta Jadhav</h3>
              <p className="text-sm text-pink-600 font-semibold mb-2">ME Computer Engineering</p>
              <p className="text-sm text-gray-700 mb-1">Assistant Professor</p>
              <p className="text-sm text-gray-600">Department of Computer Engineering</p>
            </motion.div>

            {/* Oceania Kshetrimayum */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
            >
              <div className="w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Oceania Kshetrimayum</h3>
              <p className="text-sm text-pink-600 font-semibold mb-2">B.E. Computer Engineering</p>
              <p className="text-sm text-gray-700 mb-1">Student</p>
              <p className="text-sm text-gray-600">KKWIEER, Nashik</p>
            </motion.div>
          </div>

          {/* Second row: 2 cards centered */}
          <div className="mt-8 flex flex-col md:flex-row justify-center gap-8">
            {/* Vedant Purkar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center max-w-sm w-full"
            >
              <div className="w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vedant Purkar</h3>
              <p className="text-sm text-pink-600 font-semibold mb-2">T.E. Computer Engineering</p>
              <p className="text-sm text-gray-700 mb-1">Student</p>
              <p className="text-sm text-gray-600">KKWIEER, Nashik</p>
            </motion.div>

            {/* Sanchit Shelke */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center max-w-sm w-full"
            >
              <div className="w-24 h-24 bg-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-16 h-16 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sanchit Shelke</h3>
              <p className="text-sm text-pink-600 font-semibold mb-2">B.E. Computer Engineering</p>
              <p className="text-sm text-gray-700 mb-1">Student</p>
              <p className="text-sm text-gray-600">KKWIEER, Nashik</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={logo} 
                  alt="AI For Her Logo" 
                  className="h-12 w-auto object-contain"
                />
                <h3 className="text-gray-900 font-bold text-xl notranslate">AI For Her</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Empowering women entrepreneurs with AI-powered guidance and community support.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold text-base mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/signup')} className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                    Get Started
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-gray-900 transition-colors text-sm">
                    Sign In
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold text-base mb-4">Features</h4>
              <ul className="space-y-2">
                <li className="text-gray-700 text-sm">Mentor Matching</li>
                <li className="text-gray-700 text-sm">AI Coach</li>
                <li className="text-gray-700 text-sm">Funding Opportunities</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold text-base mb-4">Community</h4>
              <ul className="space-y-2">
                <li className="text-gray-700 text-sm">Self-Help Groups</li>
                <li className="text-gray-700 text-sm">Success Stories</li>
                <li className="text-gray-700 text-sm">Resources</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-6 text-center">
            <p className="text-gray-700 text-sm">
              © {new Date().getFullYear()} <span className="notranslate font-semibold text-gray-900">AI For Her</span>. Empowering women entrepreneurs worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutUs
