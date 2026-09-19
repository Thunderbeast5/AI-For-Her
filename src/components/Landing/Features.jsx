import React from 'react';
import { motion } from 'framer-motion';
import { TbHeartHandshake, TbBrain, TbPlant } from 'react-icons/tb';

const Features = () => {
  const features = [
    {
      title: "Smart Mentor Matching",
      description: "Connect with experienced entrepreneurs who understand your journey and can guide your growth.",
      icon: <TbHeartHandshake className="text-4xl text-[#3b1f16]" />
    },
    {
      title: "AI Business Coach",
      description: "Get personalized business advice and insights powered by AI to make smarter decisions.",
      icon: <TbBrain className="text-4xl text-[#3b1f16]" />
    },
    {
      title: "Growth & Funding Opportunities",
      description: "Discover grants, incubators, and funding opportunities tailored to women entrepreneurs.",
      icon: <TbPlant className="text-4xl text-[#3b1f16]" />
    }
  ];

  return (
    <section className="relative w-full py-24 px-6 md:px-12 bg-transparent overflow-hidden flex justify-center">
      
      {/* Background Glow: Fades and scales in gently when scrolling into view */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#efb84a] blur-[100px] rounded-full pointer-events-none"
      ></motion.div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.h2 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-normal italic font-playfair text-[#6f1d1b] drop-shadow-sm mb-6 tracking-tight"
          >
            Everything You Need to Succeed
          </motion.h2>
          
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: 96, opacity: 1 }} // 96px = w-24
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full mb-8 shadow-sm"
          ></motion.div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            viewport={{ once: true }}
            className="text-[#3b1f16] text-lg max-w-2xl font-medium opacity-80"
          >
            Comprehensive tools and support designed specifically for women entrepreneurs
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {features.map((feature, index) => (
            /* 
              Cards pop in sequentially based on their index. 
              The hover effects (translate-y, shadow, bg) remain handled by Tailwind.
            */
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut", 
                delay: 0.5 + index * 0.2 // Staggers the cards by 0.2s each
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl border border-white/40 p-8 shadow-[0_8px_32px_rgba(111,29,27,0.08)] hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_16px_48px_rgba(111,29,27,0.12)] transition-all duration-300 ease-out flex flex-col items-start group"
            >
              {/* Subtle inner glow for the glass effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Glassmorphic Icon Container */}
              <div className="relative z-10 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-white/30 backdrop-blur-md border border-white/50 shadow-inner">
                {feature.icon}
              </div>
              
              <h3 className="relative z-10 text-xl font-bold text-[#6f1d1b] mb-3">
                {feature.title}
              </h3>
              <p className="relative z-10 text-[#3b1f16] leading-relaxed opacity-90">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;