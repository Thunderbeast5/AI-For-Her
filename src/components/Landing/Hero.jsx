import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar'; // Adjust the import path if needed
import heroImage from '../../assets/real_hero.png';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* Background Image: Added a subtle scale-down and fade-in effect to make it feel premium */}
      <motion.div 
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
      </motion.div>

      {/* Navbar: Wrapped in a motion.div to smoothly slide down from the top */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <Navbar />
      </motion.div>

      {/* Hero Text: Slides up and fades in smoothly after the background and navbar */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full text-left px-2 md:px-8 lg:px-12 -translate-y-16 md:-translate-y-20">
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-normal italic font-playfair text-[#6f1d1b] drop-shadow-xl mb-6 max-w-4xl tracking-tight leading-tight"
        >
          Turn Your Passion Into<br />
          An Enterprise.
        </motion.h1>
      </div>

    </div>
  );
};

export default Hero;