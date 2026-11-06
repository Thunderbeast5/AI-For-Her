import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/authContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Settings = () => {
  const { userRole, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    
    try {
      setSaving(true);
      
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        email: currentUser.email,
        role: userRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
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
    <DashboardLayout sidebar={getSidebar()}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100/80 p-1 rounded-xl h-auto flex flex-wrap gap-1 sm:w-fit">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <UserCircleIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <BellIcon className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <LockClosedIcon className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs">
            <GlobeAltIcon className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and public details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={profileData?.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={profileData?.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed directly</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <select
                      id="sector"
                      value={profileData?.sector || ''}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                      <option value="">Select your sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  {userRole === 'entrepreneur' && (
                    <div className="space-y-2">
                      <Label htmlFor="startupName">Startup Name</Label>
                      <Input
                        id="startupName"
                        type="text"
                        value={profileData?.startupName || ''}
                        onChange={(e) => handleInputChange('startupName', e.target.value)}
                        placeholder="Your startup name"
                      />
                    </div>
                  )}

                  {userRole === 'mentor' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          type="text"
                          value={profileData?.companyName || ''}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Current or previous company"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          value={profileData?.yearsOfExperience || ''}
                          onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                          placeholder="Years of experience"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expertise">Areas of Expertise</Label>
                        <Textarea
                          id="expertise"
                          value={profileData?.expertise || ''}
                          onChange={(e) => handleInputChange('expertise', e.target.value)}
                          rows={4}
                          placeholder="e.g., Product Development, Team Building, Fundraising"
                        />
                      </div>
                    </>
                  )}

                  {userRole === 'investor' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="investmentFocus">Investment Focus</Label>
                        <Textarea
                          id="investmentFocus"
                          value={profileData?.investmentFocus || ''}
                          onChange={(e) => handleInputChange('investmentFocus', e.target.value)}
                          rows={4}
                          placeholder="e.g., Early-stage tech startups, Healthcare innovation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolioSize">Portfolio Size</Label>
                        <select
                          id="portfolioSize"
                          value={profileData?.portfolioSize || ''}
                          onChange={(e) => handleInputChange('portfolioSize', e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={saving}
                    className="bg-[#8d4624] hover:bg-[#72371c] text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you would like to receive updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'email-notif', label: 'Email notifications', description: 'Receive email updates about your activity' },
                  { id: 'push-notif', label: 'Push notifications', description: 'Receive push notifications on your device' },
                  { id: 'sms-notif', label: 'SMS notifications', description: 'Receive text messages for important updates' },
                  { id: 'digest-notif', label: 'Weekly digest', description: 'Get a weekly summary of your activity' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border/50">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id} className="text-base font-medium cursor-pointer">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch id={item.id} defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Update your credentials and account password</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>
                <Button 
                  onClick={() => toast.success('Password update request sent')}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
              <CardDescription>Customize language, time zone and display settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="prefLang">Language</Label>
                  <select 
                    id="prefLang"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefTz">Timezone</Label>
                  <select 
                    id="prefTz"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  >
                    <option>IST (UTC+5:30)</option>
                    <option>PST (UTC-8)</option>
                    <option>EST (UTC-5)</option>
                  </select>
                </div>
                <Button 
                  onClick={() => toast.success('Preferences saved successfully')}
                  className="bg-[#8d4624] hover:bg-[#72371c] text-white"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
