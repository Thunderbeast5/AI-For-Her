import React from 'react';

const About = () => {
  return (
    <section
      id="about"
      className="relative w-full scroll-mt-20 py-24 px-6 md:px-12 bg-white overflow-hidden flex justify-center"
    >
      {/* Soft warm glow behind content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#8D4624] blur-[140px] rounded-full pointer-events-none opacity-5"></div>

      <div className="relative z-10 max-w-4xl flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-6 tracking-tight">
          About Pratibhara
        </h2>

        <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-10 shadow-sm w-24"></div>

        <div className="text-[#4A3228] text-lg md:text-xl font-medium leading-relaxed space-y-6">
          <p>
            Pratibhara is an AI-powered digital ecosystem designed to help women turn their ideas into sustainable and growth-oriented enterprises.
          </p>

          <p>
            The platform supports women at every step right from discovering business ideas to getting mentorship, accessing funding, finding customers, and scaling their enterprise.
          </p>

          <p>
            With the help of an intelligent AI assistant, women receive personalised, location-based guidance that simplifies decision-making, reduces confusion, and builds confidence.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;