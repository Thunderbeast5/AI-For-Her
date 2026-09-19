import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="relative w-full py-24 px-6 md:px-12 bg-transparent overflow-hidden flex justify-center">
      
      {/* 
        Subtle Background Glow: Fades and scales in gently when scrolling into view 
      */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#efb84a] blur-[100px] rounded-full pointer-events-none"
      ></motion.div>

      <div className="relative z-10 max-w-4xl flex flex-col items-center text-center">
        
        {/* Heading: Slides up slightly and fades in */}
        <motion.h2 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-normal italic font-playfair text-[#6f1d1b] drop-shadow-sm mb-6 tracking-tight"
        >
          About Pratibhara
        </motion.h2>

        {/* Divider Line: Expands outward from the center (width 0 to width 6rem/24) */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 96, opacity: 1 }} // 96px = w-24
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full mb-10 shadow-sm"
        ></motion.div>

        {/* Text Container: Paragraphs stagger in one after another */}
        <div className="text-[#3b1f16] text-lg md:text-xl font-medium leading-relaxed space-y-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Pratibhara is an AI-powered digital ecosystem designed to help women turn their ideas into sustainable and growth-oriented enterprises.
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            The platform supports women at every step right from discovering business ideas to getting mentorship, accessing funding, finding customers, and scaling their enterprise.
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            With the help of an intelligent AI assistant, women receive personalised, location-based guidance that simplifies decision-making, reduces confusion, and builds confidence.
          </motion.p>
        </div>

      </div>
    </section>
  );
};

export default About;