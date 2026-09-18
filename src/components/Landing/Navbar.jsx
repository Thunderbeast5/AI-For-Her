import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import logo from '../../assets/bg.png';
import wordmark from '../../assets/text.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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
          onClick={() => navigate('/aboutus')} 
          className="text-white text-lg font-medium hover:text-pink-300 transition-colors drop-shadow-md"
        >
          About Us
        </button>
        <button 
          onClick={() => navigate('/enterprise/store')} 
          className="text-white text-lg font-medium hover:text-pink-300 transition-colors drop-shadow-md"
        >
          Shop
        </button>
      </div>

      {/* Right: Action Button */}
      <div className="flex items-center gap-5">
        <button 
          onClick={() => navigate(currentUser ? '/dashboard' : '/login')} 
          className="bg-linear-to-r from-pink-500 to-rose-500 text-white px-8 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5"
        >
          {currentUser ? 'Dashboard' : 'Log In'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;