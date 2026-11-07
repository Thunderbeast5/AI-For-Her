import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/authContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  UserIcon, 
  MapPinIcon, 
  ShareIcon, 
  BriefcaseIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

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

  const sectionClass = "p-6 sm:p-7 rounded-2xl bg-transparent border border-[#8d4624]/20 space-y-5 transition-colors hover:border-[#8d4624]/35";
  const inputClass = "h-10 rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] focus-visible:border-[#8d4624] transition-all disabled:bg-transparent disabled:opacity-60 disabled:border-[#8d4624]/15";
  const selectClass = "w-full h-10 rounded-xl border border-[#8d4624]/25 bg-transparent px-3 text-sm text-stone-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8d4624] disabled:bg-transparent disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <DashboardLayout sidebar={getSidebar()}>
      <div className="space-y-8 pb-24">
        {loading ? (
          <div className="space-y-8">
            {/* Header / Avatar Banner Skeleton */}
            <div className="p-6 sm:p-8 rounded-3xl border border-[#8d4624]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-5">
                <Skeleton className="h-20 w-20 rounded-full bg-stone-200/70" />
                <div className="space-y-2.5">
                  <Skeleton className="h-7 w-48 sm:w-64 rounded-lg bg-stone-200/70" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-5 w-28 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-4 w-36 rounded-md bg-stone-200/50" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-xl bg-stone-200/70" />
            </div>

            {/* Basic Information Section Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#8d4624]/20 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <Skeleton className="w-8 h-8 rounded-lg bg-stone-200/70" />
                <Skeleton className="h-5 w-36 rounded-md bg-stone-200/70" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Address Information Section Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#8d4624]/20 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <Skeleton className="w-8 h-8 rounded-lg bg-stone-200/70" />
                <Skeleton className="h-5 w-40 rounded-md bg-stone-200/70" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-3 w-28 rounded-md bg-stone-200/60" />
                  <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media Links Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#8d4624]/20 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <Skeleton className="w-8 h-8 rounded-lg bg-stone-200/70" />
                <Skeleton className="h-5 w-44 rounded-md bg-stone-200/70" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-md bg-stone-200/60" />
                    <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Role Specific Section Skeleton */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#8d4624]/20 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <Skeleton className="w-8 h-8 rounded-lg bg-stone-200/70" />
                <Skeleton className="h-5 w-48 rounded-md bg-stone-200/70" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28 rounded-md bg-stone-200/60" />
                  <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28 rounded-md bg-stone-200/60" />
                  <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md bg-stone-200/60" />
                  <Skeleton className="h-10 w-full rounded-xl bg-stone-200/50" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-3 w-36 rounded-md bg-stone-200/60" />
                  <Skeleton className="h-20 w-full rounded-xl bg-stone-200/50" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header / Avatar Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-transparent border border-[#8d4624]/25">
              <div className="flex items-center space-x-5">
                <Avatar className="h-20 w-20 ring-2 ring-[#8d4624]/30 shadow-xs">
                  <AvatarImage src={profileData?.profilePhoto} alt={profileData?.firstName} />
                  <AvatarFallback className="bg-[#8d4624] text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {profileData?.firstName || 'User'} {profileData?.lastName || ''}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="capitalize bg-[#f5e9dd] text-[#8d4624] font-medium text-xs px-2.5 py-0.5 border-none">
                      {userRole || 'Member'}
                    </Badge>
                    {profileData?.primaryIndustry && (
                      <Badge variant="outline" className="border-[#8d4624]/30 text-[#8d4624] text-xs">
                        {profileData.primaryIndustry}
                      </Badge>
                    )}
                    <span className="text-xs text-stone-500 font-medium">{profileData?.email}</span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <Button
                  onClick={handleStartEdit}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl shadow-xs gap-2 px-5 font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Basic Information */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Basic Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-stone-600">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profileData?.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-stone-600">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profileData?.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-stone-600">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                  <p className="text-[11px] text-stone-400">Account primary email is read-only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePhoto" className="text-xs font-semibold text-stone-600">Profile Photo URL</Label>
                  <Input
                    id="profilePhoto"
                    type="url"
                    value={profileData?.profilePhoto || ''}
                    onChange={(e) => handleInputChange('profilePhoto', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://example.com/photo.jpg"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-stone-600">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91-9876543210"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone" className="text-xs font-semibold text-stone-600">Alternate Phone / WhatsApp</Label>
                  <Input
                    id="alternatePhone"
                    type="tel"
                    value={profileData?.alternatePhone || ''}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91-9876543211"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Location & Address</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street" className="text-xs font-semibold text-stone-600">Street Address</Label>
                  <Input
                    id="street"
                    type="text"
                    value={profileData?.address?.street || ''}
                    onChange={(e) => handleInputChange('address', { ...profileData?.address, street: e.target.value })}
                    disabled={!isEditing}
                    placeholder="123 Main Street"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold text-stone-600">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={profileData?.address?.city || ''}
                    onChange={(e) => handleInputChange('address', { ...profileData?.address, city: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Mumbai"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs font-semibold text-stone-600">State / Region</Label>
                  <Input
                    id="state"
                    type="text"
                    value={profileData?.address?.state || ''}
                    onChange={(e) => handleInputChange('address', { ...profileData?.address, state: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Maharashtra"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-xs font-semibold text-stone-600">Postal Code</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={profileData?.address?.postalCode || ''}
                    onChange={(e) => handleInputChange('address', { ...profileData?.address, postalCode: e.target.value })}
                    disabled={!isEditing}
                    placeholder="400001"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-semibold text-stone-600">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={profileData?.address?.country || 'India'}
                    onChange={(e) => handleInputChange('address', { ...profileData?.address, country: e.target.value })}
                    disabled={!isEditing}
                    placeholder="India"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className={sectionClass}>
              <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                  <ShareIcon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Social Media & Links</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="linkedIn" className="text-xs font-semibold text-stone-600">LinkedIn</Label>
                  <Input
                    id="linkedIn"
                    type="url"
                    value={profileData?.socialMedia?.linkedIn || ''}
                    onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, linkedIn: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-xs font-semibold text-stone-600">Twitter / X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={profileData?.socialMedia?.twitter || ''}
                    onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, twitter: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://twitter.com/username"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-xs font-semibold text-stone-600">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    value={profileData?.socialMedia?.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, instagram: e.target.value })}
                    disabled={!isEditing}
                    placeholder="@username"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs font-semibold text-stone-600">Personal Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData?.socialMedia?.website || ''}
                    onChange={(e) => handleInputChange('socialMedia', { ...profileData?.socialMedia, website: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Configuration */}
            {userRole === 'entrepreneur' && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <BriefcaseIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Professional Venture Profile</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="primaryIndustry" className="text-xs font-semibold text-stone-600">Primary Industry</Label>
                    <select
                      id="primaryIndustry"
                      value={profileData?.primaryIndustry || ''}
                      onChange={(e) => handleInputChange('primaryIndustry', e.target.value)}
                      disabled={!isEditing}
                      className={selectClass}
                    >
                      <option value="">Select industry</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessStage" className="text-xs font-semibold text-stone-600">Business Stage</Label>
                    <select
                      id="businessStage"
                      value={profileData?.businessStage || ''}
                      onChange={(e) => handleInputChange('businessStage', e.target.value)}
                      disabled={!isEditing}
                      className={selectClass}
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
                    <Label htmlFor="education" className="text-xs font-semibold text-stone-600">Education</Label>
                    <Input
                      id="education"
                      type="text"
                      value={profileData?.education || ''}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., B.Tech in Computer Engineering"
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="experience" className="text-xs font-semibold text-stone-600">Work Experience & Background</Label>
                    <Textarea
                      id="experience"
                      value={profileData?.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      rows={3}
                      disabled={!isEditing}
                      placeholder="Brief summary of your professional journey..."
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] disabled:bg-transparent disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            )}

            {userRole === 'mentor' && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <AcademicCapIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Mentorship Attributes & Availability</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="mentorType" className="text-xs font-semibold text-stone-600">Mentor Type *</Label>
                    <select
                      id="mentorType"
                      value={profileData?.mentorType || 'personal'}
                      onChange={(e) => handleInputChange('mentorType', e.target.value)}
                      disabled={!isEditing}
                      className={selectClass}
                    >
                      <option value="personal">Personal (1-on-1)</option>
                      <option value="group">Group Sessions</option>
                      <option value="both">Both Personal & Group</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mentorSector" className="text-xs font-semibold text-stone-600">Primary Sector *</Label>
                    <select
                      id="mentorSector"
                      value={profileData?.sector || ''}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      disabled={!isEditing}
                      className={selectClass}
                    >
                      <option value="">Select sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  {(profileData?.mentorType === 'personal' || profileData?.mentorType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="personalPrice" className="text-xs font-semibold text-stone-600">Personal Session Rate (₹/hour)</Label>
                      <Input
                        id="personalPrice"
                        type="number"
                        value={profileData?.personalSessionPrice || ''}
                        onChange={(e) => handleInputChange('personalSessionPrice', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="1500"
                        className={inputClass}
                      />
                    </div>
                  )}

                  {(profileData?.mentorType === 'group' || profileData?.mentorType === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="groupPrice" className="text-xs font-semibold text-stone-600">Group Session Rate (₹/hour)</Label>
                      <Input
                        id="groupPrice"
                        type="number"
                        value={profileData?.groupSessionPrice || ''}
                        onChange={(e) => handleInputChange('groupSessionPrice', parseFloat(e.target.value) || 0)}
                        disabled={!isEditing}
                        placeholder="500"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold text-stone-600">Languages Spoken</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {indianLanguages.map(lang => {
                      const isChecked = profileData?.languages?.includes(lang) || false;
                      return (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={isChecked}
                            disabled={!isEditing}
                            className="border-[#8d4624]/40 data-[state=checked]:bg-[#8d4624] data-[state=checked]:border-[#8d4624]"
                            onCheckedChange={(checked) => {
                              const currentLangs = profileData?.languages || [];
                              handleInputChange(
                                'languages',
                                checked ? [...currentLangs, lang] : currentLangs.filter(l => l !== lang)
                              );
                            }}
                          />
                          <Label htmlFor={`lang-${lang}`} className="text-xs font-medium text-stone-700 cursor-pointer">
                            {lang}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="mBio" className="text-xs font-semibold text-stone-600">Mentorship Philosophy & Bio</Label>
                  <Textarea
                    id="mBio"
                    value={profileData?.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    disabled={!isEditing}
                    placeholder="Share your mentoring principles, guidance method, and background..."
                    className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] disabled:bg-transparent disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {userRole === 'investor' && (
              <div className={sectionClass}>
                <div className="flex items-center gap-2.5 border-b border-[#8d4624]/15 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f5e9dd] text-[#8d4624] flex items-center justify-center">
                    <CurrencyDollarIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900">Investor Focus</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invFocus" className="text-xs font-semibold text-stone-600">Investment Focus & Thesis</Label>
                    <Textarea
                      id="invFocus"
                      value={profileData?.investmentFocus || ''}
                      onChange={(e) => handleInputChange('investmentFocus', e.target.value)}
                      rows={4}
                      disabled={!isEditing}
                      placeholder="e.g., Direct-to-consumer sustainable ventures, B2B SaaS, Early seedstage..."
                      className="rounded-xl bg-transparent border-[#8d4624]/25 focus-visible:ring-[#8d4624] disabled:bg-transparent disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invPortfolio" className="text-xs font-semibold text-stone-600">Portfolio Size</Label>
                    <select
                      id="invPortfolio"
                      value={profileData?.portfolioSize || ''}
                      onChange={(e) => handleInputChange('portfolioSize', e.target.value)}
                      disabled={!isEditing}
                      className={selectClass}
                    >
                      <option value="">Select portfolio scale</option>
                      <option value="0-5">0-5 investments</option>
                      <option value="6-10">6-10 investments</option>
                      <option value="11-20">11-20 investments</option>
                      <option value="20+">20+ investments</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar for Editing */}
            {isEditing && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-2 rounded-2xl bg-[#f5e9dd]/80 backdrop-blur-md border border-[#8d4624]/30 shadow-lg">
                <Button 
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="rounded-xl text-stone-700 hover:text-[#8d4624] hover:bg-[#8d4624]/10 text-xs px-4"
                >
                  <XMarkIcon className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white rounded-xl shadow-xs text-xs px-5 font-semibold"
                >
                  <CheckIcon className="w-4 h-4 mr-1.5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;