import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

import darkLogo from '../assets/logos/brown.png';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'entrepreneur',
      title: "I'm an Entrepreneur",
      description: 'Build your startup & connect with mentors and investors',
      icon: BriefcaseIcon
    },
    {
      id: 'mentor',
      title: "I'm a Mentor",
      description: 'Guide entrepreneurs & share your industry expertise',
      icon: UserGroupIcon
    },
    {
      id: 'investor',
      title: "I'm an Investor",
      description: 'Discover opportunities & invest in promising ventures',
      icon: CurrencyDollarIcon
    }
  ];

  const handleRoleSelect = (roleId) => {
    navigate('/signup', { state: { role: roleId } });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FCFAF8] overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#8D4624] blur-[150px] rounded-full pointer-events-none opacity-5"></div>
      <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-[#C87A54] blur-[150px] rounded-full pointer-events-none opacity-5"></div>

      {/* Left Column - Brand Showcase & Platform Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white border-r border-[#8D4624]/10 flex-col justify-between p-16 z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8D4624] blur-[120px] rounded-full pointer-events-none opacity-10"></div>

        {/* Top bar: Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#8D4624]/20 text-[#8D4624] shadow-sm hover:bg-[#8D4624] hover:text-white transition-all duration-200 hover:-translate-x-1"
            title="Go Back"
          >
            <FiArrowLeft className="text-xl" />
          </button>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg my-auto">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3.5 mb-8 cursor-pointer group w-fit"
          >
            <img
              src={darkLogo}
              alt="saharohi logo"
              className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-manrope font-semibold text-3xl tracking-wide lowercase text-black">
              saharohi
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-normal italic font-playfair text-[#8D4624] drop-shadow-sm mb-5 tracking-tight leading-tight">
            Begin Your Enterprise Journey.
          </h1>

          <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-8 shadow-sm w-20"></div>

          <div className="space-y-4 text-[#4A3228] text-base xl:text-lg font-medium opacity-90 leading-relaxed">
            <p>
              Select your role to unlock customized tools, targeted AI coaching, and direct access to an interconnected network of women leaders.
            </p>
            <p className="text-sm opacity-75">
              Whether you are pitching your first venture, mentoring high-potential founders, or investing in innovation, Saharohi shapes the experience around you.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#4A3228]/60">
          © 2026 saharohi. All rights reserved.
        </div>
      </div>

      {/* Right Column - Role Cards */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-6 sm:px-12 md:px-16 lg:px-20 py-16 z-10 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="lg:hidden absolute top-6 left-6 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#8D4624]/20 text-[#8D4624] shadow-sm hover:bg-[#8D4624] hover:text-white transition-all"
          title="Go Back"
        >
          <FiArrowLeft className="text-xl" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-xl"
        >
          {/* Mobile Logo View */}
          <div
            className="lg:hidden flex items-center justify-center gap-2.5 mb-8 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={darkLogo} alt="saharohi logo" className="h-12 w-auto object-contain" />
            <span className="font-manrope font-semibold text-2xl tracking-wide lowercase text-black">
              saharohi
            </span>
          </div>

          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-normal italic font-playfair text-[#8D4624] mb-2 tracking-tight">
              Choose Your Role
            </h2>
            <div className="h-1 bg-gradient-to-r from-[#8D4624] to-[#C87A54] rounded-full mb-4 w-12 sm:mx-0 mx-auto"></div>
            <p className="text-[#4A3228] opacity-80 text-sm font-medium">
              Select how you would like to participate in the ecosystem.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => handleRoleSelect(role.id)}
                className="cursor-pointer group"
              >
                <div className="bg-white border border-[#8D4624]/15 rounded-3xl p-6 shadow-sm hover:border-[#8D4624] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#FCFAF8] border border-[#8D4624]/15 flex items-center justify-center shrink-0 text-[#8D4624] group-hover:bg-[#8D4624] group-hover:text-white transition-all duration-200">
                    <role.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#8D4624] mb-1">
                      {role.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3228] opacity-85 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#8D4624]/10 text-center">
            <p className="text-[#4A3228] opacity-80 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#8D4624] hover:text-[#73371b] font-bold underline transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;