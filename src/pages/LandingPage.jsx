import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HandRaisedIcon, ChatBubbleLeftRightIcon, RocketLaunchIcon, SparklesIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import GoogleTranslate from '../components/GoogleTranslate'

const LandingPage = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const heroSlides = [
    {
      title: "Empowering Women Entrepreneurs",
      subtitle: "Connect with mentors, access funding, and grow your business with AI-powered guidance",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop"
    },
    {
      title: "Find Your Perfect Mentor",
      subtitle: "Get matched with experienced entrepreneurs who understand your journey",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    },
    {
      title: "Access Funding Opportunities",
      subtitle: "Discover grants, incubators, and investors tailored for women-led startups",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop"
    }
  ]

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

  const testimonials = [
    {
      text: "AI For Her helped me find the perfect mentor who guided me through launching my startup. The platform is incredibly intuitive!",
      name: "Priya Sharma",
      role: "Founder, TechStart",
      initial: "P",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      text: "The AI business coach feature is a game-changer. I get personalized advice whenever I need it, helping me make smarter decisions.",
      name: "Anjali Desai",
      role: "CEO, GreenEco",
      initial: "A",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      text: "Found amazing funding opportunities through this platform. The community support is incredible and truly empowering!",
      name: "Meera Patel",
      role: "Entrepreneur",
      initial: "M",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      text: "As a mentor, I love connecting with passionate women entrepreneurs. This platform makes mentorship seamless and impactful.",
      name: "Kavita Reddy",
      role: "Business Mentor",
      initial: "K",
      gradient: "from-green-500 to-teal-600"
    },
    {
      text: "The self-help groups feature helped me connect with like-minded entrepreneurs. We support each other's growth journey!",
      name: "Sneha Gupta",
      role: "Startup Founder",
      initial: "S",
      gradient: "from-orange-500 to-red-600"
    },
    {
      text: "AI For Her is more than a platform - it's a movement. Proud to be part of this empowering community of women leaders.",
      name: "Divya Singh",
      role: "Social Entrepreneur",
      initial: "D",
      gradient: "from-indigo-500 to-purple-600"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        /* Style Google Translate widget on landing page */
        #google_translate_element select {
          background-color: white !important;
          border: 2px solid white !important;
          border-radius: 0.5rem !important;
          padding: 0.25rem 0.5rem !important;
          color: #111827 !important;
          font-weight: 600 !important;
        }
        #google_translate_element select:hover {
          background-color: rgba(255, 255, 255, 0.9) !important;
        }
        .goog-te-gadget {
          font-family: inherit !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
        }
      `}</style>
      {/* Navbar - Scroll Responsive */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="w-full flex justify-center transition-all duration-300" style={{ paddingTop: isScrolled ? '0.5rem' : '0' }}>
          <div className={`transition-all duration-300 ${
            isScrolled 
              ? 'w-full max-w-4xl rounded-2xl bg-pink-200 shadow-2xl py-2' 
              : 'w-full max-w-7xl bg-pink-200/95 backdrop-blur-sm py-4'
          }`}>
            <div className={`flex justify-between items-center transition-all duration-300 ${
              isScrolled ? 'px-8' : 'px-6'
            }`}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`font-bold text-gray-900 notranslate cursor-pointer hover:text-pink-600 transition-all duration-300 ${
              isScrolled ? 'text-xl' : 'text-2xl'
            }`}
            onClick={() => navigate('/')}
          >
            AI For Her
          </motion.h1>
          <div className="flex items-center space-x-4">
            <GoogleTranslate />
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/signup')}
              className="text-gray-900 font-semibold hover:text-pink-600 transition-colors"
            >
              Sign Up
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/login')}
              className="text-gray-900 font-semibold hover:text-pink-600 transition-colors"
            >
              Sign In
            </motion.button>
          </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel - Full Width with Text Overlay */}
      <section className="relative h-screen overflow-hidden" style={{ marginTop: '72px' }}>
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${currentSlide === index ? 'z-10' : 'z-0'}`}
          >
            {/* Full Width Background Image */}
            <div className="absolute inset-0">
              <img 
                src={slide.imageUrl} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            {/* Text Overlay */}
            <div className="relative h-full flex items-center justify-center">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-200 to-pink-300 text-gray-900 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Feature Cards with Pink Accents */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-900 mb-4"
          >
            Everything You Need to Succeed
          </motion.h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Comprehensive tools and support designed specifically for women entrepreneurs
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-pink-300 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-pink-200 to-pink-300 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Our Community Says</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from women entrepreneurs who are building their dreams with AI For Her
            </p>
          </div>
          
          <div className="space-y-4 overflow-hidden relative">
            {/* Left fade overlay */}
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            {/* Right fade overlay */}
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            
            {/* Row 1 - Left to Right */}
            <div className="animate-carousel-right">
              <div className="flex gap-6 w-max">
                {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((testimonial, idx) => (
                  <div key={idx} className="bg-gray-50 border border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 w-80">
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-gray-600 text-xs">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - Right to Left */}
            <div className="animate-carousel-left">
              <div className="flex gap-6 w-max">
                {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((testimonial, idx) => (
                  <div key={idx} className="bg-gray-50 border border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 w-80">
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold`}>
                        {testimonial.initial}
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-gray-600 text-xs">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes carousel-right {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            
            @keyframes carousel-left {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            
            .animate-carousel-right {
              animation: carousel-right 30s linear infinite;
            }
            
            .animate-carousel-left {
              animation: carousel-left 30s linear infinite;
            }
          `}</style>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h3>
            <p className="text-xl text-gray-600 mb-8">Connect with thousands of women entrepreneurs building their dreams.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-pink-200 to-pink-300 hover:shadow-xl text-gray-900 font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-md"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-xl border-2 border-pink-200 transition-all duration-300 shadow-md"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto bg-pink-200 rounded-t-3xl px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-6">
            <div>
              <h3 className="text-gray-900 font-bold text-xl mb-4 notranslate">AI For Her</h3>
              <p className="text-gray-700 text-sm">Empowering women entrepreneurs with AI-powered guidance and community support.</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Get Started</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Mentor Matching</li>
                <li className="hover:text-white transition-colors cursor-pointer">AI Coach</li>
                <li className="hover:text-white transition-colors cursor-pointer">Funding Opportunities</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Self-Help Groups</li>
                <li className="hover:text-white transition-colors cursor-pointer">Success Stories</li>
                <li className="hover:text-white transition-colors cursor-pointer">Resources</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white pt-6 text-center">
            <p className="text-gray-700 text-sm">&copy; 2025 <span className="notranslate text-gray-900 font-semibold">AI For Her</span>. Empowering women entrepreneurs worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
