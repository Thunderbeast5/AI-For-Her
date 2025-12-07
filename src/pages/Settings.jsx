import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import EntrepreneurSidebar from '../components/EntrepreneurSidebar';
import MentorSidebar from '../components/MentorSidebar';
import InvestorSidebar from '../components/InvestorSidebar';
import { 
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  const getSidebar = () => {
    if (userRole === 'mentor') return <MentorSidebar />;
    if (userRole === 'investor') return <InvestorSidebar />;
    return <EntrepreneurSidebar />;
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'preferences', label: 'Preferences', icon: GlobeAltIcon }
  ];

  return (
    <DashboardLayout sidebar={getSidebar()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm h-fit"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 bg-white rounded-2xl p-6 shadow-sm"
        >
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { 
                    label: 'Email notifications', 
                    description: 'Receive email updates about your activity' 
                  },
                  { 
                    label: 'Push notifications', 
                    description: 'Receive push notifications on your device' 
                  },
                  { 
                    label: 'SMS notifications', 
                    description: 'Receive text messages for important updates' 
                  },
                  { 
                    label: 'Weekly digest', 
                    description: 'Get a weekly summary of your activity' 
                  },
                  { 
                    label: 'New message alerts', 
                    description: 'Get notified when you receive new messages' 
                  },
                  { 
                    label: 'Event reminders', 
                    description: 'Receive reminders for upcoming events and meetings' 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              {/* Change Password Section */}
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-6 border-t border-gray-200 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Enable 2FA</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-400"></div>
                  </label>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Nashik, India', date: 'Active now' },
                    { device: 'Safari on iPhone', location: 'Mumbai, India', date: '2 hours ago' }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{session.device}</p>
                        <p className="text-sm text-gray-600">{session.location} • {session.date}</p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select your preferred language</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400">
                    <option>IST (UTC+5:30)</option>
                    <option>PST (UTC-8)</option>
                    <option>EST (UTC-5)</option>
                    <option>GMT (UTC+0)</option>
                    <option>JST (UTC+9)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose your timezone for accurate scheduling</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'Auto'].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          theme === 'Light'
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{theme}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button className="px-6 py-3 bg-pink-400 text-white font-medium rounded-lg hover:bg-pink-500 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;