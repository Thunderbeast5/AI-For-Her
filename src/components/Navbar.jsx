import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon, BellIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import GoogleTranslate from './GoogleTranslate'
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const langDropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
  ]

  const changeLanguage = (lang) => {
    setShowLangDropdown(false)
    
    // Wait for Google Translate to load, then trigger it
    const attemptTranslate = (attempts = 0) => {
      const googleTranslateSelect = document.querySelector('.goog-te-combo')
      
      if (googleTranslateSelect) {
        googleTranslateSelect.value = lang.code
        googleTranslateSelect.dispatchEvent(new Event('change'))
        console.log('Language changed to:', lang.nativeName)
      } else if (attempts < 10) {
        // Retry up to 10 times with 200ms delay
        setTimeout(() => attemptTranslate(attempts + 1), 200)
      } else {
        console.error('Google Translate widget not found')
      }
    }
    
    attemptTranslate()
  }

  // Get user name and initials from Firebase Auth or display name
  useEffect(() => {
    if (currentUser) {
      const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
      setUserName(name)
      
      // Generate initials - just first letter
      const initials = name.charAt(0).toUpperCase()
      setUserInitials(initials)
    }
  }, [currentUser])

  // Fetch notifications
  useEffect(() => {
    if (!currentUser) return

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = []
      let unread = 0
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        notificationsList.push({ id: doc.id, ...data })
        if (!data.read) unread++
      })
      
      setNotifications(notificationsList)
      setUnreadCount(unread)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white px-6 py-4 border-b-2 border-pink-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Google Translate Widget - Now Visible */}
          <GoogleTranslate />

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <BellIcon className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.link) navigate(notification.link)
                        }}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-pink-200 to-pink-300 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold text-sm">{userInitials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>{t('auth.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
