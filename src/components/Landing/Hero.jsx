import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar'; // Adjust the import path if needed
import PatternWaves from './PatternWaves';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* PatternWaves Background */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <PatternWaves
          preset="silk"
          color="#804828"
          backgroundColor="#F6EBDD"
          fade="top"
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          pattern="dot"
          wave="silk"
          spacing={9}
          markSize={0.95}
          depth={1.45}
          light={0}
          shine={0.8}
          contrast={1.2}
          speed={0.55}
          scale={0.7}
          direction={36}
          opacity={1}
          fadeSize={0.5}
          characters=".:-=+*#%@"
          intro
          paused={false}
        />
      </div>

      <Navbar />

      {/* Hero Text: Slides up and fades in smoothly after the background and navbar */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-2 md:px-8 lg:px-12">
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="whitespace-nowrap text-base sm:text-lg md:text-4xl lg:text-5xl xl:text-6xl font-normal italic font-playfair drop-shadow-xl mb-6 tracking-tight leading-tight"
        >
          Turn Your Passion Into An Enterprise.
        </motion.h1>
      </div>

    </div>
  );
};

export default Hero;