import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import darkLogo from '../../assets/logos/brown.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 20);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;

    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);

  const handleHomeClick = () => {
    if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Saharohi AI', href: '/#features' },
    { name: 'Stories', href: '/#stories' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-neutral-200/50 py-0'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2.5 group">
          <img
            src={darkLogo}
            alt="saharohi logo"
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-manrope font-semibold text-2xl tracking-wide lowercase text-black">
            saharohi
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={link.href === '/' ? handleHomeClick : undefined}
              className="text-[16px] font-medium text-neutral-700 hover:text-[#8D4624] transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Log In Button - Thin brown border */}
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-medium text-neutral-800 bg-white border border-[#8D4624]/60 rounded-full shadow-sm hover:bg-[#8D4624]/5 hover:text-[#8D4624] transition-all duration-200"
          >
            Log In
          </Link>

          {/* Sign Up Button - Subtle thin white border */}
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-[#8D4624] border border-white/60 rounded-full shadow-sm hover:bg-[#73371b] hover:border-white/80 transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-black hover:bg-neutral-100 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-md px-6 py-6 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.href === '/') handleHomeClick();
                }}
                className="text-base font-medium text-neutral-800 hover:text-[#8D4624] py-1 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-neutral-200/60 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-neutral-800 bg-white border border-[#8D4624]/60 rounded-full shadow-sm hover:bg-[#8D4624]/5 hover:text-[#8D4624] transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#8D4624] border border-white/60 rounded-full shadow-sm hover:bg-[#73371b] hover:border-white/80 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}