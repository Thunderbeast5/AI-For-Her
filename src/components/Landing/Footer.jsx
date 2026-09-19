import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import logo from '../../assets/bg.png';
import wordmark from '../../assets/text.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#3b1f16] rounded-t-3xl md:rounded-t-[3rem] pt-16 pb-8 px-6 md:px-12 text-[#fdf9f1] relative overflow-hidden">
      
      {/* Subtle deep red glow in the top right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6f1d1b] opacity-20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="md:col-span-5 flex flex-col items-start"
          >
            <div className="flex items-center gap-1 mb-6 cursor-pointer">
              <img 
                src={logo} 
                alt="Pratibhara emblem" 
                className="h-12 w-auto object-contain opacity-90" 
              />
              <img 
                src={wordmark} 
                alt="Pratibhara" 
                className="h-9 w-auto object-contain brightness-0 invert opacity-90" 
              />
            </div>
            <p className="text-[#e8dcc4] text-base leading-relaxed mb-6 opacity-80 max-w-sm">
              An AI-powered digital ecosystem empowering women to turn their passions into sustainable, scalable enterprises.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <h4 className="font-playfair italic text-xl text-[#efb84a] mb-6 tracking-wide">Platform</h4>
            <ul className="space-y-4 text-sm text-[#e8dcc4] opacity-80">
              <li><a href="/aboutus" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">About Us</a></li>
              <li><a href="/dashboard" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">AI Business Coach</a></li>
              <li><a href="#" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Find a Mentor</a></li>
              <li><a href="/enterprise/store" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Enterprise Shop</a></li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <h4 className="font-playfair italic text-xl text-[#efb84a] mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-sm text-[#e8dcc4] opacity-80">
              <li><a href="#" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Funding & Grants</a></li>
              <li><a href="#" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Community Forum</a></li>
              <li><a href="#" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Help Center</a></li>
              <li><a href="#" className="hover:text-[#efb84a] hover:translate-x-1 inline-block transition-all duration-300">Success Stories</a></li>
            </ul>
          </motion.div>

          {/* Contact & Socials */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-3"
          >
            <h4 className="font-playfair italic text-xl text-[#efb84a] mb-6 tracking-wide">Connect</h4>
            
            <a href="mailto:hello@pratibhara.com" className="flex items-center gap-3 text-sm text-[#e8dcc4] opacity-80 mb-8 hover:text-[#efb84a] transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#efb84a]/20 transition-colors">
                <FiMail className="text-base" />
              </div>
              <span>hello@pratibhara.com</span>
            </a>

            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e8dcc4] hover:bg-gradient-to-br hover:from-[#efb84a] hover:to-[#d99a2b] hover:text-[#3b1f16] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaInstagram className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e8dcc4] hover:bg-gradient-to-br hover:from-[#efb84a] hover:to-[#d99a2b] hover:text-[#3b1f16] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaLinkedinIn className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#e8dcc4] hover:bg-gradient-to-br hover:from-[#efb84a] hover:to-[#d99a2b] hover:text-[#3b1f16] hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <FaTwitter className="text-lg" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Bottom Bar - Copyright & Legal */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#e8dcc4] opacity-60"
        >
          <p>© 2026 Pratibhara. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white hover:underline transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white hover:underline transition-all">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;