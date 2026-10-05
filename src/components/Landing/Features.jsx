import React from 'react';
import { TbHeartHandshake, TbBrain, TbPlant } from 'react-icons/tb';

const Features = () => {
  const features = [
    {
      title: "Smart Mentor Matching",
      description: "Connect with experienced entrepreneurs who understand your journey and can guide your growth.",
      icon: <TbHeartHandshake className="text-4xl text-[#8D4624]" />
    },
    {
      title: "AI Business Coach",
      description: "Get personalized business advice and insights powered by AI to make smarter decisions.",
      icon: <TbBrain className="text-4xl text-[#8D4624]" />
    },
    {
      title: "Growth & Funding Opportunities",
      description: "Discover grants, incubators, and funding opportunities tailored to women entrepreneurs.",
      icon: <TbPlant className="text-4xl text-[#8D4624]" />
    }
  ];

  return (
    <section
      id="features"
      className="relative w-full scroll-mt-20 py-24 px-6 md:px-12 bg-white overflow-hidden flex justify-center"
    >
      {/* Soft warm glow behind cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8D4624] blur-[140px] rounded-full pointer-events-none opacity-5"></div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-6 tracking-tight">
            Everything You Need to Succeed
          </h2>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-24"></div>

          <p className="text-[#4A3228] text-lg max-w-2xl font-medium opacity-85">
            Comprehensive tools and support designed specifically for women entrepreneurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden bg-[#FCFAF8] rounded-3xl border border-[#8D4624]/10 p-8 shadow-sm hover:-translate-y-2 hover:bg-white hover:border-[#8D4624]/25 hover:shadow-xl transition-all duration-300 ease-out flex flex-col items-start group"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-white border border-[#8D4624]/15 shadow-sm group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>

              <h3 className="relative z-10 text-xl font-bold text-[#8D4624] mb-3">
                {feature.title}
              </h3>
              <p className="relative z-10 text-[#4A3228] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;