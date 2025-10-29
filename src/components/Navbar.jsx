import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import GoogleTranslate from './GoogleTranslate'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [userName, setUserName] = useState('')
  const dropdownRef = useRef(null)
  const langDropdownRef = useRef(null)

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

  // Get user name from Firebase Auth or display name
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || 'User')
    }
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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Google Translate Widget - Now Visible */}
          <GoogleTranslate />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
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
