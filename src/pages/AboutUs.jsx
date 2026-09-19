import React from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  LightBulbIcon, 
  RocketLaunchIcon, 
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  Square3Stack3DIcon,
  BoltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import Footer from '../components/Landing/Footer'
import Navbar from '../components/Landing/Navbar'

const AboutUs = () => {
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
    <div className="min-h-screen bg-[#fffdf9] font-sans relative overflow-hidden">
      
      {/* Subtle Background Glows for the theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#efb84a] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#d99a2b] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <p className="text-[#efb84a] font-bold uppercase tracking-[0.2em] mb-4 text-sm">Our Story</p>
            <h1 className="text-5xl md:text-7xl font-normal italic font-playfair text-[#6f1d1b] tracking-tight mb-6 drop-shadow-sm">
              About Pratibhara
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full mb-8 shadow-sm"></div>
            <p className="text-xl md:text-2xl text-[#3b1f16] max-w-3xl mx-auto leading-relaxed opacity-90 font-medium">
              An AI-powered digital ecosystem designed to help women turn their ideas into sustainable and growth-oriented enterprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section (Typography Focused) */}
      <section className="py-24 px-6 relative z-10 border-y border-[#e8dcc4] bg-[#fdf9f1]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#6f1d1b] mb-8">
              Our Vision
            </h2>
            <p className="text-2xl md:text-3xl text-[#3b1f16] leading-relaxed font-playfair italic opacity-90">
              "To build a world where every woman—regardless of background, location, or resources—has the confidence, support, and opportunities to turn her ideas into a thriving enterprise."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-center flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#6f1d1b] mb-6">
              Our Mission
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full mb-8"></div>
            <p className="text-lg md:text-xl text-[#3b1f16] leading-relaxed max-w-4xl opacity-90 font-medium">
              To empower women by providing a unified digital ecosystem that offers personalized guidance, mentorship, financial access, market opportunities, and a strong community—enabling them to grow sustainable and impactful businesses.
            </p>
          </motion.div>

          {/* 4 Cs Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: "Collaborate", icon: ChatBubbleLeftRightIcon },
              { title: "Consolidate", icon: Square3Stack3DIcon },
              { title: "Catalyze", icon: BoltIcon },
              { title: "Converge", icon: ArrowTrendingUpIcon }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white border border-[#e8dcc4] rounded-3xl p-8 text-center shadow-[0_4px_20px_rgba(59,31,22,0.03)] hover:shadow-[0_12px_40px_rgba(59,31,22,0.08)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-[#fdf9f1] border border-[#e8dcc4] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-[#efb84a] group-hover:scale-105 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-[#3b1f16] group-hover:text-[#d99a2b]" />
                </div>
                <h3 className="text-xl font-bold text-[#6f1d1b] uppercase tracking-wider">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Roadmap Section */}
      <section className="py-24 px-6 relative z-10 bg-[#fdf9f1] border-t border-[#e8dcc4]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#6f1d1b] mb-4">
              Impact Roadmap
            </h2>
            <p className="text-[#3b1f16] text-lg font-medium opacity-80 uppercase tracking-widest">
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
                  className="bg-white border border-[#e8dcc4] rounded-3xl p-8 shadow-[0_4px_20px_rgba(59,31,22,0.03)] hover:shadow-[0_12px_40px_rgba(59,31,22,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#efb84a]/20 to-[#d99a2b]/20 border border-[#efb84a]/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-[#3b1f16]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#6f1d1b] mb-3 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[#3b1f16] opacity-80 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs