import React, { useEffect, useState } from 'react';
import whiteLogo from '../../assets/logos/white.png';
import darkLogo from '../../assets/logos/brown.png'; // Update with your alternate logo path

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 20);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Saharohi AI', href: '#features' },
    { name: 'Stories', href: '#stories' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#8D4624] shadow-md py-0'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <a href="/" className="flex items-center gap-2.5 group">
          <img
            src={isScrolled ? whiteLogo : darkLogo}
            alt="saharohi logo"
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className={`font-manrope font-semibold text-2xl tracking-wide lowercase transition-colors duration-300 ${
              isScrolled ? 'text-white' : 'text-black'
            }`}
          >
            saharohi
          </span>
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[16px] font-medium transition-colors duration-200 ${
                isScrolled
                  ? 'text-white/90 hover:text-white'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Separate Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Log In Button */}
          <a
            href="#login"
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              isScrolled
                ? 'bg-white text-[#8D4624] hover:bg-[#FAF4EE] shadow-sm'
                : 'bg-white text-neutral-800 border border-neutral-200/80 shadow-sm hover:bg-neutral-50 hover:text-black'
            }`}
          >
            Log In
          </a>

          {/* Sign Up Button */}
          <a
            href="#contact"
            className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              isScrolled
                ? 'border border-white/40 text-white hover:bg-white/10'
                : 'bg-white text-[#8D4624] border border-[#8D4624]/20 shadow-sm hover:bg-[#8D4624] hover:text-white'
            }`}
          >
            Sign Up
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors focus:outline-none ${
              isScrolled
                ? 'text-white hover:bg-white/10'
                : 'text-black hover:bg-neutral-100'
            }`}
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
        <div className="md:hidden border-t border-white/15 bg-[#8D4624] px-6 py-6 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-white hover:text-[#FAF4EE] py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
              <a
                href="#login"
                className="w-full text-center py-2.5 text-sm font-medium text-[#8D4624] bg-white rounded-full shadow-sm hover:bg-[#FAF4EE]"
              >
                Log In
              </a>
              <a
                href="#contact"
                className="w-full text-center py-2.5 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white/10"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}