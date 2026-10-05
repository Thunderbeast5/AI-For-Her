import React from 'react';
import Nav from './Nav'; // Adjust the import path if needed
import heroImage from '../../assets/real_hero.png';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div>
        <Nav />
      </div>

      <div className="relative z-10 flex flex-col items-start justify-center h-full text-left px-2 md:px-8 lg:px-12 -translate-y-16 md:-translate-y-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal italic font-playfair text-black drop-shadow-xl mb-6 max-w-4xl tracking-tight leading-tight">
          Turn Your Passion Into<br />
          An Enterprise.
        </h1>
      </div>
    </div>
  );
};

export default Hero;