import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/authContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Profile = () => {
  const { userRole, currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          const data = userDoc.data();
          
          const completeData = {
            ...data,
            address: data?.address || {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            socialMedia: data?.socialMedia || {
              linkedIn: '',
              twitter: '',
              facebook: '',
              instagram: '',
              youtube: '',
              github: '',
              website: ''
            }
          };
          setProfileData(completeData);
          setOriginalData(completeData);
        } catch (error) {
          console.error('Error fetching profile:', error);
          const defaultData = {
            userId: currentUser.uid,
            firstName: '',
            lastName: '',
            email: currentUser?.email || '',
            role: userRole || 'entrepreneur',
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
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [currentUser, userRole]);

  const handleProfileUpdate = async () => {
    if (!currentUser || !profileData) return;
    
    try {
      setSaving(true);
      
      const dataToSave = {
        ...profileData,
        email: currentUser.email,
        role: profileData.role || userRole || 'entrepreneur',
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', currentUser.uid), dataToSave, { merge: true });
      
      setOriginalData(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />;
    if (userRole === 'investor') return <InvestorSidebar />;
    return <EntrepreneurSidebar />;
  };

  const initials = `${profileData?.firstName?.[0] || ''}${profileData?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <DashboardLayout sidebar={getSidebar()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information, expertise, and preferences</p>
      </motion.div>

      <Card>
        <CardContent className="p-6 md:p-8">
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header with Avatar & Edit Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-2 border-[#8d4624]/20 shadow-xs">
                    <AvatarImage src={profileData?.profilePhoto} alt={profileData?.firstName} />
                    <AvatarFallback className="bg-[#8d4624] text-white text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData?.firstName || 'User'} {profileData?.lastName || ''}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="capitalize bg-[#f5e9dd] text-[#8d4624] hover:bg-[#ebdccc]">
                        {userRole || 'Member'}
                      </Badge>
                      {profileData?.primaryIndustry && (
                        <Badge variant="outline">{profileData.primaryIndustry}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    onClick={handleStartEdit}
                    className="bg-[#8d4624] hover:bg-[#72371c] text-white w-fit"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={profileData?.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={profileData?.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be modified</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone / WhatsApp</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      value={profileData?.alternatePhone || ''}
                      onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+91-9876543211"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePhoto">Profile Photo URL</Label>
                    <Input
                      id="profilePhoto"
                      type="url"
                      value={profileData?.profilePhoto || ''}
                      onChange={(e) => handleInputChange('profilePhoto', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      value={profileData?.address?.street || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, street: e.target.value })}
                      disabled={!isEditing}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={profileData?.address?.city || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, city: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      type="text"
                      value={profileData?.address?.state || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, state: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={profileData?.address?.postalCode || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, postalCode: e.target.value })}
                      disabled={!isEditing}
                      placeholder="400001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      value={profileData?.address?.country || ''}
                      onChange={(e) => handleInputChange('address', { ...profileData?.address, country: e.target.value })}
                      disabled={!isEditing}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social Media & Links</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      type="url"
                      value={profileData?.socialMedia?.linkedIn || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, linkedIn: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={profileData?.socialMedia?.twitter || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, twitter: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={profileData?.socialMedia?.facebook || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, facebook: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="text"
                      value={profileData?.socialMedia?.instagram || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, instagram: e.target.value })}
                      disabled={!isEditing}
                      placeholder="@yourhandle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={profileData?.socialMedia?.youtube || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, youtube: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Personal Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData?.socialMedia?.website || ''}
                      onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, website: e.target.value })}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {userRole === 'entrepreneur' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="primaryIndustry">Primary Industry</Label>
                        <select
                          id="primaryIndustry"
                          value={profileData?.primaryIndustry || ''}
                          onChange={(e) => handleInputChange('primaryIndustry', e.target.value)}
                          disabled={!isEditing}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="">Select industry</option>
                          {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessStage">Business Stage</Label>
                        <select
                          id="businessStage"
                          value={profileData?.businessStage || ''}
                          onChange={(e) => handleInputChange('businessStage', e.target.value)}
                          disabled={!isEditing}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input
                          id="education"
                          type="text"
                          value={profileData?.education || ''}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., MBA from IIM Ahmedabad, B.Tech from IIT Mumbai"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="experience">Work Experience</Label>
                        <Textarea
                          id="experience"
                          value={profileData?.experience || ''}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          rows={3}
                          disabled={!isEditing}
                          placeholder="Brief summary of your work experience"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {userRole === 'mentor' && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Mentorship Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mentorType">Mentor Type *</Label>
                        <select
                          id="mentorType"
                          value={profileData?.mentorType || 'personal'}
                          onChange={(e) => handleInputChange('mentorType', e.target.value)}
                          disabled={!isEditing}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="">Select mentor type</option>
                          <option value="personal">Personal (1-on-1)</option>
                          <option value="group">Group Sessions</option>
                          <option value="both">Both Personal & Group</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mentorSector">Primary Sector *</Label>
                        <select
                          id="mentorSector"
                          value={profileData?.sector || ''}
                          onChange={(e) => handleInputChange('sector', e.target.value)}
                          disabled={!isEditing}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                        <div className="space-y-2">
                          <Label htmlFor="personalPrice">Personal Session Price (₹/hour) *</Label>
                          <Input
                            id="personalPrice"
                            type="number"
                            value={profileData?.personalSessionPrice || ''}
                            onChange={(e) => handleInputChange('personalSessionPrice', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing}
                            placeholder="e.g., 1500"
                            min="0"
                          />
                        </div>
                      )}

                      {(profileData?.mentorType === 'group' || profileData?.mentorType === 'both') && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="groupPrice">Group Session Price (₹/hour) *</Label>
                            <Input
                              id="groupPrice"
                              type="number"
                              value={profileData?.groupSessionPrice || ''}
                              onChange={(e) => handleInputChange('groupSessionPrice', parseFloat(e.target.value) || 0)}
                              disabled={!isEditing}
                              placeholder="e.g., 500"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="groupCapacity">Group Session Capacity</Label>
                            <Input
                              id="groupCapacity"
                              type="number"
                              value={profileData?.groupSessionCapacity || ''}
                              onChange={(e) => handleInputChange('groupSessionCapacity', parseInt(e.target.value) || 5)}
                              disabled={!isEditing}
                              placeholder="e.g., 10"
                              min="2"
                              max="50"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label htmlFor="expLevel">Experience Level *</Label>
                      <select
                        id="expLevel"
                        value={profileData?.experienceLevel || ''}
                        onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                        <option value="">Select experience level</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mCity">City *</Label>
                        <Input
                          id="mCity"
                          type="text"
                          value={profileData?.location?.city || ''}
                          onChange={(e) => handleInputChange('location', { ...profileData?.location, city: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mState">State *</Label>
                        <Input
                          id="mState"
                          type="text"
                          value={profileData?.location?.state || ''}
                          onChange={(e) => handleInputChange('location', { ...profileData?.location, state: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Maharashtra"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mCountry">Country</Label>
                        <Input
                          id="mCountry"
                          type="text"
                          value={profileData?.location?.country || 'India'}
                          onChange={(e) => handleInputChange('location', { ...profileData?.location, country: e.target.value })}
                          disabled={!isEditing}
                          placeholder="India"
                        />
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                      <Label>Languages Spoken *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        {indianLanguages.map(lang => {
                          const isChecked = profileData?.languages?.includes(lang) || false;
                          return (
                            <div key={lang} className="flex items-center space-x-2">
                              <Checkbox
                                id={`lang-${lang}`}
                                checked={isChecked}
                                disabled={!isEditing}
                                onCheckedChange={(checked) => {
                                  const currentLangs = profileData?.languages || [];
                                  if (checked) {
                                    handleInputChange('languages', [...currentLangs, lang]);
                                  } else {
                                    handleInputChange('languages', currentLangs.filter(l => l !== lang));
                                  }
                                }}
                              />
                              <Label htmlFor={`lang-${lang}`} className="text-sm font-normal cursor-pointer">
                                {lang}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Availability Days */}
                    <div className="space-y-2">
                      <Label>Available Days *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                        {availableDaysOptions.map(day => {
                          const isChecked = profileData?.availableDays?.includes(day) || false;
                          return (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day}`}
                                checked={isChecked}
                                disabled={!isEditing}
                                onCheckedChange={(checked) => {
                                  const currentDays = profileData?.availableDays || [];
                                  if (checked) {
                                    handleInputChange('availableDays', [...currentDays, day]);
                                  } else {
                                    handleInputChange('availableDays', currentDays.filter(d => d !== day));
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${day}`} className="text-sm font-normal cursor-pointer">
                                {day}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      <Label>Preferred Time Slots *</Label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {timeSlotOptions.map(slot => {
                          const isChecked = profileData?.availableTimeSlots?.includes(slot) || false;
                          return (
                            <div key={slot} className="flex items-center space-x-2">
                              <Checkbox
                                id={`slot-${slot}`}
                                checked={isChecked}
                                disabled={!isEditing}
                                onCheckedChange={(checked) => {
                                  const currentSlots = profileData?.availableTimeSlots || [];
                                  if (checked) {
                                    handleInputChange('availableTimeSlots', [...currentSlots, slot]);
                                  } else {
                                    handleInputChange('availableTimeSlots', currentSlots.filter(s => s !== slot));
                                  }
                                }}
                              />
                              <Label htmlFor={`slot-${slot}`} className="text-sm font-normal cursor-pointer">
                                {slot}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="space-y-2">
                      <Label htmlFor="responseTime">Typical Response Time *</Label>
                      <select
                        id="responseTime"
                        value={profileData?.responseTime || 'Within 24 hours'}
                        onChange={(e) => handleInputChange('responseTime', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      >
                        {responseTimeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    {/* Expertise Areas */}
                    <div className="space-y-2">
                      <Label htmlFor="expertiseAreas">Areas of Expertise *</Label>
                      <Textarea
                        id="expertiseAreas"
                        value={Array.isArray(profileData?.expertiseAreas) 
                          ? profileData.expertiseAreas.join(', ') 
                          : profileData?.expertiseAreas || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange('expertiseAreas', value.split(',').map(s => s.trim()).filter(Boolean));
                        }}
                        rows={3}
                        disabled={!isEditing}
                        placeholder="e.g., Business Strategy, Marketing, Product Development (comma-separated)"
                      />
                      <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <Label htmlFor="mEdu">Education</Label>
                      <Input
                        id="mEdu"
                        type="text"
                        value={profileData?.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        disabled={!isEditing}
                        placeholder="e.g., MBA from IIM Ahmedabad, B.Tech from IIT Mumbai"
                      />
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Textarea
                        id="certifications"
                        value={Array.isArray(profileData?.certifications) 
                          ? profileData.certifications.join(', ') 
                          : profileData?.certifications || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange('certifications', value.split(',').map(s => s.trim()).filter(Boolean));
                        }}
                        rows={2}
                        disabled={!isEditing}
                        placeholder="e.g., Certified Business Coach, PMP (comma-separated)"
                      />
                      <p className="text-xs text-muted-foreground">Separate multiple certifications with commas</p>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="mComp">Company / Organization (Optional)</Label>
                      <Input
                        id="mComp"
                        type="text"
                        value={profileData?.companyName || ''}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Current or previous company"
                      />
                    </div>

                    {/* Bio/About */}
                    <div className="space-y-2">
                      <Label htmlFor="mBio">About / Bio</Label>
                      <Textarea
                        id="mBio"
                        value={profileData?.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        disabled={!isEditing}
                        placeholder="Tell entrepreneurs about your background, experience, and mentorship philosophy..."
                      />
                    </div>
                  </div>
                </>
              )}

              {userRole === 'investor' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Investor Profile</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invFocus">Investment Focus</Label>
                        <Textarea
                          id="invFocus"
                          value={profileData?.investmentFocus || ''}
                          onChange={(e) => handleInputChange('investmentFocus', e.target.value)}
                          rows={4}
                          disabled={!isEditing}
                          placeholder="e.g., Early-stage tech startups, Healthcare innovation, Sustainable commerce"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invPortfolio">Portfolio Size</Label>
                        <select
                          id="invPortfolio"
                          value={profileData?.portfolioSize || ''}
                          onChange={(e) => handleInputChange('portfolioSize', e.target.value)}
                          disabled={!isEditing}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          <option value="">Select portfolio size</option>
                          <option value="0-5">0-5 investments</option>
                          <option value="6-10">6-10 investments</option>
                          <option value="11-20">11-20 investments</option>
                          <option value="20+">20+ investments</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons for Edit Mode */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border/70">
                  <Button 
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-[#8d4624] hover:bg-[#72371c] text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Profile;
