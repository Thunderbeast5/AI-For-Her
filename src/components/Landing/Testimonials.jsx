import React from 'react';
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
    <section
      id="stories"
      className="relative w-full min-h-screen scroll-mt-20 py-24 px-6 md:px-12 bg-white overflow-hidden flex items-center justify-center"
    >
      {/* Subtle warm terracotta background glow */}
      <div className="absolute bottom-0 right-1/4 translate-y-1/3 w-[500px] h-[500px] bg-[#8D4624] blur-[140px] rounded-full pointer-events-none opacity-5"></div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-6 tracking-tight">
            Stories of Growth
          </h2>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-24"></div>

          <p className="text-[#4A3228] text-lg max-w-2xl font-medium opacity-85">
            Hear from the women who turned their ideas into thriving enterprises with Pratibhara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative overflow-hidden bg-[#FCFAF8] rounded-3xl border border-[#8D4624]/10 p-8 shadow-sm hover:-translate-y-2 hover:bg-white hover:border-[#8D4624]/25 hover:shadow-xl transition-all duration-300 ease-out flex flex-col group"
            >
              <TbQuote className="relative z-10 text-4xl text-[#8D4624] opacity-50 mb-6 group-hover:opacity-80 transition-opacity duration-300" />

              <p className="relative z-10 text-[#4A3228] text-lg leading-relaxed italic mb-8 grow">
                "{testimonial.quote}"
              </p>

              <div className="relative z-10 flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-[#8D4624]/20 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-[#8D4624] font-bold tracking-wider">
                    {testimonial.initials}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-[#8D4624]">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-[#4A3228] opacity-80">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;