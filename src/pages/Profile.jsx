import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const Profile = () => {
  const { userRole, currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Food & Beverage', 
    'Fashion', 'Finance', 'Manufacturing', 'Services', 'Other'
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          } else {
            const displayName = currentUser.displayName || '';
            const [firstName = '', lastName = ''] = displayName.split(' ');
            setProfileData({
              firstName,
              lastName,
              email: currentUser.email,
              role: userRole,
              sector: '',
              bio: ''
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [currentUser, userRole]);

  const handleProfileUpdate = async () => {
    if (!currentUser || !profileData) return;
    
    setMessage('');
    
    try {
      setSaving(true);
      
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        email: currentUser.email,
        role: userRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />;
    if (userRole === 'investor') return <InvestorSidebar />;
    return <EntrepreneurSidebar />;
  };

  return (
    <>
      <DashboardLayout sidebar={getSidebar()}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
              <p className="mt-4 text-gray-500">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                  {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData?.firstName} {profileData?.lastName}
                  </h2>
                  <p className="text-gray-600 capitalize">{userRole}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profileData?.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profileData?.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Sector
                </label>
                <select
                  value={profileData?.sector || ''}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">Select your sector</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Role-Specific Fields */}
              {userRole === 'entrepreneur' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    value={profileData?.startupName || ''}
                    onChange={(e) => handleInputChange('startupName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Your startup name"
                  />
                </div>
              )}

              {userRole === 'mentor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileData?.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Current or previous company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profileData?.yearsOfExperience || ''}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Years of experience"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas of Expertise
                    </label>
                    <textarea
                      value={profileData?.expertise || ''}
                      onChange={(e) => handleInputChange('expertise', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="e.g., Product Development, Team Building, Fundraising"
                    />
                  </div>
                </>
              )}

              {userRole === 'investor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Focus
                    </label>
                    <textarea
                      value={profileData?.investmentFocus || ''}
                      onChange={(e) => handleInputChange('investmentFocus', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="e.g., Early-stage tech startups, Healthcare innovation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Size
                    </label>
                    <select
                      value={profileData?.portfolioSize || ''}
                      onChange={(e) => handleInputChange('portfolioSize', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="">Select portfolio size</option>
                      <option value="0-5">0-5 investments</option>
                      <option value="6-10">6-10 investments</option>
                      <option value="11-20">11-20 investments</option>
                      <option value="20+">20+ investments</option>
                    </select>
                  </div>
                </>
              )}

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData?.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={5}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData?.bio?.length || 0} / 500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </DashboardLayout>

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="profile-toast"
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-[60] w-full max-w-sm"
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
};

export default Profile;