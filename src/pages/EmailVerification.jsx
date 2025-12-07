import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { EnvelopeIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EmailVerification = () => {
  const navigate = useNavigate()
  const { currentUser, logout, updateCurrentUser } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerified, setIsVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    // Get email from currentUser or localStorage
    const email = currentUser?.email || localStorage.getItem('userEmail')
    if (email) {
      setUserEmail(email)
    } else {
      setError('Email not found. Please login again.')
    }

    // Check if already verified
    if (currentUser.emailVerified) {
      setIsVerified(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }
  }, [currentUser, navigate])

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (!userEmail) {
      setError('Email not found. Please login again.')
      return
    }

    setVerifying(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email: userEmail,
        otp: otpValue
      })

      setMessage(response.data.message)
      setIsVerified(true)
      
      // Update currentUser in AuthContext to mark email as verified
      if (updateCurrentUser) {
        updateCurrentUser({ emailVerified: true })
      }
      
      // Redirect to role-specific dashboard
      const role = currentUser?.role || localStorage.getItem('userRole')
      setTimeout(() => {
        if (role === 'entrepreneur') {
          navigate('/dashboard') // Entrepreneur dashboard
        } else if (role === 'mentor') {
          navigate('/dashboard') // Mentor dashboard
        } else if (role === 'investor') {
          navigate('/dashboard') // Investor dashboard
        } else {
          navigate('/dashboard') // Default dashboard
        }
      }, 2000)
    } catch (error) {
      console.error('OTP verification error:', error)
      setError(error.response?.data?.message || 'Invalid or expired OTP')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    
    if (!userEmail) {
      setError('Email not found. Please login again.')
      return
    }
    
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: userEmail
      })
      
      setMessage(response.data.message)
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (error) {
      console.error('Error resending OTP:', error)
      setError(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8"
      >
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-pink-600 font-semibold mt-1">
            {userEmail || currentUser?.email || 'your email'}
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter OTP
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200"
          >
            {message}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={verifying || otp.join('').length !== 6}
            className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {verifying ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          <button
            onClick={handleResendOTP}
            disabled={resendCooldown > 0}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 
              ? `Resend OTP (${resendCooldown}s)` 
              : 'Resend OTP'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            Sign out and use a different email
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Didn't receive the OTP? Check your spam folder or click resend.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default EmailVerification
