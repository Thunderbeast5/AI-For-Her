// src/components/SideDrawer.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SideDrawer = ({ isOpen, onClose, children, title }) => {
  // Define variants for Framer Motion to control the slide-in/out animation
  const drawerVariants = {
    hidden: { x: '100%' }, 
    visible: { x: 0 }, 
  };

  // Close the drawer when the Escape key is pressed
  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isOpen, onClose]);


  return (
    <AnimatePresence>
      {isOpen && (
        // 1. Full-screen fixed container (the overlay/backdrop)
        <div className="fixed inset-0 z-[100] overflow-hidden"> 
          {/* 2. Backdrop (fades in) */}
          <motion.div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // Allows closing by clicking outside
          />

          {/* 3. The Drawer panel (slides from right) */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              {/* Content from the parent component */}
              <div className="mt-4">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;