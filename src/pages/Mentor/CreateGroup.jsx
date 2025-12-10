import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import mentorGroupsApi from '../../api/mentorGroups';
import DashboardLayout from '../../components/DashboardLayout';
import MentorSidebar from '../../components/MentorSidebar';

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export default function CreateGroup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    sector: 'Technology',
    language: 'English',
    maxParticipants: 50,
    topics: '',
    rules: '',
    groupImage: ''
  });
  const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  const sectors = [
    'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
    'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
    'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
    'Education & Training', 'Technology', 'Finance', 'Other'
  ];

  const languages = [
    'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 
    'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.groupName.trim()) {
      setMessage('Please enter a group name');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!formData.description.trim()) {
      setMessage('Please enter a group description');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const topicsArray = formData.topics.split(',').map(t => t.trim()).filter(t => t);
      const rulesArray = formData.rules.split('\n').map(r => r.trim()).filter(r => r);

      const groupData = {
        mentorId: currentUser.uid,
        mentorName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email,
        groupName: formData.groupName,
        description: formData.description,
        sector: formData.sector,
        language: formData.language,
        maxParticipants: parseInt(formData.maxParticipants),
        topics: topicsArray,
        rules: rulesArray,
        groupImage: formData.groupImage || '',
        schedule: {
          day: 'Monday',
          time: '00:00',
          duration: 60,
          frequency: 'Weekly'
        },
        price: 0, // Free like Telegram
        startDate: new Date(),
        status: 'active'
      };

      await mentorGroupsApi.create(groupData);
      setMessage('Group created successfully! Entrepreneurs can now join.');
      setTimeout(() => setMessage(''), 3000);
      navigate('/mentor/my-groups');
    } catch (error) {
      console.error('Error creating group:', error);
      setMessage('Failed to create group: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardLayout sidebar={<MentorSidebar />}>
      <div className=" max-w-4xl ">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Group</h1>
          <p className="text-gray-600">Create a free Telegram-style group for entrepreneurs to join</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white mx-auto rounded-lg shadow-md p-8 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              placeholder="e.g., Women Tech Entrepreneurs Community"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your group is about, what members can learn, and who should join..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              required
            />
          </div>

          {/* Sector and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Participants
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="10"
              max="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 50-200 for active discussions</p>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics (comma-separated)
            </label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              placeholder="e.g., Startup Funding, Marketing, Product Development"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Group Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Rules (one per line)
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="Be respectful to all members&#10;No spam or promotional content&#10;Stay on topic&#10;Help and support each other"
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          {/* Group Image URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Image URL (Optional)
            </label>
            <input
              type="url"
              name="groupImage"
              value={formData.groupImage}
              onChange={handleChange}
              placeholder="https://example.com/group-image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Info Banner */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">📱 Telegram-Style Group</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your group will be <strong>FREE</strong> for all entrepreneurs</li>
                  <li>Members can join instantly without approval</li>
                  <li>Everyone can send messages and participate</li>
                  <li>You can manage the group and remove members if needed</li>
                </ul>
              </div>
            </div>
          </div> */}

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/mentor/my-groups')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium ${primaryButtonClass}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>

    {/* Toast Notification */}
    <AnimatePresence>
      {message && (
        <motion.div
          key="create-group-toast"
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-60 w-full max-w-sm"
        >
          <div className={`p-4 rounded-lg shadow-lg text-sm font-medium ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
