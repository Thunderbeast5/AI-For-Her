import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import GoogleTranslate from '../components/GoogleTranslate';

// Make sure paths match your project structure
import heroImage from '../assets/real_start.png'; // Using the same image as login/signup
import logo from '../assets/bg.png';
import wordmark from '../assets/text.png';

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-[#fffdf9] overflow-hidden">
      
      {/* Left Half - Image Section (Matches Login/Signup Theme) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b1f16]/40 to-transparent"></div>
        
        {/* Top Left Navigation & Branding */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#3b1f16] transition-all hover:-translate-x-1 shadow-sm"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain " />
            <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain " />
          </div>
        </div>

        <div className="absolute bottom-16 left-12 pr-12 z-20">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-normal italic font-playfair text-[#fdf9f1] drop-shadow-lg leading-tight mb-4"
          >
            Where ideas blossom<br/>into enterprises.
          </motion.h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#efb84a] to-[#d99a2b] rounded-full"></div>
        </div>
      </div>

      {/* Right Half - Options Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-20 lg:px-24 py-12 h-screen">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#efb84a] opacity-[0.05] blur-[100px] rounded-full pointer-events-none"></div>

        {/* Back Button (Mobile Only) */}
        <button 
          onClick={() => navigate(-1)} 
          className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#e8dcc4] shadow-sm text-[#3b1f16] hover:text-[#6f1d1b] hover:border-[#efb84a] hover:bg-[#fffdf9] transition-all hover:-translate-x-1"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        {/* <div className="absolute top-6 right-6 z-20">
          <GoogleTranslate />
        </div> */}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          
          <div className="lg:hidden flex items-center justify-center gap-1 mb-10 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Pratibhara emblem" className="h-14 w-auto object-contain" />
            <img src={wordmark} alt="Pratibhara" className="h-10 w-auto object-contain" />
          </div>

          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-playfair italic text-[#6f1d1b] mb-4 tracking-tight">
              Begin Your Journey
            </h2>
            <p className="text-[#3b1f16] text-lg opacity-80 font-medium">
              Join an ecosystem built to empower women entrepreneurs, connect with mentors, and discover funding.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-5">
            
            {/* Primary Action: Sign Up */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 4 }}
              onClick={() => navigate('/signup')}
              className="w-full border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-4 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:shadow-[0_7px_0_#3b1f16] active:shadow-[0_1px_0_#3b1f16]"
            >
              Create an Account
            </motion.button>

            <div className="flex items-center w-full my-2">
              <div className="flex-grow h-px bg-[#e8dcc4]"></div>
              <span className="px-4 text-[#3b1f16] font-bold opacity-50 uppercase tracking-widest text-sm">or</span>
              <div className="flex-grow h-px bg-[#e8dcc4]"></div>
            </div>

            {/* Secondary Action: Log In */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 4 }}
              onClick={() => navigate('/login')}
              className="w-full border-4 border-[#3b1f16] bg-white text-[#3b1f16] px-8 py-4 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:bg-[#fffaf0] hover:shadow-[0_7px_0_#3b1f16] active:shadow-[0_1px_0_#3b1f16]"
            >
              Sign In to Pratibhara
            </motion.button>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStarted;