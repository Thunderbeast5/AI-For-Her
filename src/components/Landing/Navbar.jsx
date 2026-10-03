import React, { useEffect, useState } from 'react';
import logo from '../../assets/logos/logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Stories', href: '#stories' },
  ];

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <a href="/" className="flex items-center gap-2.5 group">
          <img 
            src={logo} 
            alt="Udyam logo" 
            className="h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
          />
          <span className="font-manrope font-semibold text-2xl tracking-tight text-neutral-900 lowercase">
            udyam
          </span>
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[15px]  text-black hover:text-[#804828] transition-colors duration-150"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary Action Button (Brown Pill) */}
          <a
            href="#login"
            className="px-5 py-2 text-sm font-medium text-white bg-[#804828] hover:bg-[#6b3a1f] active:bg-[#572e18] rounded-full shadow-sm hover:shadow transition-all duration-200"
          >
            Log In
          </a>

          {/* Secondary Action Button (Outlined / Light Pill) */}
          <a
            href="#contact"
            className="px-5 py-2 text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 rounded-full border border-neutral-200 hover:border-neutral-300 transition-all duration-200"
          >
            Contact Us
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 focus:outline-none"
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
        <div className="md:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md px-6 py-6 shadow-xl">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-neutral-800 hover:text-[#804828] py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
              <a
                href="#login"
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#804828] rounded-full shadow-sm hover:bg-[#6b3a1f]"
              >
                Log In
              </a>
              <a
                href="#contact"
                className="w-full text-center py-2.5 text-sm font-medium text-neutral-800 bg-neutral-50 rounded-full border border-neutral-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}