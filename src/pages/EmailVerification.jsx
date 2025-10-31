import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { EnvelopeIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const EmailVerification = () => {
  const navigate = useNavigate()
  const { currentUser, resendVerificationEmail, logout } = useAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [checking, setChecking] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    // Check if already verified
    if (currentUser.emailVerified) {
      setIsVerified(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      return
    }

    // Allow existing users (created before Nov 1, 2025) to skip verification
    const userCreationTime = new Date(currentUser.metadata.creationTime)
    const verificationCutoffDate = new Date('2025-11-01')
    const isExistingUser = userCreationTime < verificationCutoffDate
    
    if (isExistingUser) {
      // Existing test account - redirect to dashboard
      navigate('/dashboard')
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

  const handleCheckVerification = async () => {
    setChecking(true)
    setMessage('')
    
    try {
      // Reload user to get latest email verification status
      await currentUser.reload()
      
      if (currentUser.emailVerified) {
        setIsVerified(true)
        setMessage('Email verified successfully! Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setMessage('Email not verified yet. Please check your inbox and click the verification link.')
      }
    } catch (error) {
      console.error('Error checking verification:', error)
      setMessage('Error checking verification status. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return
    
    try {
      await resendVerificationEmail()
      setMessage('Verification email sent! Please check your inbox.')
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      console.error('Error resending email:', error)
      setMessage('Error sending email. Please try again later.')
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
            We've sent a verification link to
          </p>
          <p className="text-pink-600 font-semibold mt-1">
            {currentUser?.email}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>Return here and click "I've Verified My Email"</span>
            </li>
          </ol>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('successfully') || message.includes('sent')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {checking ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "I've Verified My Email"
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resendCooldown > 0}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 
              ? `Resend Email (${resendCooldown}s)` 
              : 'Resend Verification Email'}
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
          <p>Didn't receive the email? Check your spam folder or click resend.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default EmailVerification
