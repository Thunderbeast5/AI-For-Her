import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EnvelopeIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { currentUser, logout, reloadUser, resendVerificationEmail } = useAuth();
  
  const [isVerified, setIsVerified] = useState(currentUser?.emailVerified || false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const email = currentUser?.email || localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    } else {
      setError('Email not found. Please login again.');
    }

    if (currentUser.emailVerified) {
      setIsVerified(true);
      setMessage('Email successfully verified! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [currentUser, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCheckVerification = async () => {
    setCheckingStatus(true);
    setError('');
    setMessage('');
    try {
      await reloadUser();
      // The onAuthStateChanged listener in AuthContext will update the user state
      // and trigger the first useEffect if emailVerified is true.
      setMessage('Checked verification status. If verified, you will be redirected shortly.');
    } catch (err) {
      console.error('Error reloading user:', err);
      setError('Failed to check verification status. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setMessage('');

    try {
      await resendVerificationEmail();
      setMessage('A new verification email has been sent.');
      setResendCooldown(60);
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(err.message || 'Failed to resend email.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-pink-50 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600">{message || 'Redirecting to your dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to
          </p>
          <p className="text-pink-600 font-semibold mt-1">
            {userEmail}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checkingStatus}
            className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {checkingStatus ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "I've Verified My Email"
            )}
          </button>

          <button
            onClick={handleResend}
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

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Didn't receive the email? Check your spam folder or click resend.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
