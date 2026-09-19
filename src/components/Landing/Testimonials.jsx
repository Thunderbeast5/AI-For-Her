import React from 'react';
import { motion } from 'framer-motion';
import { TbQuote } from 'react-icons/tb';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Founder, EcoThreads",
      quote: "Pratibhara's AI coach helped me refine my business model in days instead of months. The location-based insights were a game-changer for launching my boutique.",
      initials: "PS"
    },
    {
      name: "Anita Desai",
      role: "Tech Entrepreneur",
      quote: "Finding the right mentor was always my biggest hurdle. Through this platform, I connected with an industry veteran who guided my seed funding round.",
      initials: "AD"
    },
    {
      name: "Meera Reddy",
      role: "Artisan & Creator",
      quote: "I had the passion but lacked the business acumen. The step-by-step guidance turned my small handicraft hobby into a scalable, sustainable enterprise.",
      initials: "MR"
    }
  ];

  return (
    <section className="relative w-full min-h-screen py-24 px-6 md:px-12 bg-transparent overflow-hidden flex items-center justify-center">
      
      {/* Background Glow: Fades and scales in on scroll */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute bottom-0 right-1/4 translate-y-1/3 w-[500px] h-[500px] bg-[#d99a2b] blur-[120px] rounded-full pointer-events-none"
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
            Stories of Growth
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
            Hear from the women who turned their ideas into thriving enterprises with Pratibhara.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut", 
                delay: 0.5 + index * 0.2 // Sequential staggering
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl border border-white/40 p-8 shadow-[0_8px_32px_rgba(111,29,27,0.08)] hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_16px_48px_rgba(111,29,27,0.12)] transition-all duration-300 ease-out flex flex-col group"
            >
              {/* Inner subtle glass highlight on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Quote Icon */}
              <TbQuote className="relative z-10 text-4xl text-[#efb84a] opacity-60 mb-6" />
              
              {/* Quote Text */}
              <p className="relative z-10 text-[#3b1f16] text-lg leading-relaxed italic mb-8 grow">
                "{testimonial.quote}"
              </p>

              {/* User Info Profile */}
              <div className="relative z-10 flex items-center gap-4 mt-auto">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#efb84a]/30 to-[#d99a2b]/30 border border-[#efb84a]/40 shadow-inner">
                  <span className="text-[#6f1d1b] font-bold tracking-wider">
                    {testimonial.initials}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#6f1d1b]">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-[#3b1f16] opacity-80">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;