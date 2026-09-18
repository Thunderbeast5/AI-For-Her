import React from 'react';
import Navbar from './Navbar'; // Adjust the import path if needed
import heroImage from '../../assets/prat.png';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* Background Image without overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
      </div>

      {/* Injecting the Navbar component here */}
      <Navbar />

      {/* Hero Text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 mt-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal italic font-[cursive] text-white drop-shadow-xl mb-6 max-w-4xl tracking-tight leading-tight">
          Turn Your Passion Into An Enterprise.
        </h1>
        <p className="text-lg md:text-2xl text-gray-100 drop-shadow-md mb-10 max-w-2xl font-normal">
          A vibrant digital ecosystem to launch your ideas, match with mentors, and grow your business alongside a community of women.
        </p>
      </div>

    </div>
  );
};

export default Hero;