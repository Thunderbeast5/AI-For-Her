import React from 'react';
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import logo from '../../assets/logos/white.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#8D4624] rounded-t-3xl md:rounded-t-[3rem] pt-16 pb-8 px-6 md:px-12 text-[#FAF4EE] relative overflow-hidden">
      {/* Warm ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C87A54] opacity-25 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6 cursor-pointer">
              <img
                src={logo}
                alt="sarahi emblem"
                className="h-12 w-auto object-contain opacity-100"
              />
              <span className="text-2xl font-semibold tracking-[0.22em] text-white lowercase">saharohi</span>
            </div>
            <p className="text-[#FAF4EE]/90 text-base leading-relaxed mb-6 max-w-sm">
              An AI-powered digital ecosystem empowering women to turn their passions into sustainable, scalable enterprises.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-playfair italic text-xl text-[#FAF4EE] mb-6 tracking-wide">Platform</h4>
            <ul className="space-y-4 text-sm text-[#FAF4EE]/80">
              <li><a href="/aboutus" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">About Us</a></li>
              <li><a href="/dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">AI Business Coach</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Find a Mentor</a></li>
              <li><a href="/enterprise/store" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Enterprise Shop</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-playfair italic text-xl text-[#FAF4EE] mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-sm text-[#FAF4EE]/80">
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Funding & Grants</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Community Forum</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Help Center</a></li>
              <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Success Stories</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-playfair italic text-xl text-[#FAF4EE] mb-6 tracking-wide">Connect</h4>

            <a href="mailto:hello@sarahi.com" className="flex items-center gap-3 text-sm text-[#FAF4EE]/90 mb-8 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <FiMail className="text-base text-[#FAF4EE]" />
              </div>
              <span>hello@sarahi.com</span>
            </a>

            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#FAF4EE] hover:bg-white hover:text-[#8D4624] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaInstagram className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#FAF4EE] hover:bg-white hover:text-[#8D4624] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaLinkedinIn className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#FAF4EE] hover:bg-white hover:text-[#8D4624] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaTwitter className="text-lg" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FAF4EE]/75">
          <p>© 2026 sarahi. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white hover:underline transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white hover:underline transition-all">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;