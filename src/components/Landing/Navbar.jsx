import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import logo from '../../assets/bg.png';
import wordmark from '../../assets/text.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAboutPage = location.pathname === '/aboutus';

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent">
      {/* Left: Brand logos */}
      <div
        className="flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate('/')}
      >
        <img
          src={logo}
          alt="Pratibhara emblem"
          className="h-16 md:h-20 w-auto object-contain"
        />
        <img
          src={wordmark}
          alt="Pratibhara"
          className="h-12 md:h-16 w-auto max-w-[200px] md:max-w-[280px] object-contain"
        />
      </div>

      {/* Middle: Links */}
      <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-8">
        <button 
          onClick={() => navigate(isAboutPage ? '/' : '/aboutus')} 
          className="text-[#6f1d1b] text-lg font-medium hover:text-[#9a3b25] transition-colors drop-shadow-md"
        >
          {isAboutPage ? 'Home' : 'About'}
        </button>
        <button 
          onClick={() => navigate('/enterprise/store')} 
          className="text-[#6f1d1b] text-lg font-medium hover:text-[#9a3b25] transition-colors drop-shadow-md"
        >
          Shop
        </button>
      </div>

      {/* Right: Action Button */}
      <div className="flex items-center gap-5">
        <button 
          onClick={() => navigate(currentUser ? '/dashboard' : '/get-started')} 
          className="border-4 border-[#3b1f16] bg-linear-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-2 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16]"
        >
          {currentUser ? 'Dashboard' : 'Get Started'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;