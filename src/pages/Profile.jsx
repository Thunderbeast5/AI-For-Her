import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { usersApi } from '../api';

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const Profile = () => {
  const { userRole, currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const sectors = [
    'Food Processing', 'Handicrafts', 'Beauty & Personal Care', 
    'Tailoring & Garments', 'Health & Wellness', 'Home Decor',
    'Agriculture & Farming', 'Catering & Food Services', 'Retail & E-commerce',
    'Education & Training', 'Technology', 'Finance', 'Other'
  ];

  const indianLanguages = [
    'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 
    'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Other'
  ];

  const mentorTypes = ['personal', 'group', 'both'];
  
  const experienceLevels = [
    'Beginner (0-2 years)', 
    'Intermediate (3-5 years)', 
    'Expert (6-10 years)', 
    'Master (10+ years)'
  ];

  const responseTimeOptions = [
    'Within 24 hours', 
    'Within 48 hours', 
    'Within a week'
  ];

  const availableDaysOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlotOptions = ['Morning', 'Afternoon', 'Evening'];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser && userRole) {
        try {
          const userId = localStorage.getItem('userId');
          
          // Fetch from MongoDB via API
          const data = await usersApi.getUser(userId, userRole);
          
          console.log('Profile data loaded from MongoDB:', data);
          
          // Ensure nested objects exist
          const completeData = {
            ...data,
            address: data.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            socialMedia: data.socialMedia || {
              linkedIn: '',
              twitter: '',
              facebook: '',
              instagram: '',
              youtube: '',
              github: '',
              website: ''
            }
          };
          
          console.log('Complete profile data:', completeData);
          setProfileData(completeData);
          setOriginalData(completeData);
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Create default profile data
          const userId = localStorage.getItem('userId');
          const defaultData = {
            userId,
            firstName: '',
            lastName: '',
            email: currentUser?.email || '',
            role: userRole,
            phone: '',
            alternatePhone: '',
            profilePhoto: '',
            address: {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            bio: '',
            socialMedia: {
              linkedIn: '',
              twitter: '',
              facebook: '',
              instagram: '',
              youtube: '',
              github: '',
              website: ''
            }
          };
          setProfileData(defaultData);
          setOriginalData(defaultData);
        } finally {
          setLoading(false);
        }
      } else {
        // No user or role yet, stop loading
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [currentUser, userRole]);

  const handleProfileUpdate = async () => {
    if (!currentUser || !profileData) return;
    
    setMessage('');
    
    try {
      setSaving(true);
      
      const userId = localStorage.getItem('userId');
      
      const dataToSave = {
        ...profileData,
        email: currentUser.email,
        role: userRole,
        updatedAt: new Date()
      };
      
      console.log('Saving profile data to MongoDB:', dataToSave);
      console.log('User ID:', userId, 'Role:', userRole);
      
      await usersApi.saveUser(userId, dataToSave, userRole);
      
      console.log('Profile data saved successfully');
      setOriginalData(profileData); // Update original data after successful save
      setIsEditing(false); // Exit edit mode
      setMessage('Profile updated successfully! ✅');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again. ❌');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalData); // Restore original data
    setIsEditing(false);
    setMessage('');
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    console.log(`Updating field: ${field} with value:`, value);
    setProfileData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('Updated profileData:', updated);
      return updated;
    });
  };

  const getInputClassName = (isEditable = true) => {
    const baseClass = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400";
    if (!isEditable || !isEditing) {
      return `${baseClass} bg-gray-100 cursor-not-allowed text-gray-700`;
    }
    return `${baseClass} bg-gray-50`;
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
              {/* Profile Header with Edit Button */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
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
                {!isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="px-6 py-2 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
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
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                      isEditing ? 'bg-gray-50' : 'bg-gray-100 cursor-not-allowed'
                    }`}
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
                    disabled={!isEditing} className={getInputClassName()}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing} className={getInputClassName()}
                    placeholder="+91-9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={profileData?.alternatePhone || ''}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    disabled={!isEditing} className={getInputClassName()}
                    placeholder="+91-9876543211"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={profileData?.profilePhoto || ''}
                    onChange={(e) => handleInputChange('profilePhoto', e.target.value)}
                    disabled={!isEditing} className={getInputClassName()}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={profileData?.address?.street || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, street: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileData?.address?.city || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, city: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={profileData?.address?.state || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, state: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={profileData?.address?.postalCode || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, postalCode: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="400001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profileData?.address?.country || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, country: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social Media & Links</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={profileData?.socialMedia?.linkedIn || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, linkedIn: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      value={profileData?.socialMedia?.twitter || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, twitter: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={profileData?.socialMedia?.facebook || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, facebook: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={profileData?.socialMedia?.instagram || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, instagram: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={profileData?.socialMedia?.youtube || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, youtube: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Website
                    </label>
                    <input
                      type="url"
                      value={profileData?.socialMedia?.website || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, website: e.target.value })}
                      disabled={!isEditing} className={getInputClassName()}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {userRole === 'entrepreneur' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Industry
                      </label>
                      <select
                        value={profileData?.primaryIndustry || ''}
                        onChange={(e) => handleInputChange('primaryIndustry', e.target.value)}
                        disabled={!isEditing} className={getInputClassName()}
                      >
                        <option value="">Select industry</option>
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Stage
                      </label>
                      <select
                        value={profileData?.businessStage || ''}
                        onChange={(e) => handleInputChange('businessStage', e.target.value)}
                        disabled={!isEditing} className={getInputClassName()}
                      >
                        <option value="">Select stage</option>
                        <option value="idea">Idea</option>
                        <option value="prototype">Prototype</option>
                        <option value="mvp">MVP</option>
                        <option value="revenue">Revenue</option>
                        <option value="growth">Growth</option>
                        <option value="scaling">Scaling</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education
                      </label>
                      <input
                        type="text"
                        value={profileData?.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        disabled={!isEditing} className={getInputClassName()}
                        placeholder="e.g., MBA from IIM Ahmedabad, B.Tech from IIT Mumbai"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Experience
                      </label>
                      <textarea
                        value={profileData?.experience || ''}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        rows={3}
                        disabled={!isEditing} className={getInputClassName()}
                        placeholder="Brief summary of your work experience"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userRole === 'mentor' && (
                <div className="space-y-6">
                  {/* Mentor Type & Sector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mentor Type *
                      </label>
                      <select
                        value={profileData?.mentorType || 'personal'}
                        onChange={(e) => handleInputChange('mentorType', e.target.value)}
                        disabled={!isEditing}
                        className={getInputClassName()}
                      >
                        <option value="">Select mentor type</option>
                        <option value="personal">Personal (1-on-1)</option>
                        <option value="group">Group Sessions</option>
                        <option value="both">Both Personal & Group</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Sector *
                      </label>
                      <select
                        value={profileData?.sector || ''}
                        onChange={(e) => handleInputChange('sector', e.target.value)}
                        disabled={!isEditing}
                        className={getInputClassName()}
                      >
                        <option value="">Select sector</option>
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(profileData?.mentorType === 'personal' || profileData?.mentorType === 'both') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personal Session Price (₹/hour) *
                        </label>
                        <input
                          type="number"
                          value={profileData?.personalSessionPrice || ''}
                          onChange={(e) => handleInputChange('personalSessionPrice', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className={getInputClassName()}
                          placeholder="e.g., 1500"
                          min="0"
                        />
                      </div>
                    )}

                    {(profileData?.mentorType === 'group' || profileData?.mentorType === 'both') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Session Price (₹/hour) *
                          </label>
                          <input
                            type="number"
                            value={profileData?.groupSessionPrice || ''}
                            onChange={(e) => handleInputChange('groupSessionPrice', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing}
                            className={getInputClassName()}
                            placeholder="e.g., 500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Session Capacity
                          </label>
                          <input
                            type="number"
                            value={profileData?.groupSessionCapacity || ''}
                            onChange={(e) => handleInputChange('groupSessionCapacity', parseInt(e.target.value) || 5)}
                            disabled={!isEditing}
                            className={getInputClassName()}
                            placeholder="e.g., 10"
                            min="2"
                            max="50"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      value={profileData?.experienceLevel || ''}
                      onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                      disabled={!isEditing}
                      className={getInputClassName()}
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={profileData?.location?.city || ''}
                        onChange={(e) => handleInputChange('location', { ...profileData?.location, city: e.target.value })}
                        disabled={!isEditing}
                        className={getInputClassName()}
                        placeholder="e.g., Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={profileData?.location?.state || ''}
                        onChange={(e) => handleInputChange('location', { ...profileData?.location, state: e.target.value })}
                        disabled={!isEditing}
                        className={getInputClassName()}
                        placeholder="e.g., Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profileData?.location?.country || 'India'}
                        onChange={(e) => handleInputChange('location', { ...profileData?.location, country: e.target.value })}
                        disabled={!isEditing}
                        className={getInputClassName()}
                        placeholder="India"
                      />
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages Spoken *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {indianLanguages.map(lang => (
                        <label key={lang} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profileData?.languages?.includes(lang) || false}
                            onChange={(e) => {
                              const currentLangs = profileData?.languages || [];
                              if (e.target.checked) {
                                handleInputChange('languages', [...currentLangs, lang]);
                              } else {
                                handleInputChange('languages', currentLangs.filter(l => l !== lang));
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded text-pink-500 focus:ring-pink-400"
                          />
                          <span className="text-sm text-gray-700">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Days *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableDaysOptions.map(day => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profileData?.availableDays?.includes(day) || false}
                            onChange={(e) => {
                              const currentDays = profileData?.availableDays || [];
                              if (e.target.checked) {
                                handleInputChange('availableDays', [...currentDays, day]);
                              } else {
                                handleInputChange('availableDays', currentDays.filter(d => d !== day));
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded text-pink-500 focus:ring-pink-400"
                          />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time Slots *
                    </label>
                    <div className="flex gap-4">
                      {timeSlotOptions.map(slot => (
                        <label key={slot} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profileData?.availableTimeSlots?.includes(slot) || false}
                            onChange={(e) => {
                              const currentSlots = profileData?.availableTimeSlots || [];
                              if (e.target.checked) {
                                handleInputChange('availableTimeSlots', [...currentSlots, slot]);
                              } else {
                                handleInputChange('availableTimeSlots', currentSlots.filter(s => s !== slot));
                              }
                            }}
                            disabled={!isEditing}
                            className="rounded text-pink-500 focus:ring-pink-400"
                          />
                          <span className="text-sm text-gray-700">{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Response Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typical Response Time *
                    </label>
                    <select
                      value={profileData?.responseTime || 'Within 24 hours'}
                      onChange={(e) => handleInputChange('responseTime', e.target.value)}
                      disabled={!isEditing}
                      className={getInputClassName()}
                    >
                      {responseTimeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expertise Areas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas of Expertise *
                    </label>
                    <textarea
                      value={Array.isArray(profileData?.expertiseAreas) 
                        ? profileData.expertiseAreas.join(', ') 
                        : profileData?.expertiseAreas || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('expertiseAreas', value.split(',').map(s => s.trim()).filter(Boolean));
                      }}
                      rows={3}
                      disabled={!isEditing}
                      className={getInputClassName()}
                      placeholder="e.g., Business Strategy, Marketing, Product Development (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      value={profileData?.education || ''}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      disabled={!isEditing}
                      className={getInputClassName()}
                      placeholder="e.g., MBA from IIM Ahmedabad, B.Tech from IIT Mumbai"
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    <textarea
                      value={Array.isArray(profileData?.certifications) 
                        ? profileData.certifications.join(', ') 
                        : profileData?.certifications || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('certifications', value.split(',').map(s => s.trim()).filter(Boolean));
                      }}
                      rows={2}
                      disabled={!isEditing}
                      className={getInputClassName()}
                      placeholder="e.g., Certified Business Coach, PMP (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
                  </div>

                  {/* Company Name (optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileData?.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing}
                      className={getInputClassName()}
                      placeholder="Current or previous company"
                    />
                  </div>

                  {/* Bio/About */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About / Bio
                    </label>
                    <textarea
                      value={profileData?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      disabled={!isEditing}
                      className={getInputClassName()}
                      placeholder="Tell entrepreneurs about your background, experience, and what makes you a great mentor..."
                    />
                  </div>
                </div>
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
                      disabled={!isEditing} className={getInputClassName()}
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
                      disabled={!isEditing} className={getInputClassName()}
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

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-6 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
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
              )}
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
